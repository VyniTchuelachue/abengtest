"use client";

import { browserClient } from "./supabase/browser";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 15 * 1024 * 1024;

export const acceptedImageTypes = ACCEPTED.join(",");

/** Dashboard text for an upload failure, in the dashboard language. */
export function uploadErrorText(t: (text: string, vars?: Record<string, string>) => string, e: unknown): string {
  const message = e instanceof Error ? e.message : "Envoi impossible.";
  const prefix = "Envoi impossible : ";
  return message.startsWith(prefix) ? t("Envoi impossible : {detail}", { detail: message.slice(prefix.length) }) : t(message);
}

/**
 * Downscales a photo in the browser (keeps uploads light on slow connections),
 * then stores it in the public "media" bucket. Returns the storage path.
 */
export async function uploadImage(file: File, folder: "team" | "articles" | "articles/inline", maxEdge = 2400): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Format non pris en charge. Utilisez une image JPG, PNG ou WebP.");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (15 Mo maximum).");

  const blob = await downscale(file, maxEdge);
  const path = `${folder}/${crypto.randomUUID()}.jpg`;
  const { error } = await browserClient().storage.from("media").upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Envoi impossible : ${error.message}`);
  return path;
}

async function downscale(file: File, maxEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Votre navigateur ne permet pas de préparer l'image.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion de l'image impossible."))), "image/jpeg", 0.88),
  );
}

export function publicMediaUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
