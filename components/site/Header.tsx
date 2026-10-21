"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { href, switchLocalePath, type Locale, type RouteKey } from "@/lib/routes";
import type { Dictionary } from "@/lib/dictionaries";

type Props = { locale: Locale; nav: Dictionary["nav"]; phones: string[] };

const items: Exclude<RouteKey, "home" | "contact">[] = ["firm", "practice", "team", "insights"];

export function Header({ locale, nav, phones }: Props) {
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
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-paper/92 backdrop-blur-md supports-[backdrop-filter]:bg-paper/85">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        {nav.skip}
      </a>
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Link href={href(locale)} aria-label={nav.home} className="flex items-center gap-3">
          <Image src="/images/crest.png" alt="" width={44} height={44} priority className="h-10 w-10 lg:h-11 lg:w-11" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[1.0625rem] tracking-[-0.005em] text-ink lg:text-[1.1875rem]">The Abeng Law Firm</span>
            <span className="mt-1 text-2xs text-slate">Douala, {locale === "fr" ? "Cameroun" : "Cameroon"}</span>
          </span>
        </Link>

        <nav aria-label={nav.primary} className="hidden items-center gap-1 lg:flex">
          {items.map((key) => (
            <Link
              key={key}
              href={href(locale, key)}
              aria-current={isActive(key) ? "page" : undefined}
              className="relative px-3 py-2 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink after:absolute after:inset-x-3 after:-bottom-[1.3rem] after:h-px after:bg-brass after:opacity-0 aria-[current=page]:after:opacity-100"
            >
              {nav[key]}
            </Link>
          ))}
          <span className="mx-3 h-5 w-px bg-rule" aria-hidden />
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            lang={other}
            aria-label={nav.switchAria}
            className="px-2 py-2 text-[0.875rem] text-slate transition-colors hover:text-ink"
          >
            {other.toUpperCase()}
          </Link>
          <Link href={href(locale, "contact")} className="btn btn-quiet ml-3 min-h-10 px-4 py-2 text-[0.875rem]">
            {nav.contact}
          </Link>
        </nav>

        <button
          ref={menuButton}
          type="button"
          className="-mr-2 flex h-11 items-center gap-2 px-2 text-[0.9375rem] text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? nav.close : nav.menu}
          <span aria-hidden className="relative block h-3 w-5">
            <span className={`absolute left-0 h-px w-5 bg-ink transition-transform duration-200 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-px w-5 bg-ink transition-transform duration-200 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto border-t border-rule bg-paper lg:hidden"
      >
        <nav aria-label={nav.primary} className="shell flex min-h-full flex-col py-8">
          <ul className="flex flex-col">
            {[...items, "contact" as const].map((key) => (
              <li key={key} className="border-b border-rule">
                <Link
                  href={href(locale, key)}
                  aria-current={isActive(key) ? "page" : undefined}
                  className="heading block py-4 text-[2rem] text-ink aria-[current=page]:text-brass"
                >
                  {nav[key]}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-end justify-between gap-6 pt-10 text-[0.9375rem]">
            <div className="flex flex-col gap-1 text-ink-soft">
              {phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/[^\d+]/g, "")}`} className="link">
                  {p}
                </a>
              ))}
            </div>
            <Link href={switchLocalePath(pathname, other)} hrefLang={other} lang={other} className="link text-ink">
              {nav.switchLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
