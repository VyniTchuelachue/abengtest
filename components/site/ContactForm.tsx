"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessage, type ContactState } from "@/app/[locale]/contact/actions";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/routes";

const field =
  "mt-2 block w-full rounded-xl border border-rule bg-stone/60 px-4 py-3 text-[1rem] text-ink transition-colors placeholder:text-slate/70 hover:border-slate focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-danger";

export function ContactForm({ locale, t }: { locale: Locale; t: Dictionary["contactPage"] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const startedAt = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  // Records when the form became interactive (bots tend to submit instantly).
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-2xl border border-success/30 bg-[#eef6f1] p-8 focus:outline-none">
        <h3 className="heading text-[1.75rem]">{t.successTitle}</h3>
        <p className="mt-3 text-ink-soft">{t.successBody}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedAt} type="hidden" name="started_at" defaultValue="0" />
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="rounded-xl border border-danger/30 bg-[#fbefef] px-5 py-4 text-[0.9375rem] text-danger focus:outline-none">
          {t.errorBody}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-[0.9375rem] font-medium">
          {t.name} <span className="font-normal text-slate">({t.required})</span>
          <input name="name" required autoComplete="name" defaultValue={v.name} aria-invalid={err.name ? true : undefined} aria-describedby={err.name ? "err-name" : undefined} className={field} />
          {err.name && <span id="err-name" className="mt-1.5 block text-[0.875rem] font-normal text-danger">{t.errors.name}</span>}
        </label>
        <label className="block text-[0.9375rem] font-medium">
          {t.email} <span className="font-normal text-slate">({t.required})</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={v.email} aria-invalid={err.email ? true : undefined} aria-describedby={err.email ? "err-email" : undefined} className={field} />
          {err.email && <span id="err-email" className="mt-1.5 block text-[0.875rem] font-normal text-danger">{t.errors.email}</span>}
        </label>
        <label className="block text-[0.9375rem] font-medium">
          {t.phone}
          <input name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} className={field} />
        </label>
        <label className="block text-[0.9375rem] font-medium">
          {t.subject}
          <select name="subject" defaultValue={v.subject || t.subjects[0]} className={field}>
            {t.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-[0.9375rem] font-medium">
        {t.message} <span className="font-normal text-slate">({t.required})</span>
        <textarea name="message" required rows={7} minLength={10} maxLength={5000} defaultValue={v.message} aria-invalid={err.message ? true : undefined} aria-describedby={err.message ? "err-message" : undefined} className={`${field} resize-y`} />
        {err.message && <span id="err-message" className="mt-1.5 block text-[0.875rem] font-normal text-danger">{t.errors.message}</span>}
      </label>
      <p className="text-[0.8125rem] leading-relaxed text-slate">{t.disclaimer}</p>
      <button type="submit" disabled={pending} className="btn btn-gold disabled:opacity-60">
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
