"use client";

import Image from "next/image";
import { LanguageSwitch, useT } from "./i18n";

/** Sign-in and password pages: the site's charcoal intro on one side, the form card on the other. */
export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <main className="grid min-h-dvh bg-stone lg:grid-cols-2">
      <div className="relative isolate hidden overflow-hidden bg-charcoal text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <Image src="/images/team-v2.jpg" alt="" fill priority sizes="50vw" quality={70} className="-z-10 object-cover opacity-25" style={{ objectPosition: "40% 20%" }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/80 to-charcoal/40" />
        <div className="flex items-center gap-3">
          <Image src="/images/crest.png" alt="" width={52} height={52} className="h-13 w-13" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.1875rem] font-semibold tracking-tight">The Abeng Law Firm</span>
            <span className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-gold">{t("Avocats d'affaires")}</span>
          </span>
        </div>
        <div>
          <p className="eyebrow">{t("Administration")}</p>
          <p className="display mt-6 max-w-md text-[clamp(2.25rem,1.6rem+2vw,3.25rem)]">{t("L'espace de gestion du site")}</p>
          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-white/75">
            {t("Actualités, profils de l'équipe et messages reçus, publiés en français et en anglais.")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:invisible">
              <Image src="/images/crest.png" alt="" width={48} height={48} className="h-12 w-12" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.0625rem] font-semibold tracking-tight text-ink">The Abeng Law Firm</span>
                <span className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-gold-dark">{t("Administration")}</span>
              </span>
            </div>
            <LanguageSwitch tone="light" />
          </div>
          <div className="card p-7 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.45)] sm:p-9">
            <h1 className="heading text-[2rem]">{title}</h1>
            {intro && <p className="mt-2 text-ink-soft">{intro}</p>}
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
