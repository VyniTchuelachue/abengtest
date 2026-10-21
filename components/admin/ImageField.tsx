"use client";

import { useId, useRef, useState } from "react";
import { acceptedImageTypes, publicMediaUrl, uploadImage } from "@/lib/upload";
import { Spinner } from "./client";
import { hintClass } from "./ui";

type Props = {
  name: string;
  label: string;
  folder: "team" | "articles";
  initialPath: string | null;
  hint?: string;
  aspect?: "portrait" | "landscape";
  objectPosition?: string;
  onChange?: (path: string) => void;
};

/** Upload with preview. The storage path travels with the form in a hidden input. */
export function ImageField({ name, label, folder, initialPath, hint, aspect = "landscape", objectPosition, onChange }: Props) {
  const [path, setPath] = useState(initialPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadImage(file, folder, folder === "team" ? 1800 : 2400);
      setPath(uploaded);
      onChange?.(uploaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function clear() {
    setPath("");
    onChange?.("");
  }

  return (
    <div>
      <p id={`${id}-label`} className="text-[0.9375rem] font-medium">
        {label}
      </p>
      <input type="hidden" name={name} value={path} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files[0]);
        }}
        className={`relative mt-1.5 overflow-hidden rounded-sm border border-dashed ${dragging ? "border-ink bg-white" : "border-rule bg-stone/50"} ${
          aspect === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]"
        }`}
      >
        {path ? (
          // eslint-disable-next-line @next/next/no-img-element -- dashboard preview of a freshly uploaded file
          <img src={publicMediaUrl(path)} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-[0.875rem] text-slate">
            <span>Glissez une image ici</span>
            <span>ou</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-[0.9375rem]" role="status">
            <Spinner /> Envoi de l&apos;image…
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="btn btn-quiet min-h-9 cursor-pointer px-3 py-1.5 text-[0.875rem]">
          {path ? "Remplacer l'image" : "Choisir une image"}
          <input
            ref={input}
            type="file"
            accept={acceptedImageTypes}
            className="sr-only"
            aria-labelledby={`${id}-label`}
            onChange={(e) => void handle(e.target.files?.[0])}
          />
        </label>
        {path && (
          <button type="button" onClick={clear} className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem] text-danger">
            Retirer
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.875rem] text-danger">
          {error}
        </p>
      )}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
