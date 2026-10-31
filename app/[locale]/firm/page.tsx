import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building, Globe2, Lock, Scale, TrendingUp } from "lucide-react";
import { ContactBand, PageIntro, SectionHeading } from "@/components/site/blocks";
import { PhotoRevealBox } from "@/components/site/PhotoReveal";
import { RecognitionList } from "@/components/site/RecognitionPhotos";
import { getTeam } from "@/lib/data";
import { approachPhotos } from "@/lib/photos";
import { getRecognitions, recognitionKinds } from "@/lib/recognitions";
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

const approachIcons = [Scale, Lock, TrendingUp, Globe2];

export default async function FirmPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.firmPage;
  const partner = (await getTeam(locale)).find((m) => m.group === "partner");

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} eyebrow={dict.home.firmEyebrow} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]} />

      {/* History */}
      <section className="py-20 md:py-28">
        <div className="shell grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* The whole group photo, at its own proportions, so no one is cut off. */}
            <div className="relative aspect-[2400/1510] overflow-hidden rounded-[2rem]">
              <Image src="/images/team-v2.jpg" alt={dict.home.heroCaption} fill priority quality={80} sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
            </div>
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold">
                <Building aria-hidden className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-[1.375rem] font-bold leading-none text-ink">1998</span>
                <span className="text-[0.8125rem] text-slate">{dict.home.statFounded}</span>
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={dict.home.firmEyebrow} title={t.historyTitle} />
            {t.history.map((p, i) => (
              <p key={p} className={i === 0 ? "mt-6 text-[1.0625rem] text-ink" : "mt-4 text-ink-soft"}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="shell">
          <SectionHeading eyebrow={dict.home.whyEyebrow} title={t.approachTitle} align="center" dark />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.approach.map((a, i) => {
              const Icon = approachIcons[i] ?? Scale;
              return (
                <li key={a.title}>
                  <PhotoRevealBox
                    image={approachPhotos[i]}
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
                    className="h-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-gold/60 data-[active=true]:border-gold/60"
                  >
                    <span className="icon-tile">
                      <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-6 font-display text-[1.1875rem] font-semibold">{a.title}</h3>
                    <p className="mt-3 text-[0.9375rem] text-white/70 transition-colors group-hover:text-white/85 group-data-[active=true]:text-white/85">{a.body}</p>
                  </PhotoRevealBox>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Recognition and networks, by kind: rankings, awards, memberships, contributions. */}
      <section id="recognition" className="scroll-mt-28 py-20 md:py-28">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={dict.home.recognitionEyebrow} title={t.recognitionTitle} />
            <a href={chambersProfileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              Chambers and Partners
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10">
            <RecognitionList
              labels={dict.common.gallery}
              groups={recognitionKinds.map((kind) => ({ kind, title: t.recognitionKinds[kind], items: getRecognitions(locale, kind) }))}
            />
          </div>
        </div>
      </section>

      {/* Leadership */}
      {partner && (
        <section className="py-20 md:py-28">
          <div className="shell">
            <Link href={href(locale, "team", partner.slug)} className="card card-hover group grid overflow-hidden md:grid-cols-12">
              <div className="relative aspect-[4/5] md:col-span-4 md:aspect-auto md:min-h-[26rem]">
                <Image src="/images/roland-abeng-office-v2.jpg" alt={`${partner.name}, ${partner.title}`} fill quality={80} sizes="(min-width: 768px) 32vw, 100vw" className="object-cover" style={{ objectPosition: "50% 30%" }} />
              </div>
              <div className="flex flex-col p-8 md:col-span-8 md:p-12">
                <p className="eyebrow self-start">{t.leadershipTitle}</p>
                <h2 className="display mt-5 text-[clamp(2rem,1.5rem+2vw,3rem)] text-ink">{partner.name}</h2>
                <p className="mt-2 font-medium text-gold-dark">{partner.title}</p>
                <p className="mt-6 text-ink-soft">{partner.bio[1] ?? partner.bio[0]}</p>
                <span className="more mt-auto pt-8">
                  {dict.common.readProfile}
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
