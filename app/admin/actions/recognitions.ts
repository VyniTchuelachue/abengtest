"use server";

import { localized } from "@/lib/admin-i18n/server";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff, type ActionResult } from "@/lib/auth";
import { mediaPathPattern } from "@/lib/format";
import { refreshPublic } from "@/lib/revalidate";
import { recognitionKinds } from "@/lib/recognitions";

const text = (max: number) => z.string().trim().max(max).optional().transform((v) => v ?? "");

const schema = z.object({
  id: z.string().optional().transform((v) => (v ? v : null)),
  kind: z.enum(recognitionKinds as [string, ...string[]], { message: "Choisissez un type." }),
  name_fr: z.string().trim().min(2, "Indiquez le nom en français.").max(200),
  name_en: z.string().trim().min(2, "Indiquez le nom en anglais.").max(200),
  recipient: text(120),
  year: text(40),
  detail_fr: text(1000),
  detail_en: text(1000),
  published: z.string().optional().transform((v) => v === "on"),
});

/** The form sends one set of three fields per photo, in order; rows without an image are dropped. */
function readPhotos(formData: FormData) {
  const paths = formData.getAll("photo_path").map(String);
  const cutouts = formData.getAll("photo_cutout").map(String);
  const years = formData.getAll("photo_year").map(String);
  const photos = paths
    .map((path, i) => ({ path: path.trim(), cutout: (cutouts[i] ?? "").trim() || null, year: (years[i] ?? "").trim().slice(0, 40) }))
    .filter((p) => p.path);
  const valid = photos.every((p) => mediaPathPattern.test(p.path) && (!p.cutout || mediaPathPattern.test(p.cutout)));
  return valid ? photos.slice(0, 20) : null;
}

export type RecognitionActionResult = ActionResult & { savedAt?: number };

export async function saveRecognition(prev: RecognitionActionResult, formData: FormData): Promise<RecognitionActionResult> {
  return localized(await saveRecognitionCore(prev, formData));
}

async function saveRecognitionCore(_: RecognitionActionResult, formData: FormData): Promise<RecognitionActionResult> {
  const { supabase } = await requireStaff();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, message: "La distinction n'a pas été enregistrée. Corrigez les champs signalés.", fieldErrors };
  }
  const photos = readPhotos(formData);
  if (!photos) return { ok: false, message: "Une image n'est pas valide. Envoyez-la de nouveau." };
  const { id, ...d } = parsed.data;

  let itemId = id;
  if (itemId) {
    const { data, error } = await supabase.from("recognitions").update({ ...d, photos }).eq("id", itemId).select("id");
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
    if (!data?.length) return { ok: false, message: "Cette distinction n'existe plus." };
  } else {
    // New items go to the end of the list.
    const { data: last } = await supabase.from("recognitions").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase
      .from("recognitions")
      .insert({ ...d, photos, sort_order: (last?.sort_order ?? 0) + 10 })
      .select("id")
      .single();
    if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
    itemId = data.id;
  }

  refreshPublic("recognitions");
  if (!id) redirect(`/admin/distinctions/${itemId}?ok=cree`);
  return {
    ok: true,
    message: d.published ? "Distinction enregistrée. Les modifications sont visibles sur le site." : "Distinction enregistrée (non visible sur le site).",
    savedAt: Date.now(),
  };
}

/** Swaps an item with its neighbour in the list. */
export async function moveRecognition(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  const { data: all } = await supabase.from("recognitions").select("id, sort_order").order("sort_order").order("name_fr");
  const list = all ?? [];
  const index = list.findIndex((r) => r.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  // Re-number the whole list so equal values never stall the move.
  await Promise.all(list.map((r, i) => supabase.from("recognitions").update({ sort_order: (i + 1) * 10 }).eq("id", r.id)));
  refreshPublic("recognitions");
  refresh();
}

export async function setRecognitionPublished(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().parse(formData.get("id"));
  const published = formData.get("published") === "true";
  await supabase.from("recognitions").update({ published }).eq("id", id);
  refreshPublic("recognitions");
  refresh();
}

export async function deleteRecognition(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const { error } = await supabase.from("recognitions").delete().eq("id", id);
  if (error) redirect(`/admin/distinctions/${id}?erreur=suppression`);
  refreshPublic("recognitions");
  redirect("/admin/distinctions?ok=supprime");
}
