import "server-only";
import { cache } from "react";
import { mediaUrl, publicClient } from "./supabase/public";
import type { ArticleRecord, CategoryRecord, PracticeAreaRecord, TeamGroup, TeamMemberRecord } from "./database.types";
import type { Locale } from "./routes";

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export type Member = {
  id: string;
  slug: string;
  name: string;
  group: TeamGroup;
  title: string;
  bio: string[];
  focusAreas: string[];
  qualifications: string[];
  barAdmission: string | null;
  languages: string[];
  email: string | null;
  linkedin: string | null;
  photo: string | null;
  photoPosition: string;
  /** Photo for the profile page; falls back to the card portrait. */
  profilePhoto: string | null;
  featured: boolean;
  updatedAt: string;
};

/** Partner, senior associates and associates: the people shown as lawyers. */
export function isLawyerGroup(group: TeamGroup): boolean {
  return group === "partner" || group === "senior_associate" || group === "lawyer";
}

/** Second photographs shown on profile pages only (cards keep the studio portrait). */
const profilePhotos: Record<string, string> = {
  "abeng-roland": "/images/profile/abeng-roland-v1.jpg",
  "doly-azangue": "/images/profile/doly-azangue-v1.jpg",
  "jean-patrick-musima": "/images/profile/jean-patrick-musima-v1.jpg",
};

function toMember(row: TeamMemberRecord, locale: Locale): Member {
  const l = <K extends string>(key: K) => row[`${key}_${locale}` as keyof TeamMemberRecord];
  const other = locale === "en" ? "fr" : "en";
  const bio = (l("bio") as string) || (row[`bio_${other}` as keyof TeamMemberRecord] as string) || "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.full_name,
    group: row.group_key,
    title: (l("title") as string) || (row[`title_${other}` as keyof TeamMemberRecord] as string),
    bio: bio.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    focusAreas: l("focus_areas") as string[],
    qualifications: l("qualifications") as string[],
    barAdmission: l("bar_admission") as string | null,
    languages: l("languages") as string[],
    email: row.email,
    linkedin: row.linkedin_url,
    photo: mediaUrl(row.photo_path),
    photoPosition: row.photo_position,
    profilePhoto: profilePhotos[row.slug] ?? mediaUrl(row.photo_path),
    featured: row.featured,
    updatedAt: row.updated_at,
  };
}

/** One list in the firm's chosen order (set in the dashboard), not split by position. */
const fetchTeamRows = cache(async () => {
  const { data, error } = await publicClient(["team"])
    .from("team_members")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("full_name", { ascending: true });
  if (error) throw new Error(`Team could not be loaded: ${error.message}`);
  return data ?? [];
});

export async function getTeam(locale: Locale): Promise<Member[]> {
  return (await fetchTeamRows()).map((r) => toMember(r, locale));
}

export async function getMember(slug: string, locale: Locale): Promise<Member | null> {
  const row = (await fetchTeamRows()).find((r) => r.slug === slug);
  return row ? toMember(row, locale) : null;
}

// ---------------------------------------------------------------------------
// Practice areas
// ---------------------------------------------------------------------------
export type PracticeArea = {
  id: string;
  slug: string;
  slugs: Record<Locale, string>;
  title: string;
  summary: string;
  /** Full description, one string per paragraph. */
  body: string[];
  scope: string[];
};

function toArea(row: PracticeAreaRecord, locale: Locale): PracticeArea {
  const slugs = { en: row.slug, fr: row.slug_fr };
  const body = locale === "en" ? row.body_en : row.body_fr;
  return {
    id: row.id,
    slug: slugs[locale],
    slugs,
    title: locale === "en" ? row.title_en : row.title_fr,
    summary: locale === "en" ? row.summary_en : row.summary_fr,
    body: body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    scope: locale === "en" ? row.scope_en : row.scope_fr,
  };
}

