"use server";

import { localized } from "@/lib/admin-i18n/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_LOCALE_COOKIE, isAdminLocale } from "@/lib/admin-i18n";
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

export async function changePassword(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return localized(await changePasswordCore(prev, formData));
}

async function changePasswordCore(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireStaff();
  const parsed = passwordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: "Le mot de passe n'a pas pu être modifié. Réessayez." };
  return { ok: true, message: "Mot de passe modifié." };
}

/** Remembers the dashboard language (FR/EN switch). Open to signed-out visitors: it only sets a preference. */
export async function setAdminLocale(locale: string) {
  if (!isAdminLocale(locale)) return;
  (await cookies()).set(ADMIN_LOCALE_COOKIE, locale, { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
}
