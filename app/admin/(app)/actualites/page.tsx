import type { Metadata } from "next";
import Link from "next/link";
import { Badge, EmptyState, Notice, PageHeader, articleStatus, inputClass, panelClass } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { href } from "@/lib/routes";

export const metadata: Metadata = { title: "Actualités" };

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
    .select("id, slug, status, published_at, updated_at, title_fr, title_en, category:article_categories(name_fr)")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false })
    .limit(200);
  if (statut === "published" || statut === "draft") query = query.eq("status", statut);
  const term = q.trim().replace(/[%_,()"\\]/g, " ");
  if (term) query = query.or(`title_fr.ilike.%${term}%,title_en.ilike.%${term}%`);
  const { data: articles } = await query;

  return (
    <>
      <PageHeader
        title="Actualités"
        description="Rédigez, publiez et organisez les actualités du cabinet en français et en anglais."
        actions={
          <Link href="/admin/actualites/nouveau" className="btn btn-primary">
            Rédiger une actualité
          </Link>
        }
      />
      {ok === "supprime" && <Notice tone="success">Actualité supprimée.</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filtrer par statut" className="flex gap-1">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/actualites${f.value ? `?statut=${f.value}` : ""}`}
              aria-current={statut === f.value ? "page" : undefined}
              className="rounded-sm px-3 py-1.5 text-[0.875rem] text-ink-soft hover:bg-stone aria-[current=page]:bg-ink aria-[current=page]:text-paper"
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form role="search" className="flex gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <label className="sr-only" htmlFor="q">
            Rechercher une actualité
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Rechercher un titre…" className={`${inputClass} mt-0 w-64`} />
          <button className="btn btn-quiet min-h-0 py-2">Rechercher</button>
        </form>
      </div>

      {!articles || articles.length === 0 ? (
        <EmptyState
          title={q ? "Aucun résultat" : "Aucune actualité"}
          body={q ? "Aucune actualité ne correspond à cette recherche." : "Rédigez la première actualité du cabinet : elle apparaîtra sur le site dès sa publication."}
          action={
            <Link href="/admin/actualites/nouveau" className="btn btn-primary">
              Rédiger une actualité
            </Link>
          }
        />
      ) : (
        <div className={`${panelClass} overflow-x-auto`}>
          <table className="w-full min-w-[44rem] text-left text-[0.9375rem]">
            <thead className="border-b border-rule text-[0.8125rem] text-slate">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Titre</th>
                <th scope="col" className="px-3 py-3 font-medium">Langues</th>
                <th scope="col" className="px-3 py-3 font-medium">Catégorie</th>
                <th scope="col" className="px-3 py-3 font-medium">Statut</th>
                <th scope="col" className="px-3 py-3 font-medium">Publication</th>
                <th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {articles.map((a) => {
                const key = a.status === "published" && a.published_at && new Date(a.published_at) > new Date() ? "scheduled" : a.status;
                const category = (a.category as { name_fr: string } | null)?.name_fr;
                return (
                  <tr key={a.id} className="hover:bg-paper/70">
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
                      <Badge tone={articleStatus[key].tone}>{articleStatus[key].label}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-ink-soft">{a.published_at ? formatDate(a.published_at, "fr", "short") : "—"}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <Link href={`/admin/actualites/${a.id}`} className="link mr-4">
                        Modifier
                      </Link>
                      {key === "published" && (
                        <a href={href(a.title_fr ? "fr" : "en", "insights", a.slug)} target="_blank" rel="noopener" className="link text-slate">
                          Voir
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
