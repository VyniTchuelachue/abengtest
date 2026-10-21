import type { Metadata } from "next";
import { DM_Sans, Heebo } from "next/font/google";
import "../globals.css";

const display = DM_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-dm-sans", display: "swap" });
const sans = Heebo({ subsets: ["latin"], variable: "--font-heebo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration Abeng Law" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-stone text-ink">{children}</body>
    </html>
  );
}
