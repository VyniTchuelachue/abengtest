"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { getDictionary } from "@/lib/dictionaries";
import { notifyByEmail } from "@/lib/notify";
import { formTexts, privacyNoticeVersion } from "@/lib/privacy-content";
import { isLocale, type Locale } from "@/lib/routes";
import { secretClient } from "@/lib/supabase/server";

/**
 * Applications with a CV. The CV goes from the visitor's browser straight to the private "applications"
 * bucket (the host limits request bodies to 4.5 MB, below the 5 MB the firm allows), under pending/ with a
 * one-time upload link issued here. On sending, the server checks the file really is a PDF or a Word
 * document, moves it out of pending/ and stores the application with its consent record.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = "applications";
type Ext = "pdf" | "docx";
const extOf = (name: string): Ext | null => {
  const ext = name.toLowerCase().split(".").pop();
  return ext === "pdf" || ext === "docx" ? ext : null;
};

// Best-effort throttle per server instance.
const recent = new Map<string, number[]>();
async function throttled(limit: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (hits.length >= limit) return true;
  recent.set(ip, [...hits, now]);
  return false;
}

export type CvUpload = { ok: true; path: string; token: string } | { ok: false; error: "cvType" | "cvSize" | "failed" };

/** Issues a one-time link to upload the CV into pending/ once its name and size pass the checks. */
export async function prepareCvUpload(input: { name: string; size: number }): Promise<CvUpload> {
  const ext = extOf(String(input?.name ?? ""));
  if (!ext) return { ok: false, error: "cvType" };
  if (!(input.size > 0) || input.size > MAX_BYTES) return { ok: false, error: "cvSize" };
  if (await throttled(10)) return { ok: false, error: "failed" };
  const supabase = secretClient();
  if (!supabase) return { ok: false, error: "failed" };
  const path = `pending/${randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("cv upload link failed", error?.message);
    return { ok: false, error: "failed" };
  }
  return { ok: true, path, token: data.token };
}

export type ApplicationState = {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<"name" | "email" | "message" | "cv" | "consent", string>>;
  values?: Record<string, string>;
};

const isPdf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-";
/** A .docx is a ZIP holding word/document.xml; macro-enabled documents (vbaProject.bin) are refused. */
const isDocx = (b: Buffer) => b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) && b.includes("word/document.xml") && !b.includes("vbaProject.bin");

export async function sendApplication(_: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const locale: Locale = isLocale(String(formData.get("locale"))) ? (String(formData.get("locale")) as Locale) : "en";
  const f = formTexts[locale];
  const dict = getDictionary(locale);
  const values = Object.fromEntries(["name", "email", "phone", "message", "cv_path", "cv_name"].map((k) => [k, String(formData.get(k) ?? "").trim()]));
  const supabase = secretClient();
  const dropUpload = async () => {
    if (supabase && values.cv_path.startsWith("pending/")) await supabase.storage.from(BUCKET).remove([values.cv_path]);
  };

  // Honeypot and minimum fill time: quietly accept and drop obvious bots.
  const startedAt = Number(formData.get("started_at") ?? 0);
  if (String(formData.get("website") ?? "") !== "" || (startedAt && Date.now() - startedAt < 2500)) {
    await dropUpload();
    return { status: "success" };
  }

  const fieldErrors: ApplicationState["fieldErrors"] = {};
  if (values.name.length < 2) fieldErrors.name = values.name ? dict.contactPage.errors.name : f.required;
  if (!values.email) fieldErrors.email = f.required;
  else if (!z.string().email().safeParse(values.email).success) fieldErrors.email = dict.contactPage.errors.email;
  if (!values.message) fieldErrors.message = f.required;
  else if (values.message.length < 10) fieldErrors.message = dict.contactPage.errors.message;
  const ext = extOf(values.cv_path);
  if (!values.cv_path) fieldErrors.cv = f.cvRequired;
  else if (!/^pending\/[0-9a-f-]{36}\.(pdf|docx)$/.test(values.cv_path) || !ext) fieldErrors.cv = f.cvType;
  if (formData.get("consent") !== "on") fieldErrors.consent = f.consentRequired;
  if (values.name.length > 120) fieldErrors.name = dict.contactPage.errors.name;
  if (values.email.length > 200) fieldErrors.email = dict.contactPage.errors.email;
  values.phone = values.phone.slice(0, 40);
  values.message = values.message.slice(0, 5000);
  // The uploaded file is kept while the visitor corrects other fields, unless it is itself the problem.
  if (Object.keys(fieldErrors).length) {
    if (fieldErrors.cv) await dropUpload();
    return { status: "error", fieldErrors, values: fieldErrors.cv ? { ...values, cv_path: "", cv_name: "" } : values };
  }
  if (!supabase || !ext || (await throttled(5))) return { status: "error", values };

  // Check the file itself, not only its name.
  const { data: blob, error: readError } = await supabase.storage.from(BUCKET).download(values.cv_path);
  if (readError || !blob) return { status: "error", fieldErrors: { cv: f.cvRequired }, values: { ...values, cv_path: "", cv_name: "" } };
  const bytes = Buffer.from(await blob.arrayBuffer());
  if (bytes.length > MAX_BYTES) {
    await dropUpload();
    return { status: "error", fieldErrors: { cv: f.cvSize }, values: { ...values, cv_path: "", cv_name: "" } };
  }
  if (!(ext === "pdf" ? isPdf(bytes) : isDocx(bytes))) {
    await dropUpload();
    return { status: "error", fieldErrors: { cv: f.cvType }, values: { ...values, cv_path: "", cv_name: "" } };
  }

  const finalPath = `${new Date().getUTCFullYear()}/${randomUUID()}.${ext}`;
  const { error: moveError } = await supabase.storage.from(BUCKET).move(values.cv_path, finalPath);
  if (moveError) {
    console.error("cv move failed", moveError.message);
    return { status: "error", values };
  }

  const cvName = (values.cv_name.replace(/[^\p{L}\p{N} ._()-]/gu, "").slice(0, 120) || `CV.${ext}`).replace(/\.(pdf|docx)$/i, "") + `.${ext}`;
  const consent = { consent_at: new Date().toISOString(), consent_purpose: f.applicationConsent, consent_notice_version: privacyNoticeVersion };
  const { error } = await supabase.from("contact_messages").insert({
    kind: "application",
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    subject: dict.contactPage.subjects[2],
    message: values.message,
    locale,
    status: "new",
    cv_path: finalPath,
    cv_name: cvName,
    cv_size: bytes.length,
    ...consent,
  });
  if (error) {
    console.error("application insert failed", error.message);
    await supabase.storage.from(BUCKET).remove([finalPath]);
    return { status: "error", values: { ...values, cv_path: "", cv_name: "" } };
  }

  await notifyByEmail(
    { name: values.name, email: values.email, phone: values.phone, subject: dict.contactPage.subjects[2], message: values.message, locale, consentAt: consent.consent_at },
    { filename: cvName, content: bytes },
  );
  return { status: "success" };
}
