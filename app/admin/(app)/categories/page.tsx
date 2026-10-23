import type { Metadata } from "next";
import { ConfirmAction } from "@/components/admin/client";
import { CategoryForm } from "@/components/admin/forms";
import { Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { deleteCategory } from "../../actions/misc";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Catégories") };
}

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase, staff } = await requireStaff();
  const { ok } = await searchParams;
  const [{ data: categories }, { data: usage }] = await Promise.all([
    supabase.from("article_categories").select("id, name_fr, name_en, slug").order("sort_order"),
    supabase.from("articles").select("category_id"),
  ]);
  const t = await getT();
  const locale = await getAdminLocale();
  const counts = new Map<string, number>();
  for (const a of usage ?? []) if (a.category_id) counts.set(a.category_id, (counts.get(a.category_id) ?? 0) + 1);

  return (
    <>
      <PageHeader title={t("Catégories")} description={t("Les catégories classent les actualités et servent de filtres sur la page Actualités du site.")} />
      {ok === "supprime" && <Notice tone="success">{t("Catégorie supprimée. Les actualités concernées sont désormais sans catégorie.")}</Notice>}

      <section className={`${panelClass} p-6`}>
        <h2 className="mb-4 font-sans text-[1rem] font-semibold">{t("Nouvelle catégorie")}</h2>
        <CategoryForm />
      </section>

      <ul className="mt-8 space-y-3">
        {(categories ?? []).map((c) => (
          <li key={c.id} className={`${panelClass} p-5`}>
            <CategoryForm category={c} />
            <div className="mt-3 flex items-center justify-between text-[0.8125rem] text-slate">
              <span>
                {(counts.get(c.id) ?? 0) > 1 ? t("{n} actualités", { n: counts.get(c.id) ?? 0 }) : t("{n} actualité", { n: counts.get(c.id) ?? 0 })}
              </span>
              {staff.role === "admin" && (
                <ConfirmAction
                  action={deleteCategory}
                  fields={{ id: c.id }}
                  label={t("Supprimer")}
                  title={t("Supprimer la catégorie « {name} » ?", { name: locale === "en" ? c.name_en : c.name_fr })}
                  body={t("Les actualités de cette catégorie seront conservées, sans catégorie.")}
                  confirmLabel={t("Supprimer")}
                  className="link text-danger"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
