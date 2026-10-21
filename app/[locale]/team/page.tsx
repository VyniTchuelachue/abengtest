import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactBand, PageIntro } from "@/components/site/blocks";
import { Portrait } from "@/components/site/Portrait";
import { getTeam, groupOrder, type Member } from "@/lib/data";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { alternatesFor, href, isLocale, type Locale } from "@/lib/routes";

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
      <PageIntro title={dict.teamPage.title} lede={dict.teamPage.lede} />

      {partner && (
        <section aria-labelledby="group-partner" className="shell pb-24 md:pb-32">
          <h2 id="group-partner" className="sr-only">
            {dict.teamPage.groups.partner}
          </h2>
          <Link href={href(locale, "team", partner.slug)} className="group grid gap-10 border-t border-ink pt-10 md:grid-cols-12 md:gap-8">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone md:col-span-5">
              <Image
                src="/images/roland-abeng-office.jpg"
                alt={`${partner.name}, ${partner.title}`}
                fill
                priority
                quality={80}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            </div>
            <div className="flex flex-col md:col-span-6 md:col-start-7">
              <p className="text-[0.9375rem] text-slate">{partner.title}</p>
              <p className="display mt-3 text-[clamp(2.75rem,1.8rem+3.4vw,4.75rem)] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.12em]">
                {partner.name}
              </p>
              <p className="mt-8 text-ink-soft">{partner.bio[0]}</p>
              <p className="mt-auto pt-8 text-[0.9375rem] text-ink-soft">{partner.focusAreas.slice(0, 5).join(", ")}</p>
              <span className="link mt-6 inline-block self-start font-medium">{dict.common.readProfile}</span>
            </div>
          </Link>
        </section>
      )}

      {groupOrder
        .filter((g) => g !== "partner")
        .map((group) => {
          const members = team.filter((m) => m.group === group);
          if (members.length === 0) return null;
          return (
            <section key={group} aria-labelledby={`group-${group}`} className={group === "senior_associate" || group === "paralegal" ? "bg-stone" : ""}>
              <div className="shell py-20 md:py-28">
                <div className="flex items-baseline justify-between gap-6 border-b border-ink pb-4">
                  <h2 id={`group-${group}`} className="heading text-[clamp(1.875rem,1.4rem+1.6vw,2.75rem)]">
                    {dict.teamPage.groups[group]}
                  </h2>
                  <p className="text-[0.875rem] text-slate">{members.length}</p>
                </div>
                <MemberGrid members={members} locale={locale} dict={dict} compact={group === "administration"} />
              </div>
            </section>
          );
        })}

      <ContactBand locale={locale} dict={dict} />
    </>
  );
}

function MemberGrid({ members, locale, dict, compact }: { members: Member[]; locale: Locale; dict: Dictionary; compact?: boolean }) {
  return (
    <ul className={`mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-4"}`}>
      {members.map((m) => (
        <li key={m.id}>
          <Link href={href(locale, "team", m.slug)} className="group block">
            <Portrait
              name={m.name}
              src={m.photo}
              position={m.photoPosition}
              pendingLabel={dict.common.photoPending}
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
            />
            <h3 className="mt-4 font-serif text-[1.25rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {m.name}
            </h3>
            <p className="mt-1 text-[0.875rem] text-slate">{m.title}</p>
            {!compact && m.focusAreas.length > 0 && (
              <p className="mt-3 hidden text-[0.875rem] leading-snug text-ink-soft sm:block">{m.focusAreas.slice(0, 2).join(locale === "fr" ? " et " : " and ")}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