/** Published areas in the order set in the dashboard. */
const fetchAreaRows = cache(async () => {
  const { data, error } = await publicClient(["practice"])
    .from("practice_areas")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("title_en");
  if (error) throw new Error(`Practice areas could not be loaded: ${error.message}`);
  return data ?? [];
});

export async function getPracticeAreas(locale: Locale): Promise<PracticeArea[]> {
  return (await fetchAreaRows()).map((r) => toArea(r, locale));
}

/** Finds an area by either language's slug, so language switching can redirect. */
export async function getPracticeArea(slug: string, locale: Locale): Promise<PracticeArea | null> {
  const row = (await fetchAreaRows()).find((r) => r.slug === slug || r.slug_fr === slug);
  return row ? toArea(row, locale) : null;
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------
export type Category = { id: string; slug: string; name: string };

export type Article = {
  id: string;
  slug: string;
  /** Language the text is actually written in (falls back when untranslated). */
  lang: Locale;
  translated: boolean;
  availableIn: Locale[];
  title: string;
  excerpt: string;
  body: string;
  cover: string | null;
  coverAlt: string;
  publishedAt: string;
  updatedAt: string;
  category: Category | null;
  author: { slug: string; name: string; title: string } | null;
};

type ArticleRow = ArticleRecord & {
  category: CategoryRecord | null;
  author: Pick<TeamMemberRecord, "slug" | "full_name" | "title_en" | "title_fr"> | null;
};

function toCategory(row: CategoryRecord, locale: Locale): Category {
  return { id: row.id, slug: row.slug, name: locale === "en" ? row.name_en : row.name_fr };
}

function toArticle(row: ArticleRow, locale: Locale): Article {
  const availableIn = (["en", "fr"] as const).filter((l) => (row[`title_${l}`] ?? "").trim() !== "");
  const lang: Locale = availableIn.includes(locale) ? locale : availableIn[0];
  const pick = (key: "title" | "excerpt" | "body" | "cover_alt") => (row[`${key}_${lang}` as keyof ArticleRecord] as string | null) ?? "";
  return {
    id: row.id,
    slug: row.slug,
    lang,
    translated: lang === locale,
    availableIn: [...availableIn],
    title: pick("title"),
    excerpt: pick("excerpt"),
    body: pick("body"),
    cover: mediaUrl(row.cover_path),
    coverAlt: pick("cover_alt"),
    publishedAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
    category: row.category ? toCategory(row.category, locale) : null,
    author: row.author
      ? { slug: row.author.slug, name: row.author.full_name, title: locale === "en" ? row.author.title_en : row.author.title_fr }
      : null,
  };
}

const articleSelect = "*, category:article_categories(*), author:team_members(slug, full_name, title_en, title_fr)";

const fetchArticleRows = cache(async () => {
  const { data, error } = await publicClient(["articles", "categories", "team"])
    .from("articles")
    .select(articleSelect)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(`Articles could not be loaded: ${error.message}`);
  return (data ?? []) as unknown as ArticleRow[];
});

export async function getArticles(locale: Locale, opts: { category?: string; limit?: number } = {}): Promise<Article[]> {
  let rows = await fetchArticleRows();
  if (opts.category) rows = rows.filter((r) => r.category?.slug === opts.category);
  if (opts.limit) rows = rows.slice(0, opts.limit);
  return rows.map((r) => toArticle(r, locale));
}

export async function getArticle(slug: string, locale: Locale): Promise<Article | null> {
  const row = (await fetchArticleRows()).find((r) => r.slug === slug);
  return row ? toArticle(row, locale) : null;
}

export async function getCategories(locale: Locale): Promise<Category[]> {
  const { data, error } = await publicClient(["categories"]).from("article_categories").select("*").order("sort_order");
  if (error) throw new Error(`Categories could not be loaded: ${error.message}`);
  return (data ?? []).map((c) => toCategory(c, locale));
}

/** Converts an article preview row (dashboard) into the public shape. */
export function articleFromRecord(row: ArticleRow, locale: Locale): Article {
  return toArticle(row, locale);
}
