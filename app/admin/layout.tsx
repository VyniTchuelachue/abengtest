import type { Metadata } from "next";
import { Hanken_Grotesk, Source_Serif_4 } from "next/font/google";
import "../globals.css";

const serif = Source_Serif_4({ subsets: ["latin", "latin-ext"], axes: ["opsz"], variable: "--font-source-serif", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration Abeng Law" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">{children}</body>
    </html>
  );
}
