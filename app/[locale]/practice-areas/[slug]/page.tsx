import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb, ContactBand } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { Portrait } from "@/components/site/Portrait";
import { getAreaMembers, getPracticeArea, getPracticeAreas } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/structured-data";

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
      <Breadcrumb items={[{ label: dict.common.backToPractice, href: href(locale, "practice") }, { label: area.title }]} />

      <section className="shell grid gap-8 pb-16 pt-12 md:grid-cols-12 md:pb-24 md:pt-16">
        <div className="md:col-span-8">
          <p className="text-[0.9375rem] text-slate">{t.groups[area.group]}</p>
          <h1 className="display mt-4 text-[clamp(2.5rem,1.7rem+3.2vw,4.5rem)]">{area.title}</h1>
        </div>
        <p className="lede md:col-span-7">{area.summary}</p>
      </section>

      {area.scope.length > 0 && (
        <section className="bg-stone">
          <div className="shell grid gap-8 py-20 md:grid-cols-12 md:py-24">
            <h2 className="heading text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] md:col-span-4">{t.scopeTitle}</h2>
            <ul className="md:col-span-7 md:col-start-6">
              {area.scope.map((s) => (
                <li key={s} className="border-t border-rule py-4 font-serif text-[1.1875rem] leading-snug last:border-b">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {contacts.length > 0 && (
        <section className="shell py-20 md:py-28">
          <h2 className="heading border-b border-ink pb-4 text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{t.contactsTitle}</h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5">
            {contacts.map((m) => (
              <li key={m.id}>
                <Link href={href(locale, "team", m.slug)} className="group block">
                  <Portrait
                    name={m.name}
                    src={m.photo}
                    position={m.photoPosition}
                    pendingLabel={dict.common.photoPending}
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 24vw, 46vw"
                  />
                  <p className="mt-3 font-serif text-[1.125rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {m.name}
                  </p>
                  <p className="mt-1 text-[0.875rem] text-slate">{m.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-rule">
          <div className="shell grid gap-8 py-20 md:grid-cols-12">
            <h2 className="font-sans text-[0.9375rem] font-medium md:col-span-4">{t.relatedTitle}</h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-8">
              {related.map((a) => (
                <li key={a.id}>
                  <Link href={href(locale, "practice", a.slug)} className="link font-serif text-[1.125rem]">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactBand locale={locale} dict={dict} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.practice, path: href(locale, "practice") },
          { name: area.title, path: href(locale, "practice", area.slug) },
        ])}
      />
    </>
  );
}
