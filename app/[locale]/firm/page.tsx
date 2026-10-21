import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBand, PageIntro } from "@/components/site/blocks";
import { getTeam } from "@/lib/data";
import { chambersProfileUrl, getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.firmPage.metaTitle,
    description: dict.firmPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "firm"), fr: href("fr", "firm") }, locale),
  };
}

export default async function FirmPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.firmPage;
  const partner = (await getTeam(locale)).find((m) => m.group === "partner");

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} />

      <figure className="shell">
        <div className="relative aspect-[3/2] overflow-hidden bg-stone md:aspect-[16/8]">
          <Image
            src="/images/team.jpg"
            alt={dict.home.heroCaption}
            fill
            priority
            quality={80}
            sizes="(min-width: 1312px) 1216px, 100vw"
            className="object-cover"
            style={{ objectPosition: "50% 10%" }}
          />
        </div>
        <figcaption className="mt-3 text-2xs text-slate">{dict.home.heroCaption}</figcaption>
      </figure>

      <section className="shell grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)] md:col-span-4">{t.historyTitle}</h2>
        <div className="md:col-span-7 md:col-start-6">
          <p className="lede">{t.history[0]}</p>
          {t.history.slice(1).map((p) => (
            <p key={p} className="mt-5 text-ink-soft">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-stone">
        <div className="shell py-24 md:py-32">
          <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)]">{t.approachTitle}</h2>
          <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {t.approach.map((a) => (
              <li key={a.title} className="border-t border-ink pt-6">
                <h3 className="font-serif text-[1.375rem] leading-snug">{a.title}</h3>
                <p className="mt-3 text-[0.9375rem] text-ink-soft">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell grid gap-10 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-4">
          <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)]">{t.recognitionTitle}</h2>
          <a href={chambersProfileUrl} className="link mt-8 inline-block text-[0.9375rem]" target="_blank" rel="noopener noreferrer">
            Chambers and Partners
          </a>
        </div>
        <dl className="md:col-span-7 md:col-start-6">
          {t.recognition.map((r) => (
            <div key={r.name} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
              <dt className="font-serif text-[1.25rem] leading-snug">{r.name}</dt>
              <dd className="text-ink-soft">{r.body}</dd>
            </div>
          ))}
          <div className="grid gap-2 border-y border-rule py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
            <dt className="font-serif text-[1.25rem] leading-snug">{t.institutionsTitle}</dt>
            <dd className="text-ink-soft">{t.institutions}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-stone">
        <div className="shell grid gap-8 py-24 md:grid-cols-12 md:py-32">
          <figure className="md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-deep">
              <Image src="/images/africa-regional-meeting.jpg" alt={dict.home.africaCaption} fill quality={80} sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-2xs text-slate">{dict.home.africaCaption}</figcaption>
          </figure>
          <figure className="md:col-span-5 md:self-end">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-deep">
              <Image src="/images/tag-alliances-meeting.jpg" alt={dict.home.tagCaption} fill quality={80} sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-2xs text-slate">{dict.home.tagCaption}</figcaption>
          </figure>
        </div>
      </section>

      {partner && (
        <section className="shell grid gap-10 py-24 md:grid-cols-12 md:items-center md:py-32">
          <h2 className="sr-only">{t.leadershipTitle}</h2>
          <div className="relative aspect-[4/5] overflow-hidden bg-stone md:col-span-4">
            <Image
              src="/images/roland-abeng-office.jpg"
              alt={`${partner.name}, ${partner.title}`}
              fill
              quality={80}
              sizes="(min-width: 768px) 30vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <div className="md:col-span-6 md:col-start-6">
            <p className="text-[0.9375rem] text-slate">{t.leadershipTitle}</p>
            <p className="display mt-3 text-[clamp(2.5rem,1.8rem+2.8vw,4rem)]">{partner.name}</p>
            <p className="mt-2 text-ink-soft">{partner.title}</p>
            <p className="mt-8 text-ink-soft">{partner.bio[1] ?? partner.bio[0]}</p>
            <Link href={href(locale, "team", partner.slug)} className="link mt-8 inline-block font-medium">
              {dict.common.readProfile}
            </Link>
          </div>
        </section>
      )}

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
