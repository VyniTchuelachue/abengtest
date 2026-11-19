import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/blocks";
import { LinkedText, NoticeDate } from "@/components/site/LegalText";
import { getDictionary } from "@/lib/dictionaries";
import { websiteInformation } from "@/lib/privacy-content";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: websiteInformation[locale].title,
    description: websiteInformation[locale].paragraphs[0],
    alternates: alternatesFor({ en: href("en", "websiteInfo"), fr: href("fr", "websiteInfo") }, locale),
  };
}

/** The firm's website information notice (lib/privacy-content.ts). */
export default async function WebsiteInformationPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = websiteInformation[locale];

  return (
    <>
      <PageIntro title={t.title} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />
      <section className="py-16 md:py-20">
        <div className="shell max-w-3xl">
          <NoticeDate locale={locale} />
          <div className="prose-legal mt-10">
            {t.paragraphs.map((p) => (
              <p key={p}>
                <LinkedText text={p} />
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
