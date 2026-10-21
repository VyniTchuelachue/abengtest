import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/data";
import type { Dictionary } from "@/lib/dictionaries";
import { formatDate } from "@/lib/format";
import { href, type Locale } from "@/lib/routes";
import { sanitizeArticleHtml } from "@/lib/sanitize";

/** Article body shared by the public page and the dashboard preview. */
export function ArticleView({ article, locale, dict }: { article: Article; locale: Locale; dict: Dictionary }) {
  return (
    <article lang={article.lang}>
      <header className="shell grid gap-8 pb-12 pt-12 md:grid-cols-12 md:pb-16 md:pt-16">
        <div className="md:col-span-9">
          <p className="flex flex-wrap gap-x-4 text-[0.9375rem] text-slate">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
            {article.category && (
              <Link href={`${href(locale, "insights")}?category=${article.category.slug}`} className="link text-ink-soft">
                {article.category.name}
              </Link>
            )}
          </p>
          <h1 className="display mt-5 text-[clamp(2.5rem,1.6rem+3.4vw,4.75rem)]">{article.title}</h1>
          {article.excerpt && <p className="lede mt-8 max-w-3xl">{article.excerpt}</p>}
          {!article.translated && (
            <p className="mt-6 text-[0.875rem] text-slate" lang={locale}>
              {dict.insightsPage.translationNote}
            </p>
          )}
          {article.author && (
            <p className="mt-8 text-[0.9375rem]" lang={locale}>
              <span className="text-slate">{dict.insightsPage.by} </span>
              <Link href={href(locale, "team", article.author.slug)} className="link">
                {article.author.name}
              </Link>
              <span className="text-slate">, {article.author.title}</span>
            </p>
          )}
        </div>
      </header>

      {article.cover && (
        <figure className="shell">
          <div className="relative aspect-[16/9] overflow-hidden bg-stone">
            <Image
              src={article.cover}
              alt={article.coverAlt}
              fill
              priority
              quality={80}
              sizes="(min-width: 1312px) 1216px, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          {article.coverAlt && <figcaption className="mt-3 text-2xs text-slate">{article.coverAlt}</figcaption>}
        </figure>
      )}

      <div className="shell grid py-16 md:grid-cols-12 md:py-20">
        <div
          className="prose-legal md:col-span-8 md:col-start-3"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.body) }}
        />
      </div>
    </article>
  );
}
