"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Recognition } from "@/lib/recognitions";

type Labels = { enlarge: string; close: string; previous: string; next: string };

/** Award photos in same-size frames (shown whole), with a full-size viewer. */
export function AwardGallery({ items, labels, columns = 4 }: { items: Recognition[]; labels: Labels; columns?: 3 | 4 }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const current = items[index];

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const step = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <>
      <ul className={`grid grid-cols-2 gap-4 sm:gap-5 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {items.map((r, i) => (
          <li key={r.id}>
            <figure className="card flex h-full flex-col overflow-hidden">
              <button type="button" onClick={() => open(i)} className="group relative block aspect-square w-full bg-stone-deep" aria-label={`${labels.enlarge}: ${r.issuer}${r.year ? ` ${r.year}` : ""}`}>
                <Image
                  src={r.image}
                  alt=""
                  fill
                  sizes={columns === 4 ? "(min-width: 1024px) 22vw, 48vw" : "(min-width: 1024px) 20vw, 48vw"}
                  className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span aria-hidden className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="h-4 w-4" />
                </span>
              </button>
              <figcaption className="flex-1 p-4 sm:p-5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[0.875rem] font-semibold leading-snug text-ink sm:text-[0.9375rem]">{r.issuer}</span>
                  {r.year && <span className="rounded-full bg-gold px-2.5 py-0.5 font-display text-[0.75rem] font-bold text-ink">{r.year}</span>}
                </span>
                <span className="mt-2 block text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem]">{r.title}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={current ? `${current.issuer}${current.year ? ` ${current.year}` : ""}` : undefined}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto h-[min(94dvh,56rem)] w-[min(64rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.25rem] bg-charcoal p-0 text-white backdrop:bg-black/80"
      >
        {current && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4 px-5 pt-4">
              <p className="min-w-0 pt-1.5 text-[0.9375rem]">
                <span className="font-display font-semibold">{current.issuer}</span>
                {current.year && <span className="ml-2 text-gold">{current.year}</span>}
              </p>
              <button type="button" onClick={() => dialog.current?.close()} aria-label={labels.close} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mx-5 my-4 min-h-0 flex-1">
              <Image key={current.id} src={current.image} alt={current.title} fill sizes="(min-width: 1024px) 64rem, 100vw" quality={85} className="object-contain" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
              <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold text-ink">
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <p className="text-center text-[0.875rem] text-white/75">{current.title}</p>
              <button type="button" onClick={() => step(1)} aria-label={labels.next} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold text-ink">
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
