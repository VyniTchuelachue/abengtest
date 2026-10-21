"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff, type ActionResult } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/connexion?info=deconnecte");
}

const passwordSchema = z
  .object({
    password: z.string().min(10, "Le mot de passe doit contenir au moins 10 caractères."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Les deux mots de passe ne correspondent pas.", path: ["confirm"] });

export async function changePassword(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const parsed = passwordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "Le mot de passe n'a pas pu être modifié. Réessayez." };
  return { ok: true, message: "Mot de passe modifié." };
}
