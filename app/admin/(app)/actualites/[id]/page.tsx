import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmAction } from "@/components/admin/client";
import { Notice, PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deleteArticle } from "../../../actions/articles";
import { articleOptions } from "../options";

export const metadata: Metadata = { title: "Modifier l'actualité" };

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
  const { categories, authors } = await articleOptions(supabase);

  return (
    <>
      <PageHeader
        title={article.title_fr || article.title_en || "Actualité"}
        back={{ href: "/admin/actualites", label: "Actualités" }}
        actions={
          <ConfirmAction
            action={deleteArticle}
            fields={{ id: article.id }}
            label="Supprimer"
            title="Supprimer cette actualité ?"
            body="L'actualité sera retirée du site et supprimée définitivement, dans ses deux langues. Cette action est irréversible."
            confirmLabel="Supprimer définitivement"
          />
        }
      />
      {erreur === "suppression" && <Notice tone="error">La suppression a échoué. Réessayez.</Notice>}
      <ArticleForm values={article} categories={categories} authors={authors} flash={ok ? flashes[ok] : undefined} />
    </>
  );
}
