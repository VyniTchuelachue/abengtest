"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { anonClient } from "@/lib/supabase/public";
import { notifyByEmail } from "@/lib/notify";
import { formTexts, privacyNoticeVersion } from "@/lib/privacy-content";
import { isLocale } from "@/lib/routes";

export type ContactState = {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<"name" | "email" | "message" | "consent", true>>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(200).email(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  locale: z.string(),
});

// Best-effort throttle per server instance; RLS and length checks guard the table itself.
const recent = new Map<string, number[]>();

export async function sendMessage(_: ContactState, formData: FormData): Promise<ContactState> {
  const values = Object.fromEntries(["name", "email", "phone", "subject", "message"].map((k) => [k, String(formData.get(k) ?? "")]));

  // Honeypot and minimum fill time: quietly accept and drop obvious bots.
  const startedAt = Number(formData.get("started_at") ?? 0);
  if (String(formData.get("website") ?? "") !== "" || (startedAt && Date.now() - startedAt < 2500)) {
    return { status: "success" };
  }

  const parsed = schema.safeParse({ ...values, locale: String(formData.get("locale") ?? "en") });
  // Consent is required: the box is unticked by default and nothing is stored without it.
  const consented = formData.get("consent") === "on";
  if (!parsed.success || !consented) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.success ? [] : parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "email" || key === "message") fieldErrors[key] = true;
    }
    if (!consented) fieldErrors.consent = true;
    return { status: "error", fieldErrors, values };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (hits.length >= 5) return { status: "error", values };
  recent.set(ip, [...hits, now]);

  const { name, email, phone, subject, message, locale } = parsed.data;
  const lang = isLocale(locale) ? locale : "en";
  // The consent record: when, for what (the wording shown) and under which version of the privacy notice.
  const consent = { consent_at: new Date().toISOString(), consent_purpose: formTexts[lang].contactConsent, consent_notice_version: privacyNoticeVersion };
  const { error } = await anonClient()
    .from("contact_messages")
    .insert({ name, email, phone: phone || null, subject: subject || null, message, locale: lang, kind: "enquiry", ...consent });
  if (error) {
    console.error("contact message insert failed", error.message);
    return { status: "error", values };
  }

  await notifyByEmail({ name, email, phone, subject, message, locale, consentAt: consent.consent_at });
  return { status: "success" };
}
