import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, CalendarCheck, GraduationCap, Languages, SquareArrowOutUpRight, Mail, Scale, Target, type LucideIcon } from "lucide-react";
import { Breadcrumb, ContactBand } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { AwardGallery } from "@/components/site/AwardGallery";
import { Portrait } from "@/components/site/Portrait";
import { getMember, getMemberAreas, getTeam, isLawyerGroup } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import { getRecognitions } from "@/lib/recognitions";
import { summarize } from "@/lib/format";
import { alternatesFor, href, isLocale } from "@/lib/routes";
import { breadcrumbSchema, personSchema } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const team = await getTeam("en");
  return team.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const member = await getMember(slug, locale);
  if (!member) return {};
  const description = summarize(member.bio[0] ?? member.title);
  return {
    title: `${member.name}, ${member.title}`,
    description,
    alternates: alternatesFor({ en: href("en", "team", slug), fr: href("fr", "team", slug) }, locale),
    openGraph: {
      type: "profile",
      siteName: "The Abeng Law Firm",
      locale: locale === "fr" ? "fr_CM" : "en_GB",
      url: href(locale, "team", slug),
      title: member.name,
      description,
      images: member.profilePhoto ? [{ url: member.profilePhoto, width: 1200, height: 1500, alt: member.name }] : undefined,
    },
  };
}

export default async function MemberPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const member = await getMember(slug, locale);
  if (!member) notFound();
  const dict = getDictionary(locale);
  const t = dict.teamPage;
  const areas = await getMemberAreas(member.id, locale);
  const isLawyer = isLawyerGroup(member.group);
  const distinctions = member.slug === "abeng-roland" ? getRecognitions("abeng-roland", locale) : [];

  const list = (items: string[]) => (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5">
          <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
          {x}
        </li>
      ))}
    </ul>
  );

  const details: { label: string; icon: LucideIcon; content: React.ReactNode }[] = [];
  if (member.focusAreas.length) details.push({ label: t.focus, icon: Target, content: list(member.focusAreas) });
  if (isLawyer && areas.length)
    details.push({
      label: t.practiceAreas,
      icon: Briefcase,
      content: (
        <ul className="space-y-2">
          {areas.map((a) => (
            <li key={a.id} className="flex gap-2.5">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
              <Link href={href(locale, "practice", a.slug)} className="text-ink underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold-dark">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  if (member.qualifications.length) details.push({ label: t.qualifications, icon: GraduationCap, content: list(member.qualifications) });
  if (member.barAdmission) details.push({ label: t.bar, icon: Scale, content: <p>{member.barAdmission}</p> });
  if (member.languages.length) details.push({ label: t.languages, icon: Languages, content: <p>{member.languages.join(", ")}</p> });

  return (
    <>
      <section className="bg-charcoal text-white">
        <div className="shell grid gap-8 pb-16 pt-12 md:grid-cols-12 md:pb-36 md:pt-16">
          <div className="md:col-span-7 md:col-start-6">
            <Breadcrumb items={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: dict.common.backToTeam, href: href(locale, "team") }, { label: member.name }]} />
            <p className="eyebrow mt-8">{dict.home.teamEyebrow}</p>
            <h1 className="display mt-5 text-[clamp(2.5rem,1.8rem+3vw,4.25rem)]">{member.name}</h1>
            <p className="mt-3 text-[1.125rem] font-medium text-gold">{member.title}</p>
          </div>
        </div>
      </section>

      <article className="shell grid gap-12 pb-24 md:grid-cols-12 md:gap-8 md:pb-32">
        <aside className="-mt-10 md:col-span-4 md:-mt-28">
          <div className="space-y-5 md:sticky md:top-32">
            <div className="card overflow-hidden p-3 shadow-[0_30px_60px_-35px_rgb(0_0_0/0.5)]">
              <Portrait
                name={member.name}
                src={member.profilePhoto}
                position={member.photoPosition}
                pendingLabel={dict.common.photoPending}
                sizes="(min-width: 768px) 30vw, 100vw"
                priority
              />
            </div>
            <div className="card space-y-3 p-5 text-[0.9375rem]">
              {member.email && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-3 break-all text-ink transition-colors hover:text-gold-dark">
                  <Mail aria-hidden className="h-5 w-5 flex-none text-gold" />
                  {member.email}
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} rel="noopener noreferrer" target="_blank" className="flex items-center gap-3 text-ink transition-colors hover:text-gold-dark">
                  <SquareArrowOutUpRight aria-hidden className="h-5 w-5 flex-none text-gold" />
                  {t.linkedin}
                </a>
              )}
              <Link href={href(locale, "contact")} className="btn btn-gold w-full">
                <CalendarCheck aria-hidden className="h-4 w-4" />
                {dict.common.consult}
              </Link>
            </div>
          </div>
        </aside>

        <div className="pt-4 md:col-span-7 md:col-start-6 md:pt-14">
          <div className="prose-legal">
            {member.bio.map((p, i) => (
              <p key={i} className={i === 0 ? "text-[1.1875rem] text-ink" : undefined}>
                {p}
              </p>
            ))}
          </div>

          {details.length > 0 && (
            <dl className="mt-14 grid gap-5 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="card p-6 text-[0.9375rem] text-ink-soft">
                  <dt className="mb-4 flex items-center gap-3 font-display text-[1.0625rem] font-semibold text-ink">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-ink">
                      <d.icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    {d.label}
                  </dt>
                  <dd>{d.content}</dd>
                </div>
              ))}
            </dl>
          )}

          {distinctions.length > 0 && (
            <section aria-labelledby="distinctions" className="mt-14">
              <h2 id="distinctions" className="heading text-[clamp(1.5rem,1.3rem+0.8vw,2rem)]">
                {t.distinctions}
              </h2>
              <div className="mt-6">
                <AwardGallery items={distinctions} labels={dict.common.gallery} columns={3} />
              </div>
            </section>
          )}
        </div>
      </article>

      <ContactBand locale={locale} dict={dict} />
      <JsonLd data={personSchema(member, locale, isLawyer ? areas : [])} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.team, path: href(locale, "team") },
          { name: member.name, path: href(locale, "team", member.slug) },
        ])}
      />
    </>
  );
}
