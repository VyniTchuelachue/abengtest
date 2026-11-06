"use server";

import { localized } from "@/lib/admin-i18n/server";
import { z } from "zod";
import { requireAdmin, type ActionResult } from "@/lib/auth";
import { refreshPublic } from "@/lib/revalidate";

const MAX_ITEMS = 6;
const phone = z.string().regex(/^\+?[0-9][0-9 ().-]{5,24}$/);
const email = z.string().email().max(200);

/** One value per line, without blanks or repeats. */
const lines = (value: FormDataEntryValue | null) => [
  ...new Set(
    String(value ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  ),
];

export async function saveSiteContact(prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return localized(await saveSiteContactCore(prev, formData));
}

async function saveSiteContactCore(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const phones = lines(formData.get("phones"));
  const emails = lines(formData.get("emails"));

  const fieldErrors: Record<string, string> = {};
  if (!phones.length) fieldErrors.phones = "Indiquez au moins un numéro.";
  else if (phones.length > MAX_ITEMS) fieldErrors.phones = "Six numéros au maximum.";
  else if (!phones.every((p) => phone.safeParse(p).success)) fieldErrors.phones = "Un numéro n'est pas valide. Exemple : +237 233420208";
  if (!emails.length) fieldErrors.emails = "Indiquez au moins une adresse.";
  else if (emails.length > MAX_ITEMS) fieldErrors.emails = "Six adresses au maximum.";
  else if (!emails.every((e) => email.safeParse(e).success)) fieldErrors.emails = "Une adresse email n'est pas valide.";
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Les coordonnées n'ont pas été enregistrées. Corrigez les champs signalés.", fieldErrors };

  const { error } = await supabase.from("site_contact").update({ phones, emails }).eq("id", true);
  if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  refreshPublic("contact");
  return { ok: true, message: "Coordonnées enregistrées. Elles sont visibles sur le site." };
}
