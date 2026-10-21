import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBand, PageIntro } from "@/components/site/blocks";
import { getPracticeAreas, practiceGroupOrder } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.practicePage.metaTitle,
    description: dict.practicePage.metaDescription,
    alternates: alternatesFor({ en: href("en", "practice"), fr: href("fr", "practice") }, locale),
  };
}

export default async function PracticeAreasPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.practicePage;
  const areas = await getPracticeAreas(locale);

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} />

      {practiceGroupOrder.map((group, gi) => {
        const items = areas.filter((a) => a.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} aria-labelledby={`pg-${group}`} className={gi % 2 === 0 ? "bg-stone" : ""}>
            <div className="shell grid gap-8 py-20 md:grid-cols-12 md:py-24">
              <h2 id={`pg-${group}`} className="heading text-[clamp(1.875rem,1.4rem+1.6vw,2.75rem)] md:col-span-4">
                {t.groups[group]}
              </h2>
              <ul className="md:col-span-8">
                {items.map((a) => (
                  <li key={a.id} className="border-t border-rule last:border-b">
                    <Link href={href(locale, "practice", a.slug)} className="group grid gap-2 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-8">
                      <span className="font-serif text-[1.375rem] leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {a.title}
                      </span>
                      <span className="text-[0.9375rem] text-ink-soft">{a.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <section className="shell grid gap-8 py-24 md:grid-cols-12 md:py-32">
        <h2 className="heading text-[clamp(1.875rem,1.4rem+1.6vw,2.75rem)] md:col-span-4">{t.sectorsTitle}</h2>
        <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-8">
          {t.sectors.map((s) => (
            <li key={s} className="border-t border-rule py-4 font-serif text-[1.125rem]">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
