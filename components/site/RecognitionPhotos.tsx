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
            <Image key={current.src} src={current.src} alt={current.label} fill sizes="(min-width: 1024px) 64rem, 100vw" quality={90} className="object-contain" />
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

type Group = { kind: RecognitionKind; title: string; items: Recognition[] };

/**
 * Home page: one switchable tab per kind of recognition (rankings, awards,
 * memberships, contributions), so the kinds are never mixed. Items without a
 * photo (e.g. a network membership) show as a name card.
 */
export function RecognitionTabs({ groups, labels }: { groups: Group[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const group = groups[active];
  const GroupIcon = kindIcons[group.kind];
  const photos = group.items.flatMap((r) => r.photos);
  const { open, viewer } = usePhotoViewer(photos, labels);

  // Arrow keys move between tabs, as in any tab list.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + groups.length) % groups.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label={groups.map((g) => g.title).join(", ")} onKeyDown={onKeyDown} className="flex flex-wrap justify-center gap-2">
        {groups.map((g, i) => {
          const Icon = kindIcons[g.kind];
          const selected = i === active;
          return (
            <button
              key={g.kind}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`rtab-${g.kind}`}
              aria-selected={selected}
              aria-controls={`rpanel-${g.kind}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className="inline-flex items-center gap-2 rounded-full border border-rule bg-white px-5 py-2.5 font-display text-[0.9375rem] font-medium text-ink-soft transition-colors hover:border-gold aria-selected:border-gold aria-selected:bg-gold aria-selected:text-ink"
            >
              <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
              {g.title}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`rpanel-${group.kind}`} aria-labelledby={`rtab-${group.kind}`} className="mt-10">
        <ul className="flex flex-wrap justify-center gap-4 sm:gap-5">
          {group.items.flatMap((r) =>
            r.photos.length
              ? r.photos.map((p) => (
                  <li key={p.src} className="w-[calc(50%-0.5rem)] sm:w-48 lg:w-52">
                    <PhotoButton photo={p} label={labels.enlarge} onOpen={() => open(photos.indexOf(p))} sizes="(min-width: 640px) 13rem, 45vw" className="aspect-[4/5] w-full rounded-xl" />
                    <p className="mt-2 text-center text-[0.8125rem] font-medium leading-snug text-ink">{p.label}</p>
                    {r.recipient && <p className="text-center text-[0.75rem] text-slate">{r.recipient}</p>}
                  </li>
                ))
              : [
                  <li key={r.id} className="w-[calc(50%-0.5rem)] sm:w-48 lg:w-52">
                    <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-4 rounded-xl bg-stone-deep px-4 text-center">
                      <span className="icon-tile">
                        <GroupIcon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                      </span>
                      <span className="font-display text-[1.125rem] font-semibold text-ink">{r.name}</span>
                    </div>
                    {r.recipient && <p className="mt-2 text-center text-[0.75rem] text-slate">{r.recipient}</p>}
                  </li>,
                ],
          )}
        </ul>
      </div>
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
