import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleCard, ContactBand, PageIntro } from "@/components/site/blocks";
import { getArticles, getCategories } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
};

const PAGE_SIZE = 12;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { category, page } = await searchParams;
  const dict = getDictionary(locale);
  return {
    title: dict.insightsPage.metaTitle,
    description: dict.insightsPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "insights"), fr: href("fr", "insights") }, locale),
    // Filtered and paginated views are for people, not for the index.
    robots: category || page ? { index: false, follow: true } : undefined,
  };
}

export default async function InsightsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { category, page } = await searchParams;
  const dict = getDictionary(locale);
  const t = dict.insightsPage;

  const [categories, all] = await Promise.all([getCategories(locale), getArticles(locale)]);
  const active = categories.find((c) => c.slug === category);
  const filtered = active ? all.filter((a) => a.category?.slug === active.slug) : all;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(pageCount, Math.max(1, Number(page) || 1));
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const used = new Set(all.map((a) => a.category?.slug));

  const linkFor = (opts: { category?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (opts.category) q.set("category", opts.category);
    if (opts.page && opts.page > 1) q.set("page", String(opts.page));
    const s = q.toString();
    return `${href(locale, "insights")}${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} eyebrow={dict.home.newsEyebrow} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />

      <section className="bg-stone py-16 md:py-20">
        <div className="shell">
          <nav aria-label={t.filterLabel} className="flex flex-wrap gap-2">
            {[{ slug: undefined as string | undefined, name: t.all }, ...categories.filter((c) => used.has(c.slug))].map((c) => {
              const isActive = (c.slug ?? null) === (active?.slug ?? null);
              return (
                <Link
                  key={c.slug ?? "all"}
                  href={linkFor({ category: c.slug })}
                  aria-current={isActive ? "page" : undefined}
                  className="rounded-full border border-rule bg-white px-5 py-2.5 font-display text-[0.875rem] font-medium text-ink-soft transition-colors hover:border-gold aria-[current=page]:border-gold aria-[current=page]:bg-gold aria-[current=page]:text-ink"
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>

          {items.length === 0 ? (
            <p className="card mt-10 p-10 text-center text-slate">{t.empty}</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
              {current > 1 && (
                <Link className="btn btn-quiet" href={linkFor({ category: active?.slug, page: current - 1 })}>
                  <ChevronLeft aria-hidden className="h-4 w-4" />
                  {t.previous}
                </Link>
              )}
              <span className="px-3 font-display text-[0.9375rem] text-slate">
                {current} / {pageCount}
              </span>
              {current < pageCount && (
                <Link className="btn btn-quiet" href={linkFor({ category: active?.slug, page: current + 1 })}>
                  {t.next}
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
