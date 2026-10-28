import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ContactBand, PageIntro, SectionHeading } from "@/components/site/blocks";
import { PracticeIcon, SectorIcon } from "@/components/site/icons";
import { getPracticeAreas } from "@/lib/data";
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
      <PageIntro
        title={t.title}
        lede={t.lede}
        eyebrow={dict.home.practiceEyebrow}
        crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]}
      />

      {/* One list, in the order set in the dashboard. */}
      <section className="py-20 md:py-24">
        <div className="shell">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.map((a) => (
              <li key={a.id}>
                <Link href={href(locale, "practice", a.slug)} className="card card-hover group flex h-full flex-col p-7">
                  <span className="icon-tile">
                    <PracticeIcon slug={a.slugs.en} className="h-6 w-6" />
                  </span>
                  <h2 className="mt-6 font-display text-[1.1875rem] font-semibold leading-snug text-ink">{a.title}</h2>
                  {a.summary && <p className="mt-3 text-[0.9375rem] text-ink-soft">{a.summary}</p>}
                  <span className="more mt-auto pt-6">
                    {dict.common.learnMore}
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-24">
        <div className="shell">
          <SectionHeading eyebrow={dict.home.sectorsLabel} title={t.sectorsTitle} dark />
          <ul className="mt-10 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
            {t.sectors.map((s, i) => (
              <li key={s} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gold text-ink">
                  <SectorIcon index={i} className="h-5 w-5" />
                </span>
                <span className="font-display text-[1rem] font-medium leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
