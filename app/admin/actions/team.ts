"use server";

import { localized } from "@/lib/admin-i18n/server";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff, type ActionResult } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { refreshPublic } from "@/lib/revalidate";

const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 40),
  );
const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v ?? "");
const nullable = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));

const schema = z.object({
  id: z.string().optional().transform((v) => (v ? v : null)),
  full_name: z.string().trim().min(2, "Indiquez le nom complet.").max(120),
  slug: z.string().trim().max(100).optional(),
  group_key: z.enum(["partner", "senior_associate", "lawyer", "paralegal", "administration"]),
  status: z.enum(["published", "hidden", "inactive"]),
  featured: z.string().optional().transform((v) => v === "on"),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().email("Adresse email invalide.").nullable()),
  linkedin_url: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().regex(/^https:\/\/([a-z]+\.)?linkedin\.com\//i, "L'adresse doit commencer par https://www.linkedin.com/").nullable()),
  photo_path: nullable(300),
  photo_position: z.enum(["50% 15%", "50% 20%", "50% 30%", "50% 50%"]).catch("50% 20%"),
  title_fr: text(160),
  title_en: text(160),
  bio_fr: text(12000),
  bio_en: text(12000),
  focus_areas_fr: lines,
  focus_areas_en: lines,
  qualifications_fr: lines,
  qualifications_en: lines,
  bar_admission_fr: nullable(240),
  bar_admission_en: nullable(240),
  languages_fr: lines,
  languages_en: lines,
});

export type MemberActionResult = ActionResult & { savedAt?: number };

export async function saveMember(prev: MemberActionResult, formData: FormData): Promise<MemberActionResult> {
  return localized(await saveMemberCore(prev, formData));
}

async function saveMemberCore(_: MemberActionResult, formData: FormData): Promise<MemberActionResult> {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, message: "Le profil n'a pas été enregistré. Corrigez les champs signalés.", fieldErrors };
  }
  const { id, slug: rawSlug, ...d } = parsed.data;
  if (!d.title_fr && !d.title_en) {
    return { ok: false, message: "Indiquez la fonction, au moins en français.", fieldErrors: { title_fr: "Indiquez la fonction." } };
  }
  const existing = id ? (await supabase.from("team_members").select("slug, photo_path, sort_order").eq("id", id).maybeSingle()).data : null;
  if (id && !existing) return { ok: false, message: "Ce profil n'existe plus." };

  const slug = await uniqueSlug(supabase, slugify(rawSlug || "") || existing?.slug || slugify(d.full_name), id);

  // New profiles go to the end of the team list.
  let sort_order = existing?.sort_order ?? 0;
  if (!existing) {
    const { data: last } = await supabase.from("team_members").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    sort_order = (last?.sort_order ?? 0) + 10;
  }

  const record = { ...d, slug, sort_order, title_fr: d.title_fr || d.title_en, title_en: d.title_en || d.title_fr };
  let memberId = id;
  if (memberId) {
    const { error } = await supabase.from("team_members").update(record).eq("id", memberId);
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  } else {
    const { data, error } = await supabase.from("team_members").insert(record).select("id").single();
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
    memberId = data.id;
  }

  if (existing?.photo_path && existing.photo_path !== d.photo_path && existing.photo_path.startsWith("team/")) {
    await supabase.storage.from("media").remove([existing.photo_path]);
  }

  refreshPublic("team");
  if (!id) redirect(`/admin/equipe/${memberId}?ok=cree`);
  return {
    ok: true,
    message: d.status === "published" ? "Profil enregistré. Les modifications sont visibles sur le site." : "Profil enregistré (non visible sur le site).",
    savedAt: Date.now(),
  };
}

/** Swaps a profile with its neighbour in the team list. */
export async function moveMember(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  const { data: all } = await supabase.from("team_members").select("id, sort_order").order("sort_order").order("full_name");
  const list = all ?? [];
  const index = list.findIndex((m) => m.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  // Re-number the whole list so equal or missing values never stall the move.
  await Promise.all(list.map((m, i) => supabase.from("team_members").update({ sort_order: (i + 1) * 10 }).eq("id", m.id)));
  refreshPublic("team");
  refresh();
}

export async function setMemberStatus(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["published", "hidden", "inactive"]).parse(formData.get("status"));
  await supabase.from("team_members").update({ status }).eq("id", id);
  refreshPublic("team");
  refresh();
}

export async function deleteMember(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const { data } = await supabase.from("team_members").select("photo_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) redirect(`/admin/equipe/${id}?erreur=suppression`);
  if (data?.photo_path?.startsWith("team/")) await supabase.storage.from("media").remove([data.photo_path]);
  refreshPublic("team", "articles");
  redirect("/admin/equipe?ok=supprime");
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"], base: string, ownId: string | null) {
  const root = base || "membre";
  const { data } = await supabase.from("team_members").select("id, slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== ownId).map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}
