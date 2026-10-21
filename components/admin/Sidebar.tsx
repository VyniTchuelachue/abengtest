"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string; badge?: number };

export function Sidebar({ items, footer }: { items: Item[]; footer: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 bg-ink px-5 py-3 text-paper lg:hidden">
        <span className="font-serif text-lg">Administration</span>
        <button type="button" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen((v) => !v)} className="px-2 py-1 text-[0.9375rem]">
          {open ? "Fermer" : "Menu"}
        </button>
      </div>
      <aside
        id="admin-nav"
        className={`${open ? "block" : "hidden"} bg-ink text-mist lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col`}
      >
        <Link href="/admin" className="hidden items-center gap-3 border-b border-white/10 px-6 py-6 lg:flex">
          <Image src="/images/crest.png" alt="" width={36} height={36} />
          <span className="leading-tight">
            <span className="block font-serif text-[1.0625rem] text-paper">Abeng Law</span>
            <span className="block text-[0.75rem]">Administration</span>
          </span>
        </Link>
        <nav aria-label="Administration" className="flex-1 px-3 py-4">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center justify-between rounded-sm px-3 py-2.5 text-[0.9375rem] transition-colors hover:bg-white/5 hover:text-paper aria-[current=page]:bg-white/10 aria-[current=page]:text-paper"
                >
                  {item.label}
                  {item.badge ? (
                    <span className="rounded-full bg-brass px-2 py-0.5 text-[0.75rem] font-medium text-white">{item.badge}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-white/10 px-6 py-5 text-[0.875rem]">{footer}</div>
      </aside>
    </>
  );
}
