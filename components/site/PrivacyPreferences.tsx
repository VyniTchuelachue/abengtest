"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MapPin, X } from "lucide-react";
import { formTexts, privacyNotice } from "@/lib/privacy-content";
import { href, type Locale } from "@/lib/routes";

/**
 * Optional third-party tools need the visitor's prior consent (privacy notice, section 3). The only one
 * on the site is the Google map on the Contact page: it loads only once accepted here. The choice stays in
 * this browser (localStorage, no cookie) and can be changed at any time from the footer.
 */
type Prefs = { maps: boolean };
const KEY = "privacy-preferences";
const CHANGED = "privacy-preferences-changed";
const OPEN = "privacy-preferences-open";

function readPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
}
function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage blocked: the choice applies to this page only.
  }
  window.dispatchEvent(new CustomEvent(CHANGED, { detail: prefs }));
}

let current: Prefs | null | undefined;
function subscribe(callback: () => void) {
  const onChange = (e: Event) => {
    current = (e as CustomEvent<Prefs>).detail ?? readPrefs();
    callback();
  };
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}
const snapshot = () => (current === undefined ? (current = readPrefs()) : current);

/** The visitor's choices, or null before they have made one (and on the server). */
export function usePrivacyPrefs(): Prefs | null {
  return useSyncExternalStore(subscribe, snapshot, () => null);
}

export const openPrivacyPreferences = () => window.dispatchEvent(new Event(OPEN));

/** Footer link that opens the preferences. */
export function PrivacyPreferencesButton({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <button type="button" onClick={openPrivacyPreferences} className={className}>
      {formTexts[locale].preferencesLabel}
    </button>
  );
}

/** The preferences dialog, mounted once per page by the layout. */
export function PrivacyPreferencesDialog({ locale }: { locale: Locale }) {
  const t = formTexts[locale];
  const notice = privacyNotice[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const [maps, setMaps] = useState(false);

  useEffect(() => {
    const open = () => {
      setMaps(readPrefs()?.maps ?? false);
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN, open);
    return () => window.removeEventListener(OPEN, open);
  }, []);

  const choose = (next: Prefs) => {
    savePrefs(next);
    dialog.current?.close();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="privacy-preferences-title"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(34rem,calc(100vw-1.5rem))] rounded-[1.25rem] bg-white p-0 text-ink backdrop:bg-black/60"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="privacy-preferences-title" className="heading text-[1.5rem]">
            {t.preferencesLabel}
          </h2>
          <button type="button" onClick={() => dialog.current?.close()} aria-label={locale === "fr" ? "Fermer" : "Close"} className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone hover:bg-stone-deep">
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        {notice.sections[2].paragraphs.map((p) => (
          <p key={p} className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
        <p className="mt-3 text-[0.9375rem]">
          <a href={href(locale, "privacy")} className="link">
            {notice.link}
          </a>
        </p>
        <label className="mt-6 flex items-start gap-3 rounded-xl border border-rule p-4 text-[0.9375rem]">
          <input type="checkbox" checked={maps} onChange={(e) => setMaps(e.target.checked)} className="mt-1 h-4 w-4 accent-gold" />
          <span>
            <span className="font-medium">Google Maps</span>
            <span className="block text-slate">Contact</span>
          </span>
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => choose({ maps: false })} className="btn btn-quiet">
            {t.rejectOptional}
          </button>
          <button type="button" onClick={() => choose({ maps })} className="btn btn-gold">
            {t.acceptSelected}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** The office map: loads Google Maps only after the visitor has accepted it. */
export function ConsentedMap({ locale, src, title }: { locale: Locale; src: string; title: string }) {
  const prefs = usePrivacyPrefs();
  if (prefs?.maps) {
    return <iframe title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="icon-tile">
        <MapPin aria-hidden className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="font-display text-[1.0625rem] font-semibold text-ink">Google Maps</p>
      <button type="button" onClick={openPrivacyPreferences} className="btn btn-quiet">
        {formTexts[locale].preferencesLabel}
      </button>
    </div>
  );
}
