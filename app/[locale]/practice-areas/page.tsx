import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactBand, PageIntro, SectionHeading } from "@/components/site/blocks";
import { SectorIcon } from "@/components/site/icons";
import { PracticePhotoCard } from "@/components/site/PracticePhotoCard";
import { getPracticeAreas } from "@/lib/data";
import { practicePhoto } from "@/lib/photos";
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
                <PracticePhotoCard
                  href={href(locale, "practice", a.slug)}
                  slug={a.slugs.en}
                  title={a.title}
                  summary={a.summary}
                  image={practicePhoto(a.slugs.en)}
                  moreLabel={dict.common.learnMore}
                  tone="light"
                  headingLevel="h2"
                />
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
