import "server-only";
import type { AdminLocale } from "@/lib/admin-i18n";
import type { Session } from "@/lib/auth";

const rank = ["partner", "senior_associate", "lawyer"];

/** Category and author choices for the article form. */
export async function articleOptions(supabase: Session["supabase"], locale: AdminLocale) {
  const [{ data: categories }, { data: authors }] = await Promise.all([
    supabase.from("article_categories").select("id, name_fr, name_en").order("sort_order"),
    supabase.from("team_members").select("id, full_name, group_key").in("group_key", ["partner", "senior_associate", "lawyer"]).neq("status", "inactive").order("sort_order"),
  ]);
  return {
    categories: (categories ?? []).map((c) => ({ id: c.id, label: (locale === "en" ? c.name_en : c.name_fr) || c.name_fr })),
    authors: (authors ?? [])
      .sort((a, b) => rank.indexOf(a.group_key) - rank.indexOf(b.group_key))
      .map((a) => ({ id: a.id, label: a.full_name })),
  };
}
