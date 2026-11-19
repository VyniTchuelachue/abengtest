import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/blocks";
import { LinkedText, NoticeDate } from "@/components/site/LegalText";
import { getDictionary } from "@/lib/dictionaries";
import { privacyNotice } from "@/lib/privacy-content";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = privacyNotice[locale];
  return {
    title: t.searchTitle,
    description: t.searchDescription,
    alternates: alternatesFor({ en: href("en", "privacy"), fr: href("fr", "privacy") }, locale),
  };
}

/** The firm's privacy notice, as adopted on 19 November 2026 (lib/privacy-content.ts). */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = privacyNotice[locale];

  return (
    <>
      <PageIntro title={t.title} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />
      <section className="py-16 md:py-20">
        <div className="shell max-w-3xl">
          <NoticeDate locale={locale} />
          <div className="prose-legal mt-10">
            {t.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p}>
                    <LinkedText text={p} />
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
