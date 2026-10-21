import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { getDictionary, phones } from "@/lib/dictionaries";
import { isLocale, locales, siteUrl } from "@/lib/routes";
import { legalServiceSchema } from "@/lib/structured-data";
import "../globals.css";

const serif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hanken",
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
      images: [{ url: "/images/team.jpg", width: 2048, height: 1365, alt: dict.home.heroCaption }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5f5f1",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header locale={locale} nav={dict.nav} phones={phones} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} />
        <JsonLd data={legalServiceSchema(locale)} />
      </body>
    </html>
  );
}
