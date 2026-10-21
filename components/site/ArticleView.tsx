import Image from "next/image";
import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";
import type { Article } from "@/lib/data";
import type { Dictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/format";
import { href, type Locale } from "@/lib/routes";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { Breadcrumb } from "./blocks";

/** Article body shared by the public page and the dashboard preview. */
export function ArticleView({ article, locale, dict, crumbs = true }: { article: Article; locale: Locale; dict: Dictionary; crumbs?: boolean }) {
  return (
    <article lang={article.lang}>
      <header className="bg-charcoal text-white">
        <div className={`shell pt-12 md:pt-16 ${article.cover ? "pb-36 md:pb-48" : "pb-16 md:pb-20"}`}>
          {crumbs && (
            <div lang={locale}>
              <Breadcrumb items={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.common.backToInsights, href: href(locale, "insights") }, { label: article.title }]} />
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[0.875rem] text-white/75" lang={locale}>
            {article.category && (
              <Link href={`${href(locale, "insights")}?category=${article.category.slug}`} className="eyebrow">
                {article.category.name}
              </Link>
            )}
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden className="h-4 w-4 text-gold" />
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
            </span>
            {article.author && (
              <Link href={href(locale, "team", article.author.slug)} className="inline-flex items-center gap-2 transition-colors hover:text-gold">
                <UserRound aria-hidden className="h-4 w-4 text-gold" />
                {article.author.name}
              </Link>
            )}
          </div>
          <h1 className="display mt-6 max-w-4xl text-[clamp(2.25rem,1.6rem+2.8vw,4rem)]">{article.title}</h1>
          {article.excerpt && <p className="mt-6 max-w-3xl text-[1.125rem] leading-relaxed text-white/80">{article.excerpt}</p>}
          {!article.translated && (
            <p className="mt-6 text-[0.875rem] text-white/60" lang={locale}>
              {dict.insightsPage.translationNote}
            </p>
          )}
        </div>
      </header>

      {article.cover && (
        <figure className="shell -mt-28 md:-mt-36">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-stone shadow-[0_40px_80px_-45px_rgb(0_0_0/0.6)]">
            <Image
              src={article.cover}
              alt={article.coverAlt}
              fill
              priority
              quality={80}
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          {article.coverAlt && <figcaption className="mt-3 text-[0.8125rem] text-slate">{article.coverAlt}</figcaption>}
        </figure>
      )}

      <div className="shell grid py-16 md:grid-cols-12 md:py-20">
        <div className="prose-legal md:col-span-8 md:col-start-3" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body) }} />
      </div>
    </article>
  );
}
