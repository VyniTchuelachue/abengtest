import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/ArticleView";
import { requireStaff } from "@/lib/auth";
import { articleFromRecord } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/routes";

export const metadata: Metadata = { title: "Aperçu" };

export default async function PreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ langue?: string }> }) {
  const { supabase } = await requireStaff();
  const { id } = await params;
  const { langue } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase
    .from("articles")
    .select("*, category:article_categories(*), author:team_members(slug, full_name, title_en, title_fr)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const locale: Locale = langue === "en" ? "en" : "fr";
  const article = articleFromRecord(data as Parameters<typeof articleFromRecord>[0], locale);
  const live = data.status === "published" && data.published_at && new Date(data.published_at) <= new Date();

  return (
    // Escape the dashboard padding so the preview matches the public page.
    <div className="-mx-5 -my-8 bg-paper sm:-mx-8 lg:-my-12">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-brass px-5 py-2.5 text-[0.875rem] text-white sm:px-8">
        <span>
          Aperçu {live ? "— cette actualité est en ligne" : "— non visible sur le site"} · version {locale === "fr" ? "française" : "anglaise"}
        </span>
        <span className="flex gap-4">
          <Link href={`?langue=${locale === "fr" ? "en" : "fr"}`} className="underline">
            Voir en {locale === "fr" ? "anglais" : "français"}
          </Link>
          <Link href={`/admin/actualites/${id}`} className="underline">
            Retour à l&apos;édition
          </Link>
        </span>
      </div>
      <ArticleView article={article} locale={locale} dict={getDictionary(locale)} />
    </div>
  );
}
