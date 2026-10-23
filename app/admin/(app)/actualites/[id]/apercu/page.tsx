import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/ArticleView";
import { getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { articleFromRecord } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Aperçu") };
}

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

  const t = await getT();
  const locale: Locale = langue === "en" ? "en" : "fr";
  const article = articleFromRecord(data as Parameters<typeof articleFromRecord>[0], locale);
  const live = data.status === "published" && data.published_at && new Date(data.published_at) <= new Date();

  return (
    // Escape the dashboard padding so the preview matches the public page.
    <div className="-mx-5 -my-8 bg-white sm:-mx-8 lg:-my-12">
      <div className="sticky top-[4.5rem] z-10 flex flex-wrap items-center justify-between gap-3 bg-gold lg:top-0 px-5 py-2.5 text-[0.875rem] font-medium text-ink sm:px-8">
        <span>
          {t("Aperçu")} — {live ? t("cette actualité est en ligne") : t("non visible sur le site")} · {locale === "fr" ? t("version française") : t("version anglaise")}
        </span>
        <span className="flex gap-4">
          <Link href={`?langue=${locale === "fr" ? "en" : "fr"}`} className="underline">
            {locale === "fr" ? t("Voir en anglais") : t("Voir en français")}
          </Link>
          <Link href={`/admin/actualites/${id}`} className="underline">
            {t("Retour à l'édition")}
          </Link>
        </span>
      </div>
      <ArticleView article={article} locale={locale} dict={getDictionary(locale)} crumbs={false} />
    </div>
  );
}
