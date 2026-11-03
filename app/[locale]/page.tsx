import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, Landmark, Languages, Scale } from "lucide-react";
import { ArticleCard, ContactBand, SectionHeading } from "@/components/site/blocks";
import { PracticePhotoCard } from "@/components/site/PracticePhotoCard";
import { MemberCard } from "@/components/site/Portrait";
import { RecognitionStrip, RecognitionTabs } from "@/components/site/RecognitionPhotos";
import { getArticles, getPracticeAreas, getTeam, isLawyerGroup } from "@/lib/data";
import { practicePhoto } from "@/lib/photos";
import { getRecognitions, recognitionKinds } from "@/lib/recognitions";
import { getDictionary } from "@/lib/dictionaries";
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

/** Icons of the "Why choose the firm" reasons, in the order of dict.home.why. */
const whyIcons = [Landmark, Scale, Award, Languages];

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
      {/* Opening section: the team photograph on the dark slate of the section, with the statement
          over its lower part (where the team's faces are not), then the firm's awards. */}
      <section className="@container relative isolate overflow-hidden bg-studio bg-[linear-gradient(to_top,var(--color-studio),transparent_35%),radial-gradient(ellipse_at_50%_30%,var(--color-studio-light),var(--color-studio)_70%)] text-white">
        <div className="relative mx-auto max-w-[104rem]">
          {/* On phones the photo is cropped to the group, so the faces stay large. From 768px the whole
              photo shows, with its empty backdrop on either side of the group; its side edges, which
              are only backdrop, fade into the matching background of the section. Below 1280px the
              text follows the photo; from 1280px it sits over its lower half, under the faces, with
              the photo lifted a little into the empty backdrop above the heads. */}
          <div className="hero-photo relative aspect-video md:aspect-[3052/1440] md:[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <Image
              src="/images/team-photo-wide.jpg"
              alt={t.heroCaption}
              fill
              priority
              sizes="(min-width: 1664px) 1664px, (min-width: 768px) 100vw, 120vw"
              quality={90}
              className="object-cover xl:-translate-y-[3%]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-studio to-transparent to-20% xl:via-studio/85 xl:via-30% xl:to-55%"
            />
          </div>

          {/* Two large words either side of a gold rule that runs almost the full width of the
              screen (the first set to the left, the second to the right), then the firm's statement in
              smaller capitals, centred. */}
          <div className="relative -mt-4 pb-12 text-center xl:absolute xl:inset-x-0 xl:bottom-0 xl:mt-0 xl:pb-12">
            <p className="hero-line relative mx-auto w-fit font-display text-[clamp(1.75rem,8cqw,3.5rem)] md:text-[clamp(3rem,6.2cqw,6rem)] font-light uppercase leading-none tracking-[0.02em]">
              <span className="block pr-[3.3em] text-left">{t.heroWords[0]} </span>
              <span className="mt-[0.3em] block pl-[4.6em] text-right">{t.heroWords[1]}</span>
              <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-[calc(100cqw-1.25rem)] -translate-x-1/2 bg-gold" />
            </p>
            <h1 className="hero-fade shell mt-[clamp(1.25rem,2.6cqw,2.25rem)] xl:mt-[clamp(2rem,2.8cqw,2.75rem)] font-display text-[clamp(0.9375rem,1.6cqw,1.5rem)] font-normal uppercase leading-snug tracking-[0.08em] text-white/90">
              {/* "Business law" in gold, the rest in white. */}
              <span className="text-gold">{t.heroLines[0]}</span> {t.heroLines.slice(1).join(" ")}
            </h1>
          </div>
        </div>

        {/* The firm's awards and certificates, standing in a row that scrolls sideways. */}
        <div className="shell relative -mt-6 pb-10">
          <RecognitionStrip photos={getRecognitions(locale).flatMap((r) => r.photos)} label={t.recognitionEyebrow} labels={dict.common.gallery} />
        </div>
      </section>

      {/* Why choose the firm: whom it assists, then the reasons, on the backdrop of the opening section. */}
      <section className="relative -mt-px bg-studio pb-24 pt-14 text-white md:pb-32 md:pt-20">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <SectionHeading title={t.whyHeading} lede={t.introLede} dark />
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={href(locale, "firm")} className="btn btn-gold">
                {t.introLink}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href={href(locale, "contact")} className="btn btn-outline-light">
                {dict.nav.contact}
              </Link>
            </div>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {t.why.map((w, i) => {
              const Icon = whyIcons[i];
              return (
                <li key={w.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7">
                  <span className="icon-tile">
                    <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 font-display text-[1.25rem] font-semibold leading-snug text-white">{w.title}</h3>
                  <p className="mt-2 text-white/70">{w.body}</p>
                </li>
              );
            })}
          </ul>
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
