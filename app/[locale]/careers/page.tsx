import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, Award, BookOpen, Briefcase, CheckCircle2, Globe2, GraduationCap, Languages, Lightbulb, Mailbox, MapPin, Phone, Scale, Users } from "lucide-react";
import { PageIntro, SectionHeading } from "@/components/site/blocks";
import { ContactForm } from "@/components/site/ContactForm";
import { getDictionary, phones } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";
import { alternatesFor, href, isLocale } from "@/lib/routes";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.careersPage.metaTitle,
    description: dict.careersPage.metaDescription,
    alternates: alternatesFor({ en: href("en", "careers"), fr: href("fr", "careers") }, locale),
  };
}

const whyIcons = [Briefcase, Languages, Globe2, Award];
const profileIcons = [Scale, GraduationCap, BookOpen, Users];

export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const t = dict.careersPage;
  // "Careers" / "Recrutement" in the contact subjects, so applications are easy to spot in the dashboard.
  const subject = dict.contactPage.subjects[2];

  return (
    <>
      <PageIntro title={t.title} lede={t.lede} eyebrow={dict.teamPage.joinTitle} crumbs={[{ label: dict.nav.homeLabel, href: href(locale) }, { label: t.title }]}>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={`#${t.anchor}`} className="btn btn-gold">
            {t.applyCta}
            <ArrowDown aria-hidden className="h-4 w-4" />
          </a>
          <Link href={href(locale, "team")} className="btn btn-outline-light">
            {dict.common.meetTeam}
          </Link>
        </div>
      </PageIntro>

      {/* Why join */}
      <section className="py-20 md:py-28">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src="/images/team-v2.jpg" alt={dict.home.heroCaption} fill quality={80} sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" style={{ objectPosition: "38% 20%" }} />
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t.whyEyebrow} title={t.whyTitle} />
            <ul className="mt-10 grid gap-5 sm:grid-cols-2">
              {t.why.map((w, i) => {
                const Icon = whyIcons[i] ?? Briefcase;
                return (
                  <li key={w.title} className="card p-6">
                    <span className="icon-tile">
                      <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-5 font-display text-[1.125rem] font-semibold text-ink">{w.title}</h3>
                    <p className="mt-2 text-[0.9375rem] text-ink-soft">{w.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Profiles and expectations */}
      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="shell">
          <SectionHeading eyebrow={t.profilesEyebrow} title={t.profilesTitle} lede={t.profilesLede} align="center" dark />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.profiles.map((p, i) => {
              const Icon = profileIcons[i] ?? Scale;
              return (
                <li key={p.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7">
                  <span className="icon-tile">
                    <Icon aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-6 font-display text-[1.1875rem] font-semibold">{p.title}</h3>
                  <p className="mt-3 text-[0.9375rem] text-white/70">{p.body}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 rounded-[1.25rem] border border-gold/30 bg-gold/[0.08] p-7 md:p-9">
            <h3 className="font-display text-[1.1875rem] font-semibold text-gold">{t.valuesTitle}</h3>
            <ul className="mt-5 grid gap-x-8 gap-y-3 text-[0.9375rem] text-white/85 sm:grid-cols-2 lg:grid-cols-3">
              {t.values.map((v) => (
                <li key={v} className="flex gap-2.5">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-stone py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={t.processEyebrow} title={t.processTitle} />
            <ol className="mt-12">
              {t.steps.map((s, i) => (
                <li key={s.title} className="relative flex gap-6 pb-10 last:pb-0">
                  {i < t.steps.length - 1 && <span aria-hidden className="absolute left-6 top-14 bottom-2 w-px bg-gold/40" />}
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gold font-display text-[1rem] font-bold text-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-2">
                    <h3 className="font-display text-[1.1875rem] font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2 text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="lg:col-span-5 lg:pt-24">
            <div className="card p-7 md:p-9 lg:sticky lg:top-32">
              <span className="icon-tile">
                <Lightbulb aria-hidden className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 font-display text-[1.25rem] font-semibold text-ink">{t.tipsTitle}</h3>
              <ul className="mt-5 space-y-3 text-[0.9375rem] text-ink-soft">
                {t.tips.map((tip) => (
                  <li key={tip} className="flex gap-2.5">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                    {tip}
                  </li>
                ))}
              </ul>
              <Link href={href(locale, "practice")} className="more mt-7">
                {dict.common.allPracticeAreas}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Application form */}
      <section id={t.anchor} className="scroll-mt-28 py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t.formEyebrow} title={t.formTitle} lede={t.formLede} />
            <h3 className="mt-10 font-display text-[1.0625rem] font-semibold text-ink">{t.otherWays}</h3>
            <ul className="mt-5 space-y-5 text-[0.9375rem] text-ink-soft">
              <li className="flex gap-4">
                <span className="icon-tile">
                  <MapPin aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{t.dropOff}</span>
                  <address className="not-italic">
                    {dict.address.lines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="icon-tile">
                  <Mailbox aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{t.byPost}</span>
                  {dict.address.poBox}, Douala
                </span>
              </li>
              <li className="flex gap-4">
                <span className="icon-tile">
                  <Phone aria-hidden className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{t.byPhone}</span>
                  <span className="flex flex-col">
                    {phones.map((p) => (
                      <a key={p} href={telHref(p)} className="w-fit transition-colors hover:text-gold-dark">
                        {p}
                      </a>
                    ))}
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="card p-6 shadow-[0_30px_60px_-40px_rgb(0_0_0/0.45)] sm:p-10">
              <ContactForm locale={locale} t={dict.contactPage} fixedSubject={subject} messageLabel={t.messageLabel} submitLabel={t.submit} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
