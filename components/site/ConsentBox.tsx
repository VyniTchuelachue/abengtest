import Link from "next/link";
import { formTexts, privacyNotice } from "@/lib/privacy-content";
import { href, type Locale } from "@/lib/routes";

/**
 * Shown on both forms, as the firm's notice requires: the consent box (unticked, required), the short
 * privacy text with the link to the notice, and the guidance for people under 18.
 */
export function ConsentBox({ locale, label, invalid }: { locale: Locale; label: string; invalid: boolean }) {
  const t = formTexts[locale];
  return (
    <div className="space-y-3">
      <label className={`flex items-start gap-3 rounded-xl border p-4 text-[0.9375rem] ${invalid ? "border-danger bg-[#fbefef]" : "border-rule bg-stone/40"}`}>
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={invalid ? true : undefined}
          aria-describedby={invalid ? "err-consent" : undefined}
          className="mt-1 h-4 w-4 flex-none accent-gold"
        />
        <span>{label}</span>
      </label>
      {invalid && (
        <p id="err-consent" className="text-[0.875rem] text-danger">
          {t.consentRequired}
        </p>
      )}
      <p className="text-[0.8125rem] leading-relaxed text-slate">
        {t.shortPrivacy}{" "}
        <Link href={href(locale, "privacy")} className="link font-medium text-ink">
          {privacyNotice[locale].link}
        </Link>
      </p>
      <p className="text-[0.8125rem] leading-relaxed text-slate">{t.under18}</p>
    </div>
  );
}
