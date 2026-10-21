import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";
import { getDictionary, officeCoordinates, phones } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.contactPage.metaTitle,
    description: dict.contactPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "contact"), fr: href("fr", "contact") }, locale),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.contactPage;
  const { lat, lng } = officeCoordinates;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const embed = `https://www.google.com/maps?q=${lat},${lng}&z=16&hl=${locale}&output=embed`;

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} />

      <section className="shell grid gap-16 pb-24 md:grid-cols-12 md:gap-8 md:pb-32">
        <div className="md:col-span-4">
          <dl className="space-y-8">
            <div className="border-t border-ink pt-5">
              <dt className="text-[0.875rem] text-slate">{dict.contactBand.address}</dt>
              <dd className="mt-2 font-serif text-[1.25rem] leading-snug">
                <address className="not-italic">
                  {dict.address.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                  <span className="block">{dict.address.poBox}</span>
                </address>
              </dd>
            </div>
            <div className="border-t border-rule pt-5">
              <dt className="text-[0.875rem] text-slate">{dict.contactBand.phone}</dt>
              <dd className="mt-2 space-y-1 font-serif text-[1.25rem]">
                {phones.map((p) => (
                  <a key={p} href={telHref(p)} className="link block w-fit">
                    {p}
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <h2 className="heading text-[clamp(1.875rem,1.4rem+1.6vw,2.75rem)]">{t.formTitle}</h2>
          <div className="mt-8">
            <ContactForm locale={locale} t={t} />
          </div>
        </div>
      </section>

      <section className="bg-stone">
        <div className="shell py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="heading text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{t.mapTitle}</h2>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="link text-[0.9375rem]">
              {t.openMap}
            </a>
          </div>
          <div className="mt-8 aspect-[4/3] w-full overflow-hidden bg-stone-deep sm:aspect-[16/7]">
            <iframe
              title={t.mapTitle}
              src={embed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0 grayscale-[0.35]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
