"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PracticeIcon } from "./icons";
import { PhotoLayer, usePhotoReveal } from "./PhotoReveal";

type Props = {
  href: string;
  slug: string;
  title: string;
  summary: string;
  /** Omitted for areas without a photo yet: the card stays plain. */
  image?: string;
  moreLabel: string;
  /** "dark" on the home page's charcoal section, "light" on the practice-areas page. */
  tone?: "dark" | "light";
  headingLevel?: "h2" | "h3";
};

/** Practice-area card whose photo fades in behind the text (see usePhotoReveal). */
export function PracticePhotoCard({ href, slug, title, summary, image, moreLabel, tone = "dark", headingLevel: Heading = "h3" }: Props) {
  const bind = usePhotoReveal<HTMLAnchorElement>();
  const light = tone === "light";
  // On a light card the text turns white once the photo shows.
  const revealed = image ? "group-hover:text-white group-data-[active=true]:text-white" : "";

  return (
    <Link
      {...bind}
      href={href}
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[1.25rem] p-7 transition-colors ${
        light
          ? "border border-rule bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:border-gold data-[active=true]:border-gold"
          : "border border-white/10 bg-white/[0.04] hover:border-gold/60 data-[active=true]:border-gold/60"
      }`}
    >
      {image && <PhotoLayer src={image} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />}
      <span className="icon-tile">
        <PracticeIcon slug={slug} className="h-6 w-6" />
      </span>
      <Heading className={`mt-6 font-display text-[1.25rem] font-semibold leading-snug transition-colors ${light ? `text-ink ${revealed}` : ""}`}>{title}</Heading>
      {summary && (
        <p
          className={`mt-3 text-[0.9375rem] leading-relaxed transition-colors ${
            light
              ? `text-ink-soft ${image ? "group-hover:text-white/85 group-data-[active=true]:text-white/85" : ""}`
              : "text-white/70 group-hover:text-white/85 group-data-[active=true]:text-white/85"
          }`}
        >
          {summary}
        </p>
      )}
      <span
        className={`mt-auto inline-flex items-center gap-2 pt-6 font-display text-[0.9375rem] font-semibold transition-colors ${
          light ? `text-gold-dark ${image ? "group-hover:text-gold group-data-[active=true]:text-gold" : ""}` : "text-gold"
        }`}
      >
        {moreLabel}
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
