"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Photo that fades in behind a card: on hover or keyboard focus with a mouse,
 * and on phones when the card is touched or crosses the middle of the screen
 * while scrolling. Spread `bind` on the card, which must have the `group` class.
 */
export function usePhotoReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "-40% 0px -40% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, "data-active": active, onTouchStart: () => setActive(true) };
}

/** The photo and its dark veil; place first inside a `relative isolate overflow-hidden group` card. */
export function PhotoLayer({ src, sizes }: { src: string; sizes: string }) {
  return (
    <span aria-hidden className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[active=true]:opacity-100">
      <Image src={src} alt="" fill sizes={sizes} className="scale-105 object-cover transition-transform duration-700 group-hover:scale-100 group-data-[active=true]:scale-100" />
      <span className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/70 to-charcoal/35" />
    </span>
  );
}

/** A non-link box with a revealed photo (e.g. the firm page's "How we work"). */
export function PhotoRevealBox({ image, sizes, className, children }: { image: string; sizes: string; className: string; children: React.ReactNode }) {
  const bind = usePhotoReveal<HTMLDivElement>();
  return (
    <div {...bind} className={`group relative isolate overflow-hidden ${className}`}>
      <PhotoLayer src={image} sizes={sizes} />
      {children}
    </div>
  );
}
