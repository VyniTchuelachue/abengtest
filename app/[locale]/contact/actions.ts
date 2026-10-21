"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { anonClient } from "@/lib/supabase/public";
import { isLocale } from "@/lib/routes";

export type ContactState = {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<"name" | "email" | "message", true>>;
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
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "email" || key === "message") fieldErrors[key] = true;
    }
    return { status: "error", fieldErrors, values };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (hits.length >= 5) return { status: "error", values };
  recent.set(ip, [...hits, now]);

  const { name, email, phone, subject, message, locale } = parsed.data;
  const { error } = await anonClient()
    .from("contact_messages")
    .insert({ name, email, phone: phone || null, subject: subject || null, message, locale: isLocale(locale) ? locale : "en" });
  if (error) {
    console.error("contact message insert failed", error.message);
    return { status: "error", values };
  }

  await notifyByEmail({ name, email, phone, subject, message });
  return { status: "success" };
}

/** Optional email alert through Resend when RESEND_API_KEY and CONTACT_NOTIFY_EMAIL are set. */
async function notifyByEmail(m: { name: string; email: string; phone?: string; subject?: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Site Abeng Law <onboarding@resend.dev>",
        to: [to],
        reply_to: m.email,
        subject: `Nouveau message du site : ${m.subject || "Demande"}`,
        text: `${m.name} <${m.email}>${m.phone ? ` — ${m.phone}` : ""}\n\n${m.message}`,
      }),
    });
  } catch (err) {
    console.error("contact notification failed", err);
  }
}
