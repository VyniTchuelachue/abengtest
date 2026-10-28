import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { PageIntro } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";
import { firmEmail, getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.careersPage.metaTitle,
    description: dict.careersPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "careers"), fr: href("fr", "careers") }, locale),
  };
}

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.careersPage;
  // "Careers" / "Recrutement" in the contact subjects, so applications are easy to spot in the dashboard.
  const subject = dict.contactPage.subjects[2];

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />

      <section className="py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="heading text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)]">{t.emailTitle}</h2>
            <a href={`mailto:${firmEmail}`} className="mt-5 flex items-center gap-3 break-all font-display text-[1.125rem] font-semibold text-ink transition-colors hover:text-gold-dark">
              <Mail aria-hidden className="h-5 w-5 flex-none text-gold" />
              {firmEmail}
            </a>
            <a href={`mailto:${firmEmail}?subject=${encodeURIComponent(t.emailSubject)}`} className="btn btn-gold mt-8">
              {t.emailCta}
            </a>
          </div>
          <div className="lg:col-span-7">
            <div className="card p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.45)] sm:p-10">
              <h2 className="heading mb-8 text-[clamp(1.5rem,1.3rem+0.8vw,2rem)]">{t.formTitle}</h2>
              <ContactForm locale={locale} t={dict.contactPage} fixedSubject={subject} messageLabel={t.messageLabel} submitLabel={t.submit} notice={null} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
