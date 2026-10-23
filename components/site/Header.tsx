"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, MapPin, Menu, Phone, X } from "lucide-react";
import { href, switchLocalePath, type Locale, type RouteKey } from "@/lib/routes";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { locale: Locale; nav: Dictionary["nav"]; phones: string[]; consult: string; addressShort: string };

const items: Exclude<RouteKey, "home">[] = ["firm", "practice", "team", "insights", "careers", "contact"];
const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;

export function Header({ locale, nav, phones, consult, addressShort }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const other: Locale = locale === "en" ? "fr" : "en";

  // Close the menu on navigation and with Escape; lock page scroll while open.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (key: RouteKey) => pathname.startsWith(href(locale, key));

  return (
    <header className="sticky top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        {nav.skip}
      </a>

      {/* Utility bar */}
      <div className="hidden bg-night text-[0.8125rem] text-mist md:block">
        <div className="shell flex h-10 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href={tel(phones[0])} className="flex items-center gap-2 transition-colors hover:text-white">
              <Phone aria-hidden className="h-3.5 w-3.5 text-gold" />
              {phones[0]}
            </a>
            <span className="flex items-center gap-2">
              <MapPin aria-hidden className="h-3.5 w-3.5 text-gold" />
              {addressShort}
            </span>
          </div>
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            lang={other}
            aria-label={nav.switchAria}
            className="font-display font-semibold tracking-wide transition-colors hover:text-white"
          >
            <span className={locale === "fr" ? "text-white" : ""}>FR</span>
            <span className="mx-1.5 text-white/30">/</span>
            <span className={locale === "en" ? "text-white" : ""}>EN</span>
          </Link>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-white/10 bg-charcoal/95 backdrop-blur-md">
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6 xl:h-20">
          <Link href={href(locale)} aria-label={nav.home} className="flex items-center gap-3">
            <Image src="/images/crest.png" alt="" width={48} height={48} priority className="h-11 w-11 xl:h-12 xl:w-12" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.0625rem] font-semibold tracking-tight text-white xl:text-[1.1875rem]">The Abeng Law Firm</span>
              <span className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-gold">
                {locale === "fr" ? "Avocats d'affaires" : "Business lawyers"}
              </span>
            </span>
          </Link>

          <nav aria-label={nav.primary} className="hidden items-center gap-1 xl:flex">
            {items.map((key) => (
              <Link
                key={key}
                href={href(locale, key)}
                aria-current={isActive(key) ? "page" : undefined}
                className="relative whitespace-nowrap rounded-full px-3.5 py-2 font-display text-[0.9375rem] font-medium text-white/80 transition-colors hover:text-white aria-[current=page]:text-gold"
              >
                {nav[key]}
              </Link>
            ))}
            <Link href={href(locale, "contact")} className="btn btn-gold ml-4 min-h-11 whitespace-nowrap px-5 py-2">
              <CalendarCheck aria-hidden className="h-4 w-4" />
              {consult}
            </Link>
          </nav>

          <button
            ref={menuButton}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.close : nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto md:top-[7rem] bg-charcoal xl:hidden">
        <nav aria-label={nav.primary} className="shell flex min-h-full flex-col py-6">
          <ul className="flex flex-col">
            {items.map((key) => (
              <li key={key} className="border-b border-white/10">
                <Link
                  href={href(locale, key)}
                  aria-current={isActive(key) ? "page" : undefined}
                  className="block py-4 font-display text-[1.625rem] font-semibold text-white aria-[current=page]:text-gold"
                >
                  {nav[key]}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href(locale, "contact")} className="btn btn-gold mt-8 w-full">
            <CalendarCheck aria-hidden className="h-4 w-4" />
            {consult}
          </Link>
          <div className="mt-auto flex items-end justify-between gap-6 pt-10 text-[0.9375rem] text-mist">
            <div className="flex flex-col gap-2">
              {phones.map((p) => (
                <a key={p} href={tel(p)} className="flex items-center gap-2">
                  <Phone aria-hidden className="h-4 w-4 text-gold" />
                  {p}
                </a>
              ))}
            </div>
            <Link href={switchLocalePath(pathname, other)} hrefLang={other} lang={other} className="rounded-full border border-white/30 px-4 py-2 font-display font-semibold text-white">
              {nav.switchLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
