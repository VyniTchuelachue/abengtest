import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/lib/routes";
import { phones, type Dictionary } from "@/lib/dictionaries";
import { formatDate, telHref } from "@/lib/format";
import type { Article } from "@/lib/data";

/** Title block shared by interior pages. */
export function PageIntro({ title, lede, children }: { title: string; lede?: string; children?: React.ReactNode }) {
  return (
    <section className="shell pb-14 pt-14 md:pb-20 md:pt-20">
      <div className="grid gap-8 md:grid-cols-12">
        <h1 className="display text-[clamp(2.75rem,2rem+3.6vw,5rem)] md:col-span-7">{title}</h1>
        {lede && <p className="lede self-end md:col-span-5">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="shell pt-8 text-[0.875rem] text-slate">
      <ol className="flex flex-wrap items-center gap-x-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-rule">/</span>}
            {item.href ? (
              <Link href={item.href} className="link">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-soft">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ContactBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-ink text-paper">
      <div className="shell grid gap-10 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7">
          <h2 className="heading text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)]">{dict.contactBand.title}</h2>
          <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-mist">{dict.contactBand.body}</p>
          <Link href={href(locale, "contact")} className="btn btn-light mt-10">
            {dict.common.consult}
          </Link>
        </div>
        <dl className="grid content-end gap-8 text-[0.9375rem] sm:grid-cols-2 md:col-span-5 md:grid-cols-1 lg:grid-cols-2">
          <div>
            <dt className="text-brass-soft">{dict.contactBand.phone}</dt>
            <dd className="mt-2 space-y-1">
              {phones.map((p) => (
                <a key={p} href={telHref(p)} className="link block">
                  {p}
                </a>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-brass-soft">{dict.contactBand.address}</dt>
            <dd className="mt-2 leading-relaxed text-mist">
              {dict.address.lines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/** Article row used on the home page, the listing and related reads. */
export function ArticleItem({ article, locale, dict, withImage = false }: { article: Article; locale: Locale; dict: Dictionary; withImage?: boolean }) {
  const link = href(locale, "insights", article.slug);
  return (
    <article className="group grid gap-6 border-t border-rule py-8 md:grid-cols-12 md:gap-8">
      <div className="text-[0.875rem] text-slate md:col-span-3">
        <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
        {article.category && <p className="mt-1 text-ink-soft">{article.category.name}</p>}
      </div>
      <div className={withImage && article.cover ? "md:col-span-6" : "md:col-span-8"}>
        <h3 className="heading text-[clamp(1.5rem,1.2rem+1vw,2rem)]" lang={article.lang}>
          <Link href={link} className="decoration-1 underline-offset-[0.2em] group-hover:underline">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-3 max-w-2xl text-ink-soft" lang={article.lang}>
            {article.excerpt}
          </p>
        )}
        {!article.translated && <p className="mt-3 text-[0.8125rem] text-slate">{dict.insightsPage.translationNote}</p>}
      </div>
      {withImage && article.cover && (
        <Link href={link} tabIndex={-1} aria-hidden className="relative block aspect-[4/3] overflow-hidden bg-stone md:col-span-3">
          <Image src={article.cover} alt="" fill sizes="(min-width: 768px) 22vw, 100vw" className="object-cover object-top" />
        </Link>
      )}
    </article>
  );
}
