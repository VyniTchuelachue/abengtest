import Image from "next/image";
import Link from "next/link";
import { href, type Locale } from "@/lib/routes";
import { phones, type Dictionary } from "@/lib/dictionaries";
import { telHref } from "@/lib/format";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  const links = (["firm", "practice", "team", "insights", "contact"] as const).map((key) => ({ key, label: dict.nav[key] }));

  return (
    <footer className="border-t border-rule bg-stone text-ink-soft">
      <div className="shell grid gap-12 py-16 md:grid-cols-12 md:gap-8 lg:py-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <Image src="/images/crest.png" alt="" width={56} height={56} className="h-14 w-14" />
            <p className="font-serif text-xl text-ink">The Abeng Law Firm</p>
          </div>
          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed">{dict.footer.tagline}</p>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-[0.8125rem] font-medium text-ink">{dict.contactBand.address}</h2>
          <address className="mt-4 text-[0.9375rem] not-italic leading-relaxed">
            {dict.address.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="block">{dict.address.poBox}</span>
          </address>
          <ul className="mt-4 space-y-1 text-[0.9375rem]">
            {phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="link text-ink">
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={dict.footer.navTitle} className="md:col-span-2 md:col-start-11">
          <h2 className="font-sans text-[0.8125rem] font-medium text-ink">{dict.footer.navTitle}</h2>
          <ul className="mt-4 space-y-2 text-[0.9375rem]">
            {links.map(({ key, label }) => (
              <li key={key}>
                <Link href={href(locale, key)} className="transition-colors hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-rule">
        <div className="shell flex flex-col gap-2 py-6 text-[0.8125rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} The Abeng Law Firm. {dict.footer.rights}
          </p>
          <p>{dict.footer.ohada}</p>
        </div>
      </div>
    </footer>
  );
}
