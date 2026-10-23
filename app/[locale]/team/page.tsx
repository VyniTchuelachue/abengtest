import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award } from "lucide-react";
import { ContactBand, PageIntro } from "@/components/site/blocks";
import { MemberCard } from "@/components/site/Portrait";
import { getTeam, groupOrder } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.teamPage.metaTitle,
    description: dict.teamPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "team"), fr: href("fr", "team") }, locale),
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const team = await getTeam(locale);
  const partner = team.find((m) => m.group === "partner");

  return (
    <>
      <PageIntro
        title={dict.teamPage.title}
        lede={dict.teamPage.lede}
        eyebrow={dict.home.teamEyebrow}
        crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.teamPage.title }]}
      />

      {partner && (
        <section aria-labelledby="group-partner" className="py-20 md:py-24">
          <div className="shell">
            <h2 id="group-partner" className="sr-only">
              {dict.teamPage.groups.partner}
            </h2>
            <Link href={href(locale, "team", partner.slug)} className="card card-hover group grid overflow-hidden md:grid-cols-12">
              <div className="relative aspect-[4/5] md:col-span-5 md:aspect-auto md:min-h-[32rem]">
                <Image
                  src="/images/roland-abeng-office-v2.jpg"
                  alt={`${partner.name}, ${partner.title}`}
                  fill
                  priority
                  quality={80}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "50% 30%" }}
                />
              </div>
              <div className="flex flex-col p-8 md:col-span-7 md:p-12">
                <p className="eyebrow self-start">{partner.title}</p>
                <p className="display mt-5 text-[clamp(2.25rem,1.6rem+2.6vw,3.5rem)] text-ink">{partner.name}</p>
                <p className="mt-5 flex items-center gap-3 rounded-2xl bg-gold-light px-4 py-3 text-[0.9375rem] font-medium text-ink">
                  <Award aria-hidden className="h-5 w-5 flex-none text-gold-dark" />
                  {dict.home.partnerRecognition}
                </p>
                <p className="mt-6 text-ink-soft">{partner.bio[0]}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {partner.focusAreas.slice(0, 5).map((f) => (
                    <li key={f} className="rounded-full border border-rule px-3 py-1 text-[0.8125rem] text-ink-soft">
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="more mt-auto pt-8">
                  {dict.common.readProfile}
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {groupOrder
        .filter((g) => g !== "partner")
        .map((group, i) => {
          const members = team.filter((m) => m.group === group);
          if (members.length === 0) return null;
          const compact = group === "administration";
          return (
            <section key={group} aria-labelledby={`group-${group}`} className={i % 2 === 0 ? "bg-stone py-20 md:py-24" : "py-20 md:py-24"}>
              <div className="shell">
                <div className="flex items-center gap-4">
                  <h2 id={`group-${group}`} className="heading text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)]">
                    {dict.teamPage.groups[group]}
                  </h2>
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-gold px-2 font-display text-[0.875rem] font-bold text-ink">
                    {members.length}
                  </span>
                </div>
                <ul className={`mt-10 grid grid-cols-1 gap-6 xs:grid-cols-2 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                  {members.map((m) => (
                    <li key={m.id}>
                      <Link href={href(locale, "team", m.slug)} className="block">
                        <MemberCard
                          name={m.name}
                          title={m.title}
                          src={m.photo}
                          position={m.photoPosition}
                          pendingLabel={dict.common.photoPending}
                          sizes={compact ? "(min-width: 1024px) 22vw, (min-width: 480px) 45vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 480px) 45vw, 100vw"}
                          detail={compact ? undefined : m.focusAreas.slice(0, 2).join(" · ")}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

      {/* Recruitment */}
      <section className="border-t border-rule py-16 md:py-20">
        <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="heading text-[clamp(1.625rem,1.3rem+1.2vw,2.25rem)]">{dict.teamPage.joinTitle}</h2>
            <p className="mt-3 text-ink-soft">{dict.teamPage.joinBody}</p>
          </div>
          <Link href={href(locale, "careers")} className="btn btn-gold self-start whitespace-nowrap md:self-auto">
            {dict.teamPage.joinCta}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}
