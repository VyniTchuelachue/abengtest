import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Phone } from "lucide-react";
import { href, type Locale } from "@/lib/routes";
import { phones, type Dictionary } from "@/lib/dictionaries";
import { formatDate, telHref } from "@/lib/format";
import type { Article } from "@/lib/data";

/**
 * Banner for interior pages: the firm photograph under a charcoal veil,
 * a gold label, the page title and an optional breadcrumb.
 */
export function PageIntro({
  title,
  lede,
  eyebrow,
  crumbs,
  image = "/images/team.jpg",
  children,
}: {
  title: string;
  lede?: string;
  eyebrow?: string;
  crumbs?: { label: string; href?: string }[];
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal text-white">
      <Image src={image} alt="" fill priority sizes="100vw" quality={70} className="-z-10 object-cover opacity-25" style={{ objectPosition: "50% 25%" }} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/40" />
      <div className="shell py-16 md:py-24">
        {crumbs && <Breadcrumb items={crumbs} />}
        {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
        <h1 className="display mt-5 max-w-3xl text-[clamp(2.25rem,1.6rem+3vw,4rem)]">{title}</h1>
        {lede && <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-white/80">{lede}</p>}
        {children}
      </div>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.875rem] text-white/70">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 text-gold" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Gold label + heading (+ optional text), left or centred. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  dark = false,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  dark?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className={`heading mt-5 text-[clamp(1.875rem,1.4rem+2vw,3rem)] ${dark ? "text-white" : "text-ink"}`}>{title}</Tag>
      {lede && <p className={`mt-5 text-[1.0625rem] leading-relaxed ${dark ? "text-white/75" : "text-ink-soft"}`}>{lede}</p>}
    </div>
  );
}

export function ContactBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-stone py-16 md:py-24">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] bg-charcoal px-6 py-12 text-white sm:px-12 md:py-16">
          <div aria-hidden className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/15" />
          <div aria-hidden className="absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-gold/10" />
          <div className="relative grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <p className="eyebrow">{dict.home.contactEyebrow}</p>
              <h2 className="heading mt-5 text-[clamp(1.875rem,1.4rem+2vw,2.75rem)]">{dict.contactBand.title}</h2>
              <p className="mt-4 max-w-xl text-white/75">{dict.contactBand.body}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:flex-col md:items-end lg:flex-row lg:justify-end">
              <Link href={href(locale, "contact")} className="btn btn-gold">
                {dict.common.consult}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <a href={telHref(phones[0])} className="btn btn-outline-light">
                <Phone aria-hidden className="h-4 w-4 text-gold" />
                {phones[0]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Article card used on the home page, the listing and related reads. */
export function ArticleCard({ article, locale, dict }: { article: Article; locale: Locale; dict: Dictionary }) {
  const link = href(locale, "insights", article.slug);
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <Link href={link} tabIndex={-1} aria-hidden className="relative block aspect-[16/10] overflow-hidden bg-stone-deep">
        {article.cover ? (
          <Image src={article.cover} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" style={{ objectPosition: "50% 25%" }} />
        ) : (
          <Image src="/images/crest.png" alt="" width={96} height={96} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
        )}
        {article.category && (
          <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 font-display text-[0.75rem] font-semibold text-ink">{article.category.name}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 text-[0.8125rem] text-slate">
          <CalendarDays aria-hidden className="h-4 w-4 text-gold" />
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        </p>
        <h3 className="heading mt-3 text-[1.25rem]" lang={article.lang}>
          <Link href={link} className="transition-colors group-hover:text-gold-dark">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-3 line-clamp-3 text-[0.9375rem] text-ink-soft" lang={article.lang}>
            {article.excerpt}
          </p>
        )}
        {!article.translated && <p className="mt-3 text-[0.8125rem] text-slate">{dict.insightsPage.translationNote}</p>}
        <span className="more mt-auto pt-5">
          {dict.common.readArticle}
          <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

/** Kept for compact lists (related reads). */
export function ArticleItem({ article, locale, dict }: { article: Article; locale: Locale; dict: Dictionary; withImage?: boolean }) {
  return <ArticleCard article={article} locale={locale} dict={dict} />;
}
