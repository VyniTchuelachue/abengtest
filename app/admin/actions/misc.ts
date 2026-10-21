"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff, type ActionResult } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { refreshPublic } from "@/lib/revalidate";
import { secretClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/routes";

// Messages ----------------------------------------------------------------------
export async function setMessageStatus(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["new", "read", "archived"]).parse(formData.get("status"));
  await supabase.from("contact_messages").update({ status }).eq("id", id);
  redirect(`/admin/messages${status === "archived" ? "" : `#m-${id}`}`);
}

export async function deleteMessage(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("contact_messages").delete().eq("id", id);
  redirect("/admin/messages?ok=supprime");
}

// Categories --------------------------------------------------------------------
const categorySchema = z.object({
  id: z.string().optional().transform((v) => (v ? v : null)),
  name_fr: z.string().trim().min(2, "Indiquez le nom en français.").max(80),
  name_en: z.string().trim().min(2, "Indiquez le nom en anglais.").max(80),
});

export async function saveCategory(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const { id, name_fr, name_en } = parsed.data;
  if (id) {
    const { error } = await supabase.from("article_categories").update({ name_fr, name_en }).eq("id", id);
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  } else {
    const { count } = await supabase.from("article_categories").select("id", { count: "exact", head: true });
    const { error } = await supabase
      .from("article_categories")
      .insert({ name_fr, name_en, slug: slugify(name_en), sort_order: ((count ?? 0) + 1) * 10 });
    if (error) return { ok: false, message: error.code === "23505" ? "Une catégorie porte déjà ce nom." : `Enregistrement impossible : ${error.message}` };
  }
  refreshPublic("categories", "articles");
  return { ok: true, message: id ? "Catégorie modifiée." : "Catégorie ajoutée." };
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  await supabase.from("article_categories").delete().eq("id", id);
  refreshPublic("categories", "articles");
  redirect("/admin/categories?ok=supprime");
}

// Users -------------------------------------------------------------------------
const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  full_name: z.string().trim().max(120).optional(),
  role: z.enum(["admin", "editor"]),
});

export async function inviteStaff(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const secret = secretClient();
  if (!secret) return { ok: false, message: "Les invitations nécessitent la clé secrète Supabase sur le serveur (SUPABASE_SECRET_KEY)." };
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message };
  const { email, full_name, role } = parsed.data;

  const { data, error } = await secret.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/compte?bienvenue=1`,
    data: { full_name },
  });
  if (error || !data.user) return { ok: false, message: `Invitation impossible : ${error?.message ?? "erreur inconnue"}` };

  const { error: staffError } = await supabase.from("staff").upsert({ user_id: data.user.id, email, full_name: full_name || null, role });
  if (staffError) return { ok: false, message: `Accès non enregistré : ${staffError.message}` };
  return { ok: true, message: `Invitation envoyée à ${email}.` };
}

export async function updateStaffRole(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const target = z.string().uuid().parse(formData.get("user_id"));
  const role = z.enum(["admin", "editor"]).parse(formData.get("role"));
  if (target !== userId) await supabase.from("staff").update({ role }).eq("user_id", target);
  redirect("/admin/utilisateurs");
}

export async function removeStaff(formData: FormData) {
  const { supabase, userId } = await requireAdmin();
  const target = z.string().uuid().parse(formData.get("user_id"));
  if (target === userId) redirect("/admin/utilisateurs?erreur=soi");
  await supabase.from("staff").delete().eq("user_id", target);
  // Also close the login itself when the server can.
  await secretClient()?.auth.admin.deleteUser(target);
  redirect("/admin/utilisateurs?ok=retire");
}
