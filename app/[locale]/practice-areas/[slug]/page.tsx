import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ContactBand, PageIntro, SectionHeading } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { getPracticeArea, getPracticeAreas } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return [];
  const areas = await getPracticeAreas(params.locale);
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const area = await getPracticeArea(slug, locale);
  if (!area) return {};
  return {
    title: area.title,
    description: area.summary,
    alternates: alternatesFor({ en: href("en", "practice", area.slugs.en), fr: href("fr", "practice", area.slugs.fr) }, locale),
  };
}

export default async function PracticeAreaPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const area = await getPracticeArea(slug, locale);
  if (!area) notFound();
  // Arrived with the other language's slug (e.g. from the language switch).
  if (area.slug !== slug) permanentRedirect(href(locale, "practice", area.slug));

  const dict = getDictionary(locale);
  const t = dict.practicePage;

  return (
    <>
      <PageIntro
        title={area.title}
        lede={area.summary}
        eyebrow={dict.home.practiceEyebrow}
        crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.common.backToPractice, href: href(locale, "practice") }, { label: area.title }]}
      />

      {(area.body.length > 0 || area.scope.length > 0) && (
        <section className="py-20 md:py-24">
          <div className="shell max-w-4xl">
            {area.body.length > 0 && (
              <div className="prose-legal">
                {area.body.map((p, i) => (
                  <p key={i} className={i === 0 ? "text-[1.1875rem] text-ink" : undefined}>
                    {p}
                  </p>
                ))}
              </div>
            )}
            {area.scope.length > 0 && (
              <div className={area.body.length > 0 ? "mt-14" : undefined}>
                <SectionHeading title={t.scopeTitle} />
                <ul className="mt-8 grid gap-3 md:grid-cols-2">
                  {area.scope.map((s) => (
                    <li key={s} className="card flex items-start gap-4 p-5">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-6 w-6 flex-none text-gold" />
                      <span className="text-[1rem] text-ink">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* The page's single invitation to get in touch. */}
      <ContactBand locale={locale} dict={dict} />
      <JsonLd data={serviceSchema(area, locale)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.practice, path: href(locale, "practice") },
          { name: area.title, path: href(locale, "practice", area.slug) },
        ])}
      />
    </>
  );
}
