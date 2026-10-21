import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleItem, ContactBand } from "@/components/site/blocks";
import { Portrait } from "@/components/site/Portrait";
import { getArticles, getPracticeAreas, getTeam, practiceGroupOrder } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

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
  const [team, areas, articles] = await Promise.all([getTeam(locale), getPracticeAreas(locale), getArticles(locale, { limit: 3 })]);

  const partner = team.find((m) => m.group === "partner");
  const lawyers = team.filter((m) => m.group === "lawyer" && m.featured);

  return (
    <>
      {/* Hero: the firm's own people, full width, beneath a plain statement of what it does. */}
      <section>
        <div className="shell grid gap-8 pb-10 pt-12 md:grid-cols-12 md:items-end md:pb-14 md:pt-20">
          <h1 className="display text-[clamp(3rem,1.4rem+5.6vw,6.75rem)] md:col-span-8">
            {dict.home.heroLines.map((line) => (
              <span key={line} className="hero-line">
                {line}
              </span>
            ))}
          </h1>
          <div className="hero-fade md:col-span-4 md:pb-3">
            <p className="lede">{dict.home.heroLede}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={href(locale, "contact")} className="btn btn-primary">
                {dict.common.consult}
              </Link>
              <Link href={href(locale, "practice")} className="btn btn-quiet">
                {dict.nav.practice}
              </Link>
            </div>
          </div>
        </div>
        <figure>
          <div className="hero-photo relative aspect-[3/2] w-full bg-stone md:aspect-auto md:h-[min(58vw,84vh)]">
            <Image
              src="/images/team.jpg"
              alt={dict.home.heroCaption}
              fill
              priority
              quality={80}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "50% 0%" }}
            />
          </div>
          <figcaption className="shell mt-3 text-2xs text-slate">{dict.home.heroCaption}</figcaption>
        </figure>
        <div className="shell mt-10 md:mt-14">
          <ul className="grid grid-cols-1 border-t border-ink/80 xs:grid-cols-2 lg:grid-cols-4">
            {dict.credentials.map((c) => (
              <li key={c.title} className="border-b border-rule py-6 pr-6 lg:border-b-0">
                <p className="font-serif text-[1.25rem] leading-snug">{c.title}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-snug text-slate">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The firm */}
      <section className="shell grid gap-12 py-24 md:grid-cols-12 md:py-32">
        <div className="md:col-span-7">
          <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)]">{dict.home.introTitle}</h2>
          <p className="lede mt-8">{dict.home.introLede}</p>
          {dict.home.introBody.map((p) => (
            <p key={p} className="mt-5 max-w-2xl text-ink-soft">
              {p}
            </p>
          ))}
          <Link href={href(locale, "firm")} className="link mt-8 inline-block font-medium">
            {dict.home.introLink}
          </Link>
        </div>
        <dl className="self-end md:col-span-4 md:col-start-9">
          {(
            [
              [dict.firm.founded, dict.firm.foundedValue],
              [dict.firm.office, dict.firm.officeValue],
              [dict.firm.languages, dict.firm.languagesValue],
              [dict.firm.law, dict.firm.lawValue],
            ] as const
          ).map(([term, value]) => (
            <div key={term} className="border-t border-rule py-5">
              <dt className="text-[0.8125rem] text-slate">{term}</dt>
              <dd className="mt-1 font-serif text-[1.1875rem] leading-snug">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Practice areas as a typographic index */}
      <section className="bg-stone">
        <div className="shell py-24 md:py-32">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)] md:col-span-6">{dict.home.practiceTitle}</h2>
            <p className="text-ink-soft md:col-span-5 md:col-start-8">{dict.home.practiceLede}</p>
          </div>
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {practiceGroupOrder.map((group) => (
              <div key={group}>
                <h3 className="border-b border-ink pb-3 font-sans text-[0.9375rem] font-medium">
                  {dict.practicePage.groups[group]}
                </h3>
                <ul>
                  {areas
                    .filter((a) => a.group === group)
                    .map((a) => (
                      <li key={a.id} className="border-b border-rule">
                        <Link
                          href={href(locale, "practice", a.slug)}
                          className="block py-3.5 font-serif text-[1.125rem] leading-snug text-ink transition-colors hover:text-brass"
                        >
                          {a.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href={href(locale, "practice")} className="link mt-12 inline-block font-medium">
            {dict.common.allPracticeAreas}
          </Link>
        </div>
      </section>

      {/* Managing Partner */}
      {partner && (
        <section className="shell grid gap-12 py-24 md:grid-cols-12 md:items-center md:py-32">
          <div className="relative aspect-[4/5] overflow-hidden bg-stone md:col-span-6">
            <Image
              src="/images/roland-abeng-office.jpg"
              alt={`${partner.name}, ${partner.title}`}
              fill
              quality={80}
              sizes="(min-width: 768px) 46vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="text-[0.9375rem] text-slate">{partner.title}</p>
            <h2 className="display mt-3 text-[clamp(2.75rem,1.8rem+3.4vw,4.75rem)]">{partner.name}</h2>
            <p className="mt-8 border-l-2 border-brass pl-5 font-serif text-[1.1875rem] leading-snug">{dict.home.partnerRecognition}</p>
            <p className="mt-8 text-ink-soft">{partner.bio[0]}</p>
            <Link href={href(locale, "team", partner.slug)} className="link mt-8 inline-block font-medium">
              {dict.common.readProfile}
            </Link>
          </div>
        </section>
      )}

      {/* Lawyers */}
      <section className="border-t border-rule">
        <div className="shell py-24 md:py-32">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)]">{dict.home.lawyersTitle}</h2>
              <p className="mt-5 max-w-xl text-ink-soft">{dict.home.lawyersLede}</p>
            </div>
            <Link href={href(locale, "team")} className="link font-medium md:col-span-4 md:col-start-9 md:justify-self-end">
              {dict.common.meetTeam}
            </Link>
          </div>
          <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-5">
            {lawyers.map((m) => (
              <li key={m.id}>
                <Link href={href(locale, "team", m.slug)} className="group block">
                  <Portrait
                    name={m.name}
                    src={m.photo}
                    position={m.photoPosition}
                    pendingLabel={dict.common.photoPending}
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 46vw"
                  />
                  <p className="mt-4 font-serif text-[1.1875rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {m.name}
                  </p>
                  <p className="mt-1 text-[0.875rem] text-slate">{m.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* International networks */}
      <section className="bg-stone">
        <div className="shell grid gap-12 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-4">
            <h2 className="heading text-[clamp(2rem,1.5rem+2vw,3rem)]">{dict.home.networksTitle}</h2>
            <p className="mt-6 text-ink-soft">{dict.home.networksBody}</p>
            <Link href={href(locale, "firm")} className="link mt-8 inline-block font-medium">
              {dict.home.introLink}
            </Link>
          </div>
          <figure className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-deep">
              <Image src="/images/africa-regional-meeting.jpg" alt={dict.home.africaCaption} fill quality={80} sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-2xs text-slate">{dict.home.africaCaption}</figcaption>
          </figure>
          <figure className="md:col-span-3 md:self-end">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-deep">
              <Image src="/images/tag-alliances-meeting.jpg" alt={dict.home.tagCaption} fill quality={80} sizes="(min-width: 768px) 24vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-2xs text-slate">{dict.home.tagCaption}</figcaption>
          </figure>
        </div>
      </section>

      {/* News & insights */}
      <section className="shell py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="heading text-[clamp(2.25rem,1.5rem+2.6vw,3.5rem)]">{dict.home.insightsTitle}</h2>
          <Link href={href(locale, "insights")} className="link font-medium">
            {dict.common.allInsights}
          </Link>
        </div>
        <div className="mt-12">
          {articles.length === 0 ? (
            <p className="border-t border-rule py-8 text-slate">{dict.home.insightsEmpty}</p>
          ) : (
            articles.map((a, i) => <ArticleItem key={a.id} article={a} locale={locale} dict={dict} withImage={i === 0} />)
          )}
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
