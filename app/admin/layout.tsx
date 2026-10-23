import type { Metadata } from "next";
import { DM_Sans, Heebo } from "next/font/google";
import { AdminI18nProvider } from "@/components/admin/i18n";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import "../globals.css";

const display = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans", display: "swap" });
const sans = Heebo({ subsets: ["latin"], variable: "--font-heebo", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t("Administration"), template: `%s · ${t("Administration Abeng Law")}` },
    robots: { index: false, follow: false },
  };
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getAdminLocale();
  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-stone text-ink">
        <AdminI18nProvider locale={locale}>{children}</AdminI18nProvider>
      </body>
    </html>
  );
}
