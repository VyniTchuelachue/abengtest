export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
/** Set by the language switch, so a visitor's own choice wins over their browser's language. */
export const languageCookie = "lang";

/** The visitor's language from the browser's Accept-Language list (by preference, not just its first entry), if it names one of ours. */
export function browserLocale(acceptLanguage: string | null): Locale | null {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = Number(params.find((p) => p.trim().startsWith("q="))?.trim().slice(2) ?? 1);
      return { lang: tag.split("-")[0], q: Number.isFinite(q) ? q : 0, i };
    })
    .filter((e) => e.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return (ranked.find((e) => (locales as readonly string[]).includes(e.lang))?.lang as Locale | undefined) ?? null;
}

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "fr";
}

export type RouteKey = "home" | "firm" | "practice" | "team" | "insights" | "careers" | "contact";

const segments: Record<Exclude<RouteKey, "home">, { en: string; fr: string }> = {
  firm: { en: "firm", fr: "cabinet" },
  practice: { en: "practice-areas", fr: "expertises" },
  team: { en: "team", fr: "equipe" },
  insights: { en: "insights", fr: "actualites" },
  careers: { en: "careers", fr: "recrutement" },
  contact: { en: "contact", fr: "contact" },
};

/** Segments whose French URL differs from the route folder name. */
export const localizedSegments = Object.values(segments).filter((s) => s.en !== s.fr);

/** Public URL path for a page, e.g. href("fr", "team", "abeng-roland") → /fr/equipe/abeng-roland */
export function href(locale: Locale, key: RouteKey = "home", slug?: string): string {
  if (key === "home") return `/${locale}`;
  const base = `/${locale}/${segments[key][locale]}`;
  return slug ? `${base}/${slug}` : base;
}

/**
 * Translates a public path into the other language, keeping any slug.
 * Practice-area detail pages accept either language's slug and redirect.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  const [, segment, ...rest] = parts;
  if (!segment) return `/${target}`;
  const entry = Object.values(segments).find((s) => s.en === segment || s.fr === segment);
  const translated = entry ? entry[target] : segment;
  return `/${[target, translated, ...rest].join("/")}`;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Absolute alternates for hreflang metadata. */
export function alternatesFor(paths: Record<Locale, string>, current: Locale) {
  return {
    canonical: `${siteUrl}${paths[current]}`,
    languages: {
      en: `${siteUrl}${paths.en}`,
      fr: `${siteUrl}${paths.fr}`,
      "x-default": `${siteUrl}${paths.en}`,
    },
  };
}
