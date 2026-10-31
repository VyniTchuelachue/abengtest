"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Award, BarChart3, ChevronLeft, ChevronRight, Expand, HandHeart, Network, X, type LucideIcon } from "lucide-react";
import type { Recognition, RecognitionKind, RecognitionPhoto } from "@/lib/recognitions";

type Labels = { enlarge: string; close: string; previous: string; next: string };

/** Full-size viewer for a list of award photos; `open(i)` shows photo i. */
function usePhotoViewer(photos: RecognitionPhoto[], labels: Labels) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const current = photos[index];
  const step = (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };

  const viewer = (
    <dialog
      ref={dialog}
      aria-label={current?.label}
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
              <span className="font-display font-semibold">{current.label}</span>
              {current.recipient && <span className="ml-2 text-gold">{current.recipient}</span>}
            </p>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={labels.close} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mx-5 my-4 min-h-0 flex-1">
            <Image key={current.src} src={current.src} alt={current.label} fill sizes="(min-width: 1024px) 64rem, 100vw" quality={85} className="object-contain" />
          </div>
          {photos.length > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
              <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold text-ink">
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <p className="text-[0.875rem] text-white/75">
                {index + 1} / {photos.length}
              </p>
              <button type="button" onClick={() => step(1)} aria-label={labels.next} className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold text-ink">
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );

  return { open, viewer };
}

/** Award photo, shown whole on a stone ground; opens the viewer. */
function PhotoButton({ photo, label, onOpen, sizes, className }: { photo: RecognitionPhoto; label: string; onOpen: () => void; sizes: string; className: string }) {
  return (
    <button type="button" onClick={onOpen} aria-label={`${label}: ${photo.label}`} className={`group relative block overflow-hidden bg-stone-deep ${className}`}>
      <Image src={photo.src} alt="" fill sizes={sizes} className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.04]" />
      <span aria-hidden className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Expand className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

/** A row of award photos (home page). */
export function RecognitionPhotoStrip({ photos, labels }: { photos: RecognitionPhoto[]; labels: Labels }) {
  const { open, viewer } = usePhotoViewer(photos, labels);
  return (
    <>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {photos.map((p, i) => (
          <li key={p.src}>
            <PhotoButton photo={p} label={labels.enlarge} onOpen={() => open(i)} sizes="(min-width: 640px) 15vw, 30vw" className="aspect-[4/5] w-full rounded-xl" />
            <p className="mt-2 text-center text-[0.75rem] leading-snug text-slate">{p.label}</p>
          </li>
        ))}
      </ul>
      {viewer}
    </>
  );
}

const kindIcons: Record<RecognitionKind, LucideIcon> = { ranking: BarChart3, award: Award, membership: Network, contribution: HandHeart };

type Tile = { key: string; r: Recognition; photo?: RecognitionPhoto; year?: string; detail?: string };

/**
 * Recognition by kind (firm page): one section per kind (rankings, awards,
 * memberships, contributions), each with its own grid of photos. Items without
 * a photo (e.g. a network membership) appear as text cards in the same grid.
 */
export function RecognitionList({ groups, labels }: { groups: { kind: RecognitionKind; title: string; items: Recognition[] }[]; labels: Labels }) {
  const photos = groups.flatMap((g) => g.items.flatMap((r) => r.photos));
  const { open, viewer } = usePhotoViewer(photos, labels);

  return (
    <>
      <div className="space-y-14">
        {groups.map(({ kind, title, items }) => {
          const Icon = kindIcons[kind];
          // One tile per photo, captioned with that photo's year. The item's description goes under its
          // first photo, led by the item's own year when the photo is from another edition.
          const tiles = items.flatMap((r): Tile[] =>
            r.photos.length
              ? r.photos.map((p, i) => ({
                  key: p.src,
                  r,
                  photo: p,
                  year: p.year ?? r.year,
                  detail: i === 0 && r.detail ? (r.year && p.year && p.year !== r.year ? `${r.year} : ${r.detail}` : r.detail) : undefined,
                }))
              : [{ key: r.id, r, photo: undefined, year: r.year, detail: r.detail }],
          );
          return (
            <section key={kind} aria-labelledby={`rk-${kind}`}>
              <h3 id={`rk-${kind}`} className="flex items-center gap-4 border-b border-rule pb-4 font-display text-[1.375rem] font-semibold text-ink">
                <span className="icon-tile">
                  <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                </span>
                {title}
              </h3>
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {tiles.map(({ key, r, photo, year, detail }) => (
                  <li key={key} className="card flex flex-col overflow-hidden">
                    {photo ? (
                      <PhotoButton photo={photo} label={labels.enlarge} onOpen={() => open(photos.indexOf(photo))} sizes="(min-width: 1024px) 22vw, 45vw" className="aspect-[4/5] w-full" />
                    ) : (
                      <span aria-hidden className="flex aspect-[4/5] w-full items-center justify-center bg-stone">
                        <span className="icon-tile">
                          <Icon className="h-6 w-6" strokeWidth={1.75} />
                        </span>
                      </span>
                    )}
                    <div className="flex-1 p-4 sm:p-5">
                      <p className="font-display text-[0.9375rem] font-semibold leading-snug text-ink">{r.name}</p>
                      {(r.recipient || year) && <p className="mt-0.5 text-[0.8125rem] text-slate">{[r.recipient, year].filter(Boolean).join(" · ")}</p>}
                      {detail && <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft sm:text-[0.875rem]">{detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {viewer}
    </>
  );
}
