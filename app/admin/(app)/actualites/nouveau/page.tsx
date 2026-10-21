import type { Metadata } from "next";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { articleOptions } from "../options";

export const metadata: Metadata = { title: "Nouvelle actualité" };

export default async function NewArticlePage() {
  const { supabase } = await requireStaff();
  const { categories, authors } = await articleOptions(supabase);
  return (
    <>
      <PageHeader title="Nouvelle actualité" back={{ href: "/admin/actualites", label: "Actualités" }} />
      <ArticleForm
        categories={categories}
        authors={authors}
        values={{
          id: null,
          slug: "",
          status: "draft",
          published_at: null,
          category_id: null,
          author_id: null,
          cover_path: null,
          cover_alt_fr: null,
          cover_alt_en: null,
          title_fr: null,
          title_en: null,
          excerpt_fr: null,
          excerpt_en: null,
          body_fr: null,
          body_en: null,
        }}
      />
    </>
  );
}
