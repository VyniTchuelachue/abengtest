import type { MetadataRoute } from "next";
import { getArticles, getPracticeAreas, getTeam } from "@/lib/data";
import { href, siteUrl, type Locale, type RouteKey } from "@/lib/routes";

export const revalidate = 3600;

function entry(paths: Record<Locale, string>, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap {
  const languages = { en: `${siteUrl}${paths.en}`, fr: `${siteUrl}${paths.fr}` };
  return (["en", "fr"] as const).map((l) => ({
    url: `${siteUrl}${paths[l]}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [team, areas, articles] = await Promise.all([getTeam("en"), getPracticeAreas("en"), getArticles("en")]);
  const pages: [RouteKey, number][] = [
    ["home", 1],
    ["firm", 0.8],
    ["practice", 0.8],
    ["team", 0.8],
    ["insights", 0.7],
    ["contact", 0.7],
  ];

  return [
    ...pages.flatMap(([key, priority]) => entry({ en: href("en", key), fr: href("fr", key) }, undefined, priority)),
    ...areas.flatMap((a) => entry({ en: href("en", "practice", a.slugs.en), fr: href("fr", "practice", a.slugs.fr) }, undefined, 0.7)),
    ...team.flatMap((m) => entry({ en: href("en", "team", m.slug), fr: href("fr", "team", m.slug) }, m.updatedAt, 0.6)),
    ...articles.flatMap((a) =>
      a.availableIn.map((l) => ({
        url: `${siteUrl}${href(l, "insights", a.slug)}`,
        lastModified: new Date(a.updatedAt),
        priority: 0.6,
        alternates: { languages: Object.fromEntries(a.availableIn.map((x) => [x, `${siteUrl}${href(x, "insights", a.slug)}`])) },
      })),
    ),
  ];
}
