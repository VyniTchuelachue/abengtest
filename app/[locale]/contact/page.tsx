import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MapPin, Phone, Mailbox } from "lucide-react";
import { PageIntro } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";
import { firmEmail, getDictionary, officeCoordinates, phones } from "@/lib/dictionaries";
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

  const cards = [
    {
      icon: MapPin,
      title: dict.contactBand.address,
      body: (
        <address className="not-italic">
          {dict.address.lines.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </address>
      ),
    },
    {
      icon: Phone,
      title: dict.contactBand.phone,
      body: (
        <span className="flex flex-col">
          {phones.map((p) => (
            <a key={p} href={telHref(p)} className="w-fit transition-colors hover:text-gold-dark">
              {p}
            </a>
          ))}
        </span>
      ),
    },
    {
      icon: Mail,
      title: locale === "fr" ? "E-mail" : "Email",
      body: (
        <a href={`mailto:${firmEmail}`} className="break-all transition-colors hover:text-gold-dark">
          {firmEmail}
        </a>
      ),
    },
    { icon: Mailbox, title: locale === "fr" ? "Courrier" : "Mail", body: <span>{dict.address.poBox}, Douala</span> },
  ];

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} eyebrow={dict.home.contactEyebrow} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />

      <section className="relative z-10 -mt-10">
        <ul className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <li key={c.title} className="card flex gap-4 p-6 shadow-[0_24px_50px_-30px_rgb(0_0_0/0.45)]">
              <span className="icon-tile">
                <c.icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="text-[0.9375rem] text-ink-soft">
                <span className="mb-1 block font-display text-[1.0625rem] font-semibold text-ink">{c.title}</span>
                {c.body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-20 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="card p-6 sm:p-10 lg:col-span-7">
            <p className="eyebrow">{dict.home.contactEyebrow}</p>
            <h2 className="heading mt-5 text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">{t.formTitle}</h2>
            <div className="mt-8">
              <ContactForm locale={locale} t={t} />
            </div>
          </div>
          <div className="flex flex-col lg:col-span-5">
            <div className="relative min-h-[22rem] flex-1 overflow-hidden rounded-[1.5rem] bg-stone-deep">
              <iframe title={t.mapTitle} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
            </div>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn btn-quiet mt-4 self-start">
              <ExternalLink aria-hidden className="h-4 w-4" />
              {t.openMap}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
