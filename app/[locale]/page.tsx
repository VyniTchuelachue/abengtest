import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, CalendarCheck, Globe2, Landmark, Languages, Phone } from "lucide-react";
import { ArticleCard, ContactBand, SectionHeading } from "@/components/site/blocks";
import { PracticeIcon, SectorIcon } from "@/components/site/icons";
import { MemberCard } from "@/components/site/Portrait";
import { getArticles, getPracticeAreas, getTeam, isLawyerGroup } from "@/lib/data";
import { getRecognitions } from "@/lib/recognitions";
import { chambersProfileUrl, getDictionary, phones } from "@/lib/dictionaries";
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
/** Indexes into the dictionary's sector list: energy, banking, infrastructure, telecoms. */
const heroSectors = [0, 3, 5, 4];

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

  const partner = team.find((m) => m.group === "partner");
  const lawyers = team.filter((m) => isLawyerGroup(m.group) && (m.group === "partner" || m.featured));
  const faces = team.filter((m) => m.photo && m.group !== "partner").slice(0, 5);
  const bySlug = (slug: string) => areas.find((a) => a.slugs.en === slug);
  const whyIcons = [Landmark, Globe2, Languages];
  const recognitions = [
    { name: "Chambers Global", detail: locale === "fr" ? "Classement 2026" : "2026 ranking", href: chambersProfileUrl },
    { name: "TAGLaw", detail: locale === "fr" ? "Membre de l'alliance" : "Alliance member" },
    { name: "TRACE", detail: locale === "fr" ? "Réseau anticorruption" : "Anti-bribery network" },
    { name: "Legal 500 · IFLR1000", detail: locale === "fr" ? "Associé gérant distingué" : "Managing Partner recognised" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-charcoal text-white">
        <Image src="/images/team-v2.jpg" alt="" fill priority sizes="100vw" quality={65} className="-z-10 object-cover opacity-20" style={{ objectPosition: "50% 20%" }} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/55" />
        <div className="shell grid items-center gap-12 pb-32 pt-14 md:pb-40 lg:grid-cols-12 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="eyebrow hero-fade">{t.eyebrow}</p>
            {/* One line per phrase on large screens; French needs a slightly smaller size to fit. */}
            <h1
              className={`display mt-6 ${
                locale === "fr" ? "text-[clamp(2.25rem,1.2rem+3.4vw,4.4rem)]" : "text-[clamp(2.5rem,1.5rem+4.2vw,4.75rem)]"
              }`}
            >
              {t.heroLines.map((line, i) => (
                <span key={line} className="hero-line lg:whitespace-nowrap">
                  {line}
                  {/* Keeps the words apart for search engines and screen readers; invisible on screen. */}
                  {i < t.heroLines.length - 1 && " "}
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-white/80">{t.heroLede}</p>
            <div className="hero-fade mt-9 flex flex-wrap gap-3">
              <Link href={href(locale, "contact")} className="btn btn-gold">
                <CalendarCheck aria-hidden className="h-4 w-4" />
                {dict.common.consult}
              </Link>
              <a href={telHref(phones[0])} className="btn btn-outline-light">
                <Phone aria-hidden className="h-4 w-4 text-gold" />
                {phones[0]}
              </a>
            </div>
            {faces.length > 0 && (
              <div className="hero-fade mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {faces.map((m) => (
                    <span key={m.id} className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-charcoal">
                      <Image src={m.photo!} alt="" fill sizes="44px" className="object-cover" style={{ objectPosition: "50% 15%" }} />
                    </span>
                  ))}
                </div>
                <p className="text-[0.875rem] leading-snug text-white/80">
                  <span className="font-display text-[1.125rem] font-semibold text-white">{team.length}</span> {t.teamCount}
                </p>
              </div>
            )}
          </div>

          {partner && (
            <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
              <div className="hero-photo relative aspect-[5/6]">
                <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem]">
                  <div className="absolute inset-x-[6%] bottom-0 top-[26%] rounded-[2.5rem] bg-gold" />
                  <Image
                    src="/images/roland-abeng-cutout-v2.webp"
                    alt={`${partner.name}, ${partner.title}`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
              <div className="hero-stat absolute -left-2 bottom-24 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] sm:-left-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold">
                  <Award aria-hidden className="h-5 w-5" />
                </span>
                <span className="max-w-[9.5rem]">
                  <span className="block font-display text-[1rem] font-bold leading-tight">Chambers Global</span>
                  <span className="text-[0.75rem] leading-tight text-slate">{t.statChambers}</span>
                </span>
              </div>
              <div className="absolute inset-x-[12%] -bottom-5 rounded-2xl bg-ink/90 px-5 py-3 text-center backdrop-blur">
                <p className="font-display font-semibold">{partner.name}</p>
                <p className="text-[0.8125rem] text-gold">{partner.title}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sector cards overlapping the hero */}
      <section aria-label={t.sectorsLabel} className="relative z-10 -mt-20">
        <ul className="shell grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {heroSectors.map((index, i) => (
            <li
              key={index}
              className={`flex flex-col gap-5 rounded-[1.25rem] p-6 shadow-[0_24px_50px_-30px_rgb(0_0_0/0.45)] ${i % 2 === 0 ? "bg-white" : "bg-gold"}`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${i % 2 === 0 ? "bg-gold text-ink" : "bg-white text-ink"}`}>
                <SectorIcon index={index} className="h-6 w-6" />
              </span>
              <span className="font-display text-[1.0625rem] font-semibold leading-snug text-ink">{dict.practicePage.sectors[index]}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* The firm */}
      <section className="py-24 md:py-32">
        <div className="shell grid items-center gap-14 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image src="/images/team-v2.jpg" alt={t.heroCaption} fill sizes="(min-width: 1024px) 45vw, 100vw" quality={75} className="object-cover" style={{ objectPosition: "50% 20%" }} />
            </div>
            <div className="absolute -bottom-8 right-6 hidden w-48 overflow-hidden rounded-[1.5rem] border-[6px] border-white shadow-xl sm:block">
              <div className="relative aspect-[4/3]">
                <Image src="/images/tag-alliances-meeting-v2.jpg" alt={t.tagCaption} fill sizes="200px" className="object-cover" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
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
                  <Link
                    href={href(locale, "practice", a.slug)}
                    className="group flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7 transition-colors hover:border-gold/60 hover:bg-white/[0.08]"
                  >
                    <span className="icon-tile">
                      <PracticeIcon slug={slug} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-6 font-display text-[1.25rem] font-semibold leading-snug">{a.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{a.summary}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 font-display text-[0.9375rem] font-semibold text-gold">
                      {dict.common.learnMore}
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
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

      {/* Recognition */}
      <section className="border-b border-rule py-16 md:py-20">
        <div className="shell">
          <p className="text-center">
            <span className="eyebrow">{t.recognitionEyebrow}</span>
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recognitions.map((r) => {
              const inner = (
                <>
                  <span className="font-display text-[1.25rem] font-bold tracking-tight text-ink">{r.name}</span>
                  <span className="mt-1 block text-[0.8125rem] text-slate">{r.detail}</span>
                </>
              );
              return (
                <li key={r.name} className="card flex flex-col items-center justify-center px-4 py-7 text-center">
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {getRecognitions("firm", locale).map((r) => (
              <li key={r.id}>
                <Link href={`${href(locale, "firm")}#distinctions`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-stone-deep">
                  <Image src={r.image} alt={`${r.issuer}${r.year ? ` ${r.year}` : ""}`} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/95 via-charcoal/70 to-transparent px-4 pb-4 pt-10 text-white">
                    <span className="block font-display text-[0.9375rem] font-semibold leading-tight">{r.issuer}</span>
                    {r.year && <span className="text-[0.8125rem] text-gold">{r.year}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center">
            <Link href={`${href(locale, "firm")}#distinctions`} className="btn btn-quiet">
              {t.awardsLink}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* Why choose us */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
          <Image src="/images/africa-regional-meeting-v2.jpg" alt={t.africaCaption} fill sizes="45vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/40 to-transparent" />
        </div>
        <div className="shell relative py-24 md:py-32">
          <div className="max-w-2xl">
            <SectionHeading eyebrow={t.whyEyebrow} title={t.whyHeading} lede={t.whyBody} dark />
            <ul className="mt-12 space-y-8">
              {t.why.map((w, i) => {
                const Icon = whyIcons[i] ?? Award;
                return (
                  <li key={w.title} className="flex gap-5">
                    <span className="icon-tile">
                      <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block font-display text-[1.25rem] font-semibold">{w.title}</span>
                      <span className="mt-1 block text-white/75">{w.body}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 md:py-32">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={t.teamEyebrow} title={t.lawyersTitle} lede={t.lawyersLede} />
            <Link href={href(locale, "team")} className="btn btn-quiet">
              {dict.common.meetTeam}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
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
