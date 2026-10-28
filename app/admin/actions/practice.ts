"use server";

import { localized } from "@/lib/admin-i18n/server";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff, type ActionResult } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { refreshPublic } from "@/lib/revalidate";

const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 40),
  );
const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v ?? "");

const schema = z.object({
  id: z.string().optional().transform((v) => (v ? v : null)),
  title_fr: z.string().trim().min(2, "Indiquez le titre en français.").max(160),
  title_en: z.string().trim().min(2, "Indiquez le titre en anglais.").max(160),
  slug: z.string().trim().max(100).optional(),
  slug_fr: z.string().trim().max(100).optional(),
  published: z.string().optional().transform((v) => v === "on"),
  summary_fr: text(600),
  summary_en: text(600),
  body_fr: text(20000),
  body_en: text(20000),
  scope_fr: lines,
  scope_en: lines,
});

export type PracticeActionResult = ActionResult & { savedAt?: number };

export async function savePracticeArea(prev: PracticeActionResult, formData: FormData): Promise<PracticeActionResult> {
  return localized(await savePracticeAreaCore(prev, formData));
}

async function savePracticeAreaCore(_: PracticeActionResult, formData: FormData): Promise<PracticeActionResult> {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, message: "L'expertise n'a pas été enregistrée. Corrigez les champs signalés.", fieldErrors };
  }
  const { id, slug: rawSlug, slug_fr: rawSlugFr, ...d } = parsed.data;

  const existing = id ? (await supabase.from("practice_areas").select("slug, slug_fr").eq("id", id).maybeSingle()).data : null;
  if (id && !existing) return { ok: false, message: "Cette expertise n'existe plus." };

  const slug = slugify(rawSlug || "") || existing?.slug || slugify(d.title_en);
  const slug_fr = slugify(rawSlugFr || "") || existing?.slug_fr || slugify(d.title_fr);

  let areaId = id;
  if (areaId) {
    const { error } = await supabase.from("practice_areas").update({ ...d, slug, slug_fr }).eq("id", areaId);
    if (error) return { ok: false, message: saveError(error) };
  } else {
    // New areas go to the end of the list.
    const { data: last } = await supabase.from("practice_areas").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase
      .from("practice_areas")
      .insert({ ...d, slug, slug_fr, sort_order: (last?.sort_order ?? 0) + 10 })
      .select("id")
      .single();
    if (error) return { ok: false, message: saveError(error) };
    areaId = data.id;
  }

  refreshPublic("practice");
  if (!id) redirect(`/admin/expertises/${areaId}?ok=cree`);
  return {
    ok: true,
    message: d.published ? "Expertise enregistrée. Les modifications sont visibles sur le site." : "Expertise enregistrée (non visible sur le site).",
    savedAt: Date.now(),
  };
}

function saveError(error: { code?: string; message: string }) {
  return error.code === "23505" ? "Une autre expertise utilise déjà cette adresse de page." : `Enregistrement impossible : ${error.message}`;
}

/** Swaps an area with its neighbour in the list. */
export async function movePracticeArea(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  const { data: all } = await supabase.from("practice_areas").select("id, sort_order").order("sort_order").order("title_fr");
  const list = all ?? [];
  const index = list.findIndex((a) => a.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  // Re-number the whole list so equal values never stall the move.
  await Promise.all(list.map((a, i) => supabase.from("practice_areas").update({ sort_order: (i + 1) * 10 }).eq("id", a.id)));
  refreshPublic("practice");
  refresh();
}

export async function setPracticeAreaPublished(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const published = formData.get("published") === "true";
  await supabase.from("practice_areas").update({ published }).eq("id", id);
  refreshPublic("practice");
  refresh();
}

export async function deletePracticeArea(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const { error } = await supabase.from("practice_areas").delete().eq("id", id);
  if (error) redirect(`/admin/expertises/${id}?erreur=suppression`);
  refreshPublic("practice");
  redirect("/admin/expertises?ok=supprime");
}
