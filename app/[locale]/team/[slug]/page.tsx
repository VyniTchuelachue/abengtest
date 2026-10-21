import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, ContactBand } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/JsonLd";
import { Portrait } from "@/components/site/Portrait";
import { getMember, getMemberAreas, getTeam, isLawyerGroup } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
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
      title: member.name,
      description,
      images: member.photo ? [{ url: member.photo, width: 1200, height: 1500, alt: member.name }] : undefined,
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

  const details: { label: string; content: React.ReactNode }[] = [];
  if (member.focusAreas.length)
    details.push({
      label: t.focus,
      content: (
        <ul className="space-y-1.5">
          {member.focusAreas.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    });
  if (isLawyer && areas.length)
    details.push({
      label: t.practiceAreas,
      content: (
        <ul className="space-y-1.5">
          {areas.map((a) => (
            <li key={a.id}>
              <Link href={href(locale, "practice", a.slug)} className="link">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      ),
    });
  if (member.qualifications.length)
    details.push({
      label: t.qualifications,
      content: (
        <ul className="space-y-1.5">
          {member.qualifications.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      ),
    });
  if (member.barAdmission) details.push({ label: t.bar, content: <p>{member.barAdmission}</p> });
  if (member.languages.length) details.push({ label: t.languages, content: <p>{member.languages.join(", ")}</p> });

  return (
    <>
      <Breadcrumb items={[{ label: dict.common.backToTeam, href: href(locale, "team") }, { label: member.name }]} />

      <article className="shell grid gap-12 pb-24 pt-10 md:grid-cols-12 md:gap-8 md:pb-32 md:pt-14">
        <aside className="md:col-span-4">
          <div className="md:sticky md:top-28">
            <Portrait
              name={member.name}
              src={member.photo}
              position={member.photoPosition}
              pendingLabel={dict.common.photoPending}
              sizes="(min-width: 768px) 30vw, 100vw"
              priority
            />
            {(member.email || member.linkedin) && (
              <div className="mt-6 space-y-2 text-[0.9375rem]">
                {member.email && (
                  <p>
                    <span className="text-slate">{t.email} </span>
                    <a href={`mailto:${member.email}`} className="link break-all">
                      {member.email}
                    </a>
                  </p>
                )}
                {member.linkedin && (
                  <p>
                    <a href={member.linkedin} className="link" rel="noopener noreferrer" target="_blank">
                      {t.linkedin}
                    </a>
                  </p>
                )}
              </div>
            )}
            <Link href={href(locale, "contact")} className="btn btn-quiet mt-6 w-full">
              {dict.common.consult}
            </Link>
          </div>
        </aside>

        <div className="md:col-span-7 md:col-start-6">
          <p className="text-[0.9375rem] text-slate">{member.title}</p>
          <h1 className="display mt-3 text-[clamp(2.75rem,1.8rem+3.4vw,4.75rem)]">{member.name}</h1>

          <div className="prose-legal mt-10">
            {member.bio.map((p, i) => (
              <p key={i} className={i === 0 ? "text-ink" : undefined}>
                {p}
              </p>
            ))}
          </div>

          {details.length > 0 && (
            <dl className="mt-16 grid gap-x-8 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="border-t border-rule py-6 text-[0.9375rem] text-ink-soft">
                  <dt className="mb-3 font-medium text-ink">{d.label}</dt>
                  <dd>{d.content}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </article>

      <ContactBand locale={locale} dict={dict} />
      <JsonLd data={personSchema(member, locale)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: dict.nav.team, path: href(locale, "team") },
          { name: member.name, path: href(locale, "team", member.slug) },
        ])}
      />
    </>
  );
}
