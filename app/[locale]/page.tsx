import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { ArticleCard, ContactBand, SectionHeading } from "@/components/site/blocks";
import { PracticePhotoCard } from "@/components/site/PracticePhotoCard";
import { MemberCard } from "@/components/site/Portrait";
import { RecognitionTabs } from "@/components/site/RecognitionPhotos";
import { getArticles, getPracticeAreas, getTeam, isLawyerGroup } from "@/lib/data";
import { practicePhoto } from "@/lib/photos";
import { getRecognitions, recognitionKinds } from "@/lib/recognitions";
import { getDictionary, phones } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

/** Practice areas shown on the home page, in this order. */
const featuredAreas = [
  "corporate-commercial-ohada",
  "banking-finance",
  "energy-infrastructure",
  "mergers-acquisitions",
  "litigation-arbitration",
  "tax-customs-exchange",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: { absolute: dict.home.metaTitle },
    alternates: alternatesFor({ en: href("en"), fr: href("fr") }, locale),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.home;
  const [team, areas, articles] = await Promise.all([getTeam(locale), getPracticeAreas(locale), getArticles(locale, { limit: 3 })]);

  const lawyers = team.filter((m) => isLawyerGroup(m.group) && (m.group === "partner" || m.featured));
  const bySlug = (slug: string) => areas.find((a) => a.slugs.en === slug);

  // Sections follow the order the firm asked for: opening, introduction, practice areas,
  // team, recognition, publications and news, contact.

  return (
    <>
      {/* Opening section: the team photograph and a short statement introducing the firm. */}
      <section className="bg-charcoal text-white">
        <div className="shell grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-5">
            <p className="eyebrow hero-fade">{t.eyebrow}</p>
            {/* French needs a slightly smaller size to sit as well beside the photo. */}
            <h1
              className={`display mt-6 ${
                locale === "fr" ? "text-[clamp(2.125rem,1.3rem+2.4vw,3.5rem)]" : "text-[clamp(2.375rem,1.5rem+2.8vw,3.875rem)]"
              }`}
            >
              {t.heroLines.map((line, i) => (
                <span key={line} className="hero-line">
                  {line}
                  {/* Keeps the words apart for search engines and screen readers; invisible on screen. */}
                  {i < t.heroLines.length - 1 && " "}
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/80">{t.heroLede}</p>
            <div className="hero-fade mt-9 flex flex-wrap gap-3">
              <Link href={href(locale, "contact")} className="btn btn-gold">
                {dict.common.consult}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <a href={telHref(phones[0])} className="btn btn-outline-light">
                <Phone aria-hidden className="h-4 w-4 text-gold" />
                {phones[0]}
              </a>
            </div>
          </div>

          {/* The whole group photo, at its own proportions, so no one is cut off. */}
          <div className="hero-fade lg:col-span-7">
            <div className="relative aspect-[2400/1510] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)]">
              <Image src="/images/team-v2.jpg" alt={t.heroCaption} fill priority sizes="(min-width: 1024px) 58vw, 100vw" quality={80} className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* The firm */}
      <section className="py-24 md:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* The whole group photo, at its own proportions, so no one is cut off. */}
            <div className="relative aspect-[2400/1510] overflow-hidden rounded-[2rem]">
              <Image src="/images/team-v2.jpg" alt={t.heroCaption} fill sizes="(min-width: 1024px) 55vw, 100vw" quality={80} className="object-cover" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t.firmEyebrow} title={t.introTitle} lede={t.introLede} />
            <p className="mt-4 text-ink-soft">{t.introBody[0]}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={href(locale, "firm")} className="btn btn-gold">
                {t.introLink}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href={href(locale, "contact")} className="btn btn-quiet">
                {dict.nav.contact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Practice areas */}
      <section className="bg-charcoal py-24 text-white md:py-32">
        <div className="shell">
          <SectionHeading eyebrow={t.practiceEyebrow} title={t.practiceHeading} align="center" dark />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAreas.map((slug) => {
              const a = bySlug(slug);
              if (!a) return null;
              return (
                <li key={slug}>
                  <PracticePhotoCard
                    href={href(locale, "practice", a.slug)}
                    slug={slug}
                    title={a.title}
                    summary={a.summary}
                    image={practicePhoto(slug)}
                    moreLabel={dict.common.learnMore}
                  />
                </li>
              );
            })}
          </ul>
          <div className="mt-12 text-center">
            <Link href={href(locale, "practice")} className="btn btn-gold">
              {dict.common.allPracticeAreas}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32">
        <div className="shell">
          <SectionHeading eyebrow={t.teamEyebrow} title={t.lawyersTitle} lede={t.lawyersLede} />
          <ul className="mt-14 grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
            {lawyers.slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link href={href(locale, "team", m.slug)} className="block">
                  <MemberCard
                    name={m.name}
                    title={m.title}
                    src={m.photo}
                    position={m.photoPosition}
                    pendingLabel={dict.common.photoPending}
                    sizes="(min-width: 1024px) 30vw, (min-width: 480px) 45vw, 100vw"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link href={href(locale, "team")} className="btn btn-gold mt-12 min-h-14 w-full text-[1rem]">
            {dict.common.meetTeam}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Recognition, one tab per kind; the firm page has the detail. */}
      <section className="border-t border-rule py-16 md:py-20">
        <div className="shell">
          <p className="text-center">
            <span className="eyebrow">{t.recognitionEyebrow}</span>
          </p>
          <div className="mt-10">
            <RecognitionTabs
              labels={dict.common.gallery}
              groups={recognitionKinds.map((kind) => ({ kind, title: dict.firmPage.recognitionKinds[kind], items: getRecognitions(locale, kind) }))}
            />
          </div>
          <p className="mt-8 text-center">
            <Link href={`${href(locale, "firm")}#recognition`} className="btn btn-quiet">
              {t.recognitionLink}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* News */}
      <section className="bg-stone py-24 md:py-32">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t.newsEyebrow} title={t.insightsTitle} />
            <Link href={href(locale, "insights")} className="btn btn-quiet">
              {dict.common.allInsights}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          {articles.length === 0 ? (
            <p className="card mt-12 p-8 text-slate">{t.insightsEmpty}</p>
          ) : (
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.id}>
                  <ArticleCard article={a} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
