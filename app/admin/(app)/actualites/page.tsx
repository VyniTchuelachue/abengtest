import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, Notice, PageHeader, articleStatus, inputClass, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { href } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Actualités") };
}

const filters = [
  { value: "", label: "Toutes" },
  { value: "published", label: "Publiées" },
  { value: "draft", label: "Brouillons" },
];

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string; ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { statut = "", q = "", ok } = await searchParams;

  let query = supabase
    .from("articles")
    .select("id, slug, status, published_at, updated_at, title_fr, title_en, category:article_categories(name_fr, name_en)")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false })
    .limit(200);
  if (statut === "published" || statut === "draft") query = query.eq("status", statut);
  const term = q.trim().replace(/[%_,()"\\]/g, " ");
  if (term) query = query.or(`title_fr.ilike.%${term}%,title_en.ilike.%${term}%`);
  const { data: articles } = await query;
  const t = await getT();
  const locale = await getAdminLocale();

  return (
    <>
      <PageHeader
        title={t("Actualités")}
        description={t("Rédigez, publiez et organisez les actualités du cabinet en français et en anglais.")}
        actions={
          <Link href="/admin/actualites/nouveau" className="btn btn-gold">
            {t("Rédiger une actualité")}
          </Link>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Actualité supprimée.")}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label={t("Filtrer par statut")} className="flex gap-1">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/actualites${f.value ? `?statut=${f.value}` : ""}`}
              aria-current={statut === f.value ? "page" : undefined}
              className="rounded-full px-3.5 py-1.5 text-[0.875rem] text-ink-soft hover:bg-white aria-[current=page]:bg-charcoal aria-[current=page]:text-white"
            >
              {t(f.label)}
            </Link>
          ))}
        </nav>
        <form role="search" className="flex gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <label className="sr-only" htmlFor="q">
            {t("Rechercher une actualité")}
          </label>
          <input id="q" name="q" defaultValue={q} placeholder={t("Rechercher un titre…")} className={`${inputClass} mt-0 w-64`} />
          <button className="btn btn-quiet min-h-0 py-2">{t("Rechercher")}</button>
        </form>
      </div>

      {!articles || articles.length === 0 ? (
        <EmptyState
          title={q ? t("Aucun résultat") : t("Aucune actualité")}
          body={q ? t("Aucune actualité ne correspond à cette recherche.") : t("Rédigez la première actualité du cabinet : elle apparaîtra sur le site dès sa publication.")}
          action={
            <Link href="/admin/actualites/nouveau" className="btn btn-gold">
              {t("Rédiger une actualité")}
            </Link>
          }
        />
      ) : (
        <div className={`${panelClass} overflow-x-auto`}>
          <table className="w-full min-w-[44rem] text-left text-[0.9375rem]">
            <thead className="border-b border-rule text-[0.8125rem] text-slate">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">{t("Titre")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("Langues")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("Catégorie")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("Statut")}</th>
                <th scope="col" className="px-3 py-3 font-medium">{t("Publication")}</th>
                <th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">{t("Actions")}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {articles.map((a) => {
                const key = a.status === "published" && a.published_at && new Date(a.published_at) > new Date() ? "scheduled" : a.status;
                const cat = a.category as { name_fr: string; name_en: string } | null;
                const category = cat ? (locale === "en" ? cat.name_en : cat.name_fr) || cat.name_fr : null;
                return (
                  <tr key={a.id} className="hover:bg-stone/60">
                    <td className="max-w-md px-5 py-3.5">
                      <Link href={`/admin/actualites/${a.id}`} className="font-medium hover:underline">
                        {a.title_fr || a.title_en}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex gap-1">
                        {a.title_fr && <Badge tone="grey">FR</Badge>}
                        {a.title_en && <Badge tone="grey">EN</Badge>}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-ink-soft">{category ?? "—"}</td>
                    <td className="px-3 py-3.5">
                      <Badge tone={articleStatus[key].tone}>{t(articleStatus[key].label)}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-ink-soft">{a.published_at ? formatDate(a.published_at, locale, "short") : "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Link href={`/admin/actualites/${a.id}`} className="link mr-4">
                        {t("Modifier")}
                      </Link>
                      {key === "published" && (
                        <a href={href(a.title_fr ? "fr" : "en", "insights", a.slug)} target="_blank" rel="noopener" className="link text-slate">
                          {t("Voir")}
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
