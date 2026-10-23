import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmAction } from "@/components/admin/client";
import { Notice, PageHeader } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { deleteArticle } from "../../../actions/articles";
import { articleOptions } from "../options";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Modifier l'actualité") };
}

const flashes: Record<string, string> = {
  publish: "Actualité créée et publiée. Elle est visible sur le site.",
  draft: "Brouillon créé.",
  save: "Actualité créée.",
};

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const { supabase } = await requireStaff();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!article) notFound();
  const { categories, authors } = await articleOptions(supabase, await getAdminLocale());
  const t = await getT();

  return (
    <>
      <PageHeader
        title={article.title_fr || article.title_en || t("Actualité")}
        back={{ href: "/admin/actualites", label: t("Actualités") }}
        actions={
          <ConfirmAction
            action={deleteArticle}
            fields={{ id: article.id }}
            label={t("Supprimer")}
            title={t("Supprimer cette actualité ?")}
            body={t("L'actualité sera retirée du site et supprimée définitivement, dans ses deux langues. Cette action est irréversible.")}
            confirmLabel={t("Supprimer définitivement")}
          />
        }
      />
      {erreur === "suppression" && <Notice tone="error">{t("La suppression a échoué. Réessayez.")}</Notice>}
      <ArticleForm values={article} categories={categories} authors={authors} flash={ok && flashes[ok] ? t(flashes[ok]) : undefined} />
    </>
  );
}
