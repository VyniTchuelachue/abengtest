import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ContactBand, PageIntro } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { MemberCard } from "@/components/site/Portrait";
import { getTeam } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";
import { teamListSchema } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.teamPage.metaTitle,
    description: dict.teamPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "team"), fr: href("fr", "team") }, locale),
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  // One team, in the order set in the dashboard.
  const team = await getTeam(locale);

  return (
    <>
      <PageIntro
        title={dict.teamPage.title}
        lede={dict.teamPage.lede}
        eyebrow={dict.home.teamEyebrow}
        crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.teamPage.title }]}
      />

      <section aria-labelledby="our-team" className="py-20 md:py-24">
        <div className="shell">
          <h2 id="our-team" className="heading text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">
            {dict.teamPage.allTitle}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <li key={m.id}>
                <Link href={href(locale, "team", m.slug)} className="group block">
                  <MemberCard
                    name={m.name}
                    title={m.title}
                    src={m.photo}
                    position={m.photoPosition}
                    pendingLabel={dict.common.photoPending}
                    sizes="(min-width: 1024px) 30vw, (min-width: 480px) 45vw, 100vw"
                  />
                  <span className="more mt-4 px-1">
                    {dict.common.readProfile}
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recruitment */}
      <section className="border-t border-rule py-16 md:py-20">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="heading text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)]">{dict.teamPage.joinTitle}</h2>
            <p className="mt-3 text-ink-soft">{dict.teamPage.joinBody}</p>
          </div>
          <Link href={href(locale, "careers")} className="btn btn-gold self-start whitespace-nowrap md:self-auto">
            {dict.teamPage.joinCta}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
      <JsonLd data={teamListSchema(team, locale)} />
    </>
  );
}
