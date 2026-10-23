"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitch, useT } from "./i18n";
import { FolderOpen, LayoutDashboard, Mail, Menu, Newspaper, Shield, UserRound, Users, X, type LucideIcon } from "lucide-react";

type Item = { href: string; label: string; badge?: number };

const icons: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/actualites": Newspaper,
  "/admin/equipe": Users,
  "/admin/messages": Mail,
  "/admin/categories": FolderOpen,
  "/admin/utilisateurs": Shield,
  "/admin/compte": UserRound,
};

function Brand() {
  const t = useT();
  return (
    <span className="flex items-center gap-3 leading-none">
      <Image src="/images/crest.png" alt="" width={44} height={44} className="h-11 w-11" />
      <span className="flex flex-col">
        <span className="font-display text-[1.0625rem] font-semibold tracking-tight text-white">The Abeng Law Firm</span>
        <span className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-gold">{t("Administration")}</span>
      </span>
    </span>
  );
}

export function Sidebar({ items, footer }: { items: Item[]; footer: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between border-b border-white/10 bg-charcoal px-5 lg:hidden">
        <Link href="/admin" aria-label={t("Tableau de bord")}>
          <Brand />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? t("Fermer le menu") : t("Ouvrir le menu")}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-ink"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>
      <aside
        id="admin-nav"
        className={`${open ? "block" : "hidden"} bg-charcoal text-mist lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-72 lg:flex-col`}
      >
        <div className="hidden border-b border-white/10 px-6 py-6 lg:block">
          <Link href="/admin" aria-label={t("Tableau de bord")}>
            <Brand />
          </Link>
          <div className="mt-4">
            <LanguageSwitch />
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 lg:hidden">
          <span className="text-[0.8125rem]">{t("Langue")}</span>
          <LanguageSwitch />
        </div>
        <nav aria-label={t("Administration")} className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = icons[item.href] ?? LayoutDashboard;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-[0.9375rem] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white aria-[current=page]:bg-white/[0.08] aria-[current=page]:text-gold"
                  >
                    <Icon aria-hidden className="h-[1.125rem] w-[1.125rem] flex-none text-white/45 transition-colors group-hover:text-white/80 group-aria-[current=page]:text-gold" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-[0.75rem] font-bold text-ink">{item.badge}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 px-6 py-5 text-[0.875rem]">{footer}</div>
      </aside>
    </>
  );
}
