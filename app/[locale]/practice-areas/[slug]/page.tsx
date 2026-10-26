import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ContactBand, PageIntro, SectionHeading } from "@/components/site/blocks";
import { PracticeIcon } from "@/components/site/icons";
import { JsonLd } from "@/components/site/JsonLd";
import { MemberCard } from "@/components/site/Portrait";
import { getAreaMembers, getPracticeArea, getPracticeAreas } from "@/lib/data";
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
  const [contacts, all] = await Promise.all([getAreaMembers(area.id, locale), getPracticeAreas(locale)]);
  const related = all.filter((a) => a.group === area.group && a.id !== area.id);

  return (
    <>
      <PageIntro
        title={area.title}
        lede={area.summary}
        eyebrow={t.groups[area.group]}
        crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.common.backToPractice, href: href(locale, "practice") }, { label: area.title }]}
      />

      <section className="py-20 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading title={t.scopeTitle} />
            <ul className="mt-8 grid gap-3">
              {area.scope.map((s) => (
                <li key={s} className="card flex items-start gap-4 p-5">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-6 w-6 flex-none text-gold" />
                  <span className="text-[1rem] text-ink">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-5">
            <div className="rounded-[1.5rem] bg-charcoal p-8 text-white lg:sticky lg:top-32">
              <span className="icon-tile">
                <PracticeIcon slug={area.slugs.en} className="h-6 w-6" />
              </span>
              <p className="mt-6 font-display text-[1.375rem] font-semibold leading-snug">{dict.contactBand.title}</p>
              <p className="mt-3 text-white/75">{dict.contactBand.body}</p>
              <Link href={href(locale, "contact")} className="btn btn-gold mt-8 w-full">
                {dict.common.consult}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {contacts.length > 0 && (
        <section className="bg-stone py-20 md:py-24">
          <div className="shell">
            <SectionHeading eyebrow={dict.home.teamEyebrow} title={t.contactsTitle} />
            <ul className="mt-10 grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-4">
              {contacts.map((m) => (
                <li key={m.id}>
                  <Link href={href(locale, "team", m.slug)} className="block">
                    <MemberCard
                      name={m.name}
                      title={m.title}
                      src={m.photo}
                      position={m.photoPosition}
                      pendingLabel={dict.common.photoPending}
                      sizes="(min-width: 1024px) 22vw, (min-width: 480px) 45vw, 100vw"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="shell">
            <h2 className="font-display text-[1.25rem] font-semibold">{t.relatedTitle}</h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {related.map((a) => (
                <li key={a.id}>
                  <Link href={href(locale, "practice", a.slug)} className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-[0.9375rem] text-ink transition-colors hover:border-gold hover:bg-gold-light">
                    <PracticeIcon slug={a.slugs.en} className="h-4 w-4 text-gold-dark" />
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
