import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { href, type Locale } from "@/lib/routes";
import { firmEmail, phones, type Dictionary } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const links = (["firm", "practice", "team", "insights", "careers", "contact"] as const).map((key) => ({ key, label: dict.nav[key] }));

  return (
    <footer className="bg-charcoal text-mist">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:gap-8 lg:py-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <Image src="/images/crest.png" alt="" width={60} height={60} className="h-14 w-14" />
            <div>
              <p className="font-display text-xl font-semibold text-white">The Abeng Law Firm</p>
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.2em] text-gold">{locale === "fr" ? "Avocats d'affaires" : "Business lawyers"}</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed">{dict.footer.tagline}</p>
          <Link href={href(locale, "contact")} className="btn btn-gold mt-8">
            {dict.common.consult}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <nav aria-label={dict.footer.navTitle} className="md:col-span-3">
          <h2 className="font-display text-[1.125rem] font-semibold text-white">{dict.footer.navTitle}</h2>
          <ul className="mt-5 space-y-2.5 text-[0.9375rem]">
            {links.map(({ key, label }) => (
              <li key={key}>
                <Link href={href(locale, key)} className="inline-flex items-center gap-2 transition-colors hover:text-gold">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-display text-[1.125rem] font-semibold text-white">{dict.footer.contactTitle}</h2>
          <ul className="mt-5 space-y-4 text-[0.9375rem]">
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold" />
              <address className="not-italic leading-relaxed">
                {dict.address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block">{dict.address.poBox}</span>
              </address>
            </li>
            {phones.map((p) => (
              <li key={p} className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold" />
                <a href={telHref(p)} className="transition-colors hover:text-white">
                  {p}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 h-5 w-5 flex-none text-gold" />
              <a href={`mailto:${firmEmail}`} className="break-all transition-colors hover:text-white">
                {firmEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell py-6 text-[0.8125rem]">
          <p>
            © {year} The Abeng Law Firm. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
