"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useTransition } from "react";
import { setAdminLocale } from "@/app/admin/actions/session";
import { translator, type AdminLocale, type Translate } from "@/lib/admin-i18n";

const Context = createContext<{ locale: AdminLocale; t: Translate }>({ locale: "fr", t: translator("fr") });

export function AdminI18nProvider({ locale, children }: { locale: AdminLocale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: translator(locale) }), [locale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useT(): Translate {
  return useContext(Context).t;
}

export function useAdminLocale(): AdminLocale {
  return useContext(Context).locale;
}

/** FR / EN switch, styled like the public site's header switch. */
export function LanguageSwitch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { locale, t } = useContext(Context);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: AdminLocale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setAdminLocale(next);
      router.refresh();
    });
  };

  const base = tone === "dark" ? "text-white/55 hover:text-white" : "text-slate hover:text-ink";
  const active = tone === "dark" ? "text-white" : "text-ink";

  return (
    <div role="group" aria-label={t("Langue de l'administration")} aria-busy={pending} className="flex items-center font-display text-[0.8125rem] font-semibold tracking-wide">
      {(["fr", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className={`mx-1.5 ${tone === "dark" ? "text-white/30" : "text-rule"}`}>/</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={locale === l}
            aria-label={l === "fr" ? "Français" : "English"}
            onClick={() => choose(l)}
            className={`rounded px-1 py-0.5 transition-colors ${locale === l ? active : base} ${locale === l ? "underline decoration-gold decoration-2 underline-offset-4" : ""}`}
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
