"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff, type ActionResult } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { refreshPublic } from "@/lib/revalidate";
import { plainText, sanitizeArticleHtml } from "@/lib/sanitize";

const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : null));
const uuidOrNull = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .pipe(z.string().uuid().nullable());

const schema = z.object({
  id: uuidOrNull,
  intent: z.enum(["save", "draft", "publish", "unpublish"]),
  slug: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? slugify(v) : "")),
  category_id: uuidOrNull,
  author_id: uuidOrNull,
  published_at: z.string().optional(),
  cover_path: optional(300),
  cover_alt_fr: optional(240),
  cover_alt_en: optional(240),
  title_fr: optional(200),
  title_en: optional(200),
  excerpt_fr: optional(600),
  excerpt_en: optional(600),
  body_fr: z.string().max(200000).optional(),
  body_en: z.string().max(200000).optional(),
});

export type ArticleActionResult = ActionResult & { savedAt?: number };

function cleanBody(html: string | undefined): string | null {
  if (!html) return null;
  const safe = sanitizeArticleHtml(html);
  return plainText(safe) || safe.includes("<img") ? safe : null;
}

export async function saveArticle(_: ArticleActionResult, formData: FormData): Promise<ArticleActionResult> {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Certains champs ne sont pas valides. Vérifiez le formulaire." };
  }
  const d = parsed.data;
  const body_fr = cleanBody(d.body_fr);
  const body_en = cleanBody(d.body_en);

  const fieldErrors: Record<string, string> = {};
  if (!d.title_fr && !d.title_en) fieldErrors.title_fr = "Indiquez un titre, en français ou en anglais.";
  if (d.intent === "publish") {
    if (d.title_fr && !body_fr) fieldErrors.body_fr = "Rédigez le texte de la version française avant de publier.";
    if (d.title_en && !body_en) fieldErrors.body_en = "Rédigez le texte de la version anglaise avant de publier.";
  }
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "L'actualité n'a pas été enregistrée. Corrigez les champs signalés.", fieldErrors };
  }

  // Current state, for status transitions and cover clean-up.
  const existing = d.id
    ? (await supabase.from("articles").select("status, published_at, cover_path, slug").eq("id", d.id).maybeSingle()).data
    : null;
  if (d.id && !existing) return { ok: false, message: "Cette actualité n'existe plus." };

  const status = d.intent === "publish" ? "published" : d.intent === "save" && existing ? existing.status : "draft";
  const chosenDate = d.published_at ? new Date(d.published_at) : null;
  const published_at =
    chosenDate && !Number.isNaN(chosenDate.getTime())
      ? chosenDate.toISOString()
      : status === "published"
        ? (existing?.published_at ?? new Date().toISOString())
        : (existing?.published_at ?? null);

  const slug = await uniqueSlug(supabase, d.slug || existing?.slug || slugify(d.title_fr || d.title_en || "actualite"), d.id);

  const record = {
    slug,
    status,
    published_at,
    category_id: d.category_id,
    author_id: d.author_id,
    cover_path: d.cover_path,
    cover_alt_fr: d.cover_alt_fr,
    cover_alt_en: d.cover_alt_en,
    title_fr: d.title_fr,
    title_en: d.title_en,
    excerpt_fr: d.excerpt_fr,
    excerpt_en: d.excerpt_en,
    body_fr,
    body_en,
  } as const;

  let id = d.id;
  if (id) {
    const { error } = await supabase.from("articles").update(record).eq("id", id);
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  } else {
    const { data, error } = await supabase.from("articles").insert(record).select("id").single();
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
    id = data.id;
  }

  if (existing?.cover_path && existing.cover_path !== d.cover_path && existing.cover_path.startsWith("articles/")) {
    await supabase.storage.from("media").remove([existing.cover_path]);
  }

  refreshPublic("articles");

  const messages = {
    publish: "Actualité publiée. Elle est visible sur le site.",
    unpublish: "Actualité retirée du site. Elle est conservée en brouillon.",
    draft: "Brouillon enregistré.",
    save: status === "published" ? "Modifications enregistrées et mises en ligne." : "Modifications enregistrées.",
  };
  if (!d.id) redirect(`/admin/actualites/${id}?ok=${d.intent}`);
  return { ok: true, message: messages[d.intent], savedAt: Date.now() };
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const { data } = await supabase.from("articles").select("cover_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) redirect(`/admin/actualites/${id}?erreur=suppression`);
  if (data?.cover_path?.startsWith("articles/")) await supabase.storage.from("media").remove([data.cover_path]);
  refreshPublic("articles");
  redirect("/admin/actualites?ok=supprime");
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"], base: string, ownId: string | null) {
  const root = base || "actualite";
  const { data } = await supabase.from("articles").select("id, slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== ownId).map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let i = 2; ; i++) if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
}
