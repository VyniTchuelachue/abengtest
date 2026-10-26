import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard, ContactBand } from "@/components/site/blocks";
import { ArticleView } from "@/components/site/ArticleView";
import { JsonLd } from "@/components/site/JsonLd";
import { getArticle, getArticles } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { summarize } from "@/lib/format";
import { href, isLocale, siteUrl } from "@/lib/routes";
import { articleSchema, breadcrumbSchema } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const articles = await getArticles("en");
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getArticle(slug, locale);
  if (!article) return {};
  // Untranslated pages point search engines at the language the text is written in.
  const languages: Record<string, string> = Object.fromEntries(article.availableIn.map((l) => [l, `${siteUrl}${href(l, "insights", slug)}`]));
  languages["x-default"] = languages.en ?? languages[article.lang];
  return {
    // Headlines that already name the firm skip the "| The Abeng Law Firm" suffix.
    title: /abeng law firm/i.test(article.title) ? { absolute: article.title } : article.title,
    description: article.excerpt ? summarize(article.excerpt) : undefined,
    alternates: { canonical: `${siteUrl}${href(article.lang, "insights", slug)}`, languages },
    openGraph: {
      type: "article",
      siteName: "The Abeng Law Firm",
      locale: article.lang === "fr" ? "fr_CM" : "en_GB",
      url: href(article.lang, "insights", slug),
      title: article.title,
      description: article.excerpt || undefined,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: article.cover ? [{ url: article.cover, alt: article.coverAlt }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getArticle(slug, locale);
  if (!article) notFound();
  const dict = getDictionary(locale);
  const related = (await getArticles(locale, { limit: 4 })).filter((a) => a.id !== article.id).slice(0, 3);

  return (
    <>
      <ArticleView article={article} locale={locale} dict={dict} />

      {related.length > 0 && (
        <section className="bg-stone py-20 md:py-24">
          <div className="shell">
            <h2 className="heading text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{dict.insightsPage.related}</h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactBand locale={locale} dict={dict} />
      <JsonLd data={articleSchema(article, locale)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.insights, path: href(locale, "insights") },
          { name: article.title, path: href(locale, "insights", article.slug) },
        ])}
      />
    </>
  );
}
