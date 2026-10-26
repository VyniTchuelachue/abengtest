import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { DM_Sans, Heebo } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { firmEmail, getDictionary, phones } from "@/lib/dictionaries";
import { isLocale, locales, siteUrl } from "@/lib/routes";
import { getPracticeAreas } from "@/lib/data";
import { siteSchema } from "@/lib/structured-data";
import "../globals.css";

const display = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const sans = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
  display: "swap",
});

// Unknown locales are rejected below (and redirected by the proxy). dynamicParams
// stays at its default so articles and profiles created after a deploy render on demand.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.defaultTitle, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.defaultDescription,
    applicationName: dict.meta.siteName,
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: locale === "fr" ? "fr_CM" : "en_GB",
      alternateLocale: locale === "fr" ? "en_GB" : "fr_CM",
      images: [{ url: "/images/team-v2.jpg", width: 2400, height: 1510, alt: dict.home.heroCaption }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#2b2b2d",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const areas = await getPracticeAreas(locale);

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header locale={locale} nav={dict.nav} phones={phones} email={firmEmail} consult={dict.common.consult} addressShort={dict.address.short} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} />
        <JsonLd data={siteSchema(locale, areas)} />
      </body>
    </html>
  );
}
