"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { prepareCvUpload, sendApplication, type ApplicationState } from "@/app/[locale]/careers/actions";
import type { Dictionary } from "@/lib/dictionaries";
import { formTexts } from "@/lib/privacy-content";
import type { Locale } from "@/lib/routes";
import { browserClient } from "@/lib/supabase/browser";
import { ConsentBox } from "./ConsentBox";

const field =
  "mt-2 block w-full rounded-xl border border-rule bg-stone/60 px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-slate/70 hover:border-slate focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-danger";
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Careers form: cover letter and CV (PDF or DOCX, 5 MB). The CV is uploaded straight to the firm's private
 * storage with a one-time link, then the form is sent without the file itself (see careers/actions.ts).
 */
export function ApplicationForm({ locale, contact, careers }: { locale: Locale; contact: Dictionary["contactPage"]; careers: Dictionary["careersPage"] }) {
  const f = formTexts[locale];
  const [state, action, pending] = useActionState<ApplicationState, FormData>(sendApplication, { status: "idle" });
  const [uploading, setUploading] = useState(false);
  const [local, setLocal] = useState<ApplicationState["fieldErrors"]>({});
  const [failed, setFailed] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const startedAt = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-success/30 bg-[#eef6f1] p-8 focus:outline-none">
        <p className="text-ink">{f.applicationSuccess}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = { ...(state.fieldErrors ?? {}), ...local };
  const busy = pending || uploading;
  // A CV already uploaded with an earlier attempt is kept unless a new file is chosen.
  const keptPath = v.cv_path ?? "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !form.current) return;
    setFailed(false);
    const data = new FormData(form.current);
    const file = fileInput.current?.files?.[0];
    const errors: ApplicationState["fieldErrors"] = {};
    for (const key of ["name", "email", "message"] as const) if (!String(data.get(key) ?? "").trim()) errors[key] = f.required;
    if (file) {
      if (!/\.(pdf|docx)$/i.test(file.name)) errors.cv = f.cvType;
      else if (file.size > MAX_BYTES) errors.cv = f.cvSize;
    } else if (!keptPath) errors.cv = f.cvRequired;
    if (data.get("consent") !== "on") errors.consent = f.consentRequired;
    setLocal(errors);
    if (Object.keys(errors).length) return;

    if (file) {
      setUploading(true);
      try {
        const link = await prepareCvUpload({ name: file.name, size: file.size });
        if (!link.ok) {
          if (link.error === "failed") setFailed(true);
          else setLocal({ cv: f[link.error] });
          return;
        }
        const type = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const { error } = await browserClient().storage.from("applications").uploadToSignedUrl(link.path, link.token, file, { contentType: type });
        if (error) {
          setFailed(true);
          return;
        }
        data.set("cv_path", link.path);
        data.set("cv_name", file.name);
      } finally {
        setUploading(false);
      }
    }
    startTransition(() => action(data));
  };

  const label = "block text-[0.9375rem] font-medium";
  const required = <span className="font-normal text-slate">({contact.required})</span>;
  const error = (id: string, text?: string) =>
    text ? (
      <span id={`err-${id}`} className="mt-1.5 block text-[0.875rem] font-normal text-danger">
        {text}
      </span>
    ) : null;

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedAt} type="hidden" name="started_at" defaultValue="0" />
      <input type="hidden" name="cv_path" value={keptPath} />
      <input type="hidden" name="cv_name" value={v.cv_name ?? ""} />
      {/* Anti-spam trap for bots: never shown, unlabelled, skipped by keyboard and screen readers. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden" style={{ display: "none" }}>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {(failed || (state.status === "error" && !state.fieldErrors)) && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-xl border border-danger/30 bg-[#fbefef] px-5 py-4 text-[0.9375rem] text-danger focus:outline-none">
          {f.applicationError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={label}>
          {contact.name} {required}
          <input name="name" required autoComplete="name" defaultValue={v.name} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "err-name" : undefined} className={field} />
          {error("name", err.name)}
        </label>
        <label className={label}>
          {contact.email} {required}
          <input name="email" type="email" required autoComplete="email" defaultValue={v.email} aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "err-email" : undefined} className={field} />
          {error("email", err.email)}
        </label>
        <label className={`${label} sm:col-span-2`}>
          {contact.phone}
          <input name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={field} />
        </label>
      </div>
      <label className={label}>
        {careers.messageLabel} {required}
        <textarea name="message" required rows={8} maxLength={5000} defaultValue={v.message} aria-invalid={err.message ? true : undefined} aria-describedby={err.message ? "err-message" : "hint-message"} className={`${field} resize-y`} />
        <span id="hint-message" className="mt-1.5 block text-[0.8125rem] font-normal leading-relaxed text-slate">
          {careers.messageHint}
        </span>
        {error("message", err.message)}
      </label>
      <label className={label}>
        {careers.cvLabel} {required}
        <span className="mt-2 flex items-center gap-3 rounded-xl border border-dashed border-rule bg-stone/40 px-4 py-3">
          <Paperclip aria-hidden className="h-4 w-4 flex-none text-gold" />
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-invalid={err.cv ? true : undefined}
            aria-describedby={err.cv ? "err-cv" : "hint-cv"}
            onChange={() => setLocal((l) => ({ ...l, cv: undefined }))}
            className="min-w-0 flex-1 text-[0.9375rem] file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-1.5 file:font-display file:text-[0.875rem] file:font-medium file:text-ink"
          />
        </span>
        {keptPath && v.cv_name && <span className="mt-1.5 block text-[0.875rem] font-normal text-ink-soft">{v.cv_name}</span>}
        <span id="hint-cv" className="mt-1.5 block text-[0.8125rem] font-normal text-slate">
          {careers.cvHint}
        </span>
        {error("cv", err.cv)}
      </label>
      <p className="text-[0.8125rem] leading-relaxed text-slate">{f.applicationGuidance}</p>
      <ConsentBox locale={locale} label={f.applicationConsent} invalid={Boolean(err.consent)} />
      <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-gold disabled:opacity-60">
        {busy ? contact.sending : careers.submit}
      </button>
    </form>
  );
}
