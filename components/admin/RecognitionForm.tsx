"use client";

import { useActionState, useRef, useState } from "react";
import { saveRecognition, type RecognitionActionResult } from "@/app/admin/actions/recognitions";
import { recognitionKinds, type RecognitionKind } from "@/lib/recognitions";
import { ActionButton, Flash, useKeepValuesSubmit, useUnsavedChanges } from "./client";
import { useT } from "./i18n";
import { ImageField } from "./ImageField";
import { hintClass, inputClass, labelClass, panelClass } from "./ui";

export type RecognitionFormPhoto = { path: string; cutout?: string | null; year?: string };

export type RecognitionFormValues = {
  id: string | null;
  kind: string;
  name_fr: string;
  name_en: string;
  recipient: string;
  year: string;
  detail_fr: string;
  detail_en: string;
  published: boolean;
  photos: RecognitionFormPhoto[];
};

export function RecognitionForm({
  values,
  flash,
  kindLabels,
}: {
  values: RecognitionFormValues;
  flash?: string;
  kindLabels: Record<RecognitionKind, string>;
}) {
  const t = useT();
  const [state, action, pending] = useActionState<RecognitionActionResult, FormData>(saveRecognition, { ok: true, message: flash });
  const { onSubmit } = useKeepValuesSubmit(action);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok && state.savedAt) setDirty(false);
  }
  // Each photo keeps its own key, so removing one leaves the others' fields in place.
  const nextKey = useRef(values.photos.length);
  const [photos, setPhotos] = useState(values.photos.map((photo, key) => ({ key, photo })));
  const errors = state.fieldErrors ?? {};
  const err = (key: string) =>
    errors[key] ? <span className="mt-1.5 block text-[0.875rem] font-normal text-danger">{errors[key]}</span> : null;

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={values.id ?? ""} />

      <div className="min-w-0 space-y-8">
        <Flash key={state.savedAt ?? state.message} message={state.message} tone={state.ok ? "success" : "error"} />

        <section className={`${panelClass} space-y-5 p-6`}>
          <label className={labelClass}>
            {t("Type")}
            <select name="kind" defaultValue={values.kind} className={inputClass}>
              {recognitionKinds.map((k) => (
                <option key={k} value={k}>
                  {kindLabels[k]}
                </option>
              ))}
            </select>
            {err("kind")}
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              {t("Nom en français")}
              <input name="name_fr" defaultValue={values.name_fr} aria-invalid={errors.name_fr ? true : undefined} className={inputClass} />
              {err("name_fr")}
            </label>
            <label className={labelClass}>
              {t("Nom en anglais")}
              <input name="name_en" defaultValue={values.name_en} aria-invalid={errors.name_en ? true : undefined} className={inputClass} />
              {err("name_en")}
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              {t("Attribuée à")}
              <input name="recipient" list="recognition-recipients" defaultValue={values.recipient} className={inputClass} />
              <datalist id="recognition-recipients">
                <option value="The Abeng Law Firm" />
                <option value="Roland Abeng" />
              </datalist>
              <span className={hintClass}>{t("Le cabinet ou une personne. Laissez vide si aucun n'est nommé.")}</span>
            </label>
            <label className={labelClass}>
              {t("Année")}
              <input name="year" defaultValue={values.year} className={inputClass} />
              <span className={hintClass}>{t("Par exemple 2026 ou 2021/22.")}</span>
            </label>
          </div>
          <label className={labelClass}>
            {t("Description en français")}
            <textarea name="detail_fr" defaultValue={values.detail_fr} rows={3} className={inputClass} />
          </label>
          <label className={labelClass}>
            {t("Description en anglais")}
            <textarea name="detail_en" defaultValue={values.detail_en} rows={3} className={inputClass} />
          </label>
        </section>

        <section className={`${panelClass} space-y-6 p-6`}>
          <div>
            <h2 className="font-display text-[1.125rem] font-semibold">{t("Images")}</h2>
            <p className={hintClass}>{t("Une image par trophée ou certificat. Sans image, le nom s'affiche seul sur les pages et rien n'apparaît sous la photo de l'équipe.")}</p>
          </div>
          {photos.map(({ key, photo }, i) => (
            <div key={key} className="space-y-4 rounded-xl border border-rule p-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <ImageField
                  name="photo_path"
                  label={t("Image {n}", { n: i + 1 })}
                  folder="recognitions"
                  fit="contain"
                  initialPath={photo.path || null}
                  onChange={() => setDirty(true)}
                />
                <ImageField
                  name="photo_cutout"
                  label={t("Version détourée (facultatif)")}
                  folder="recognitions"
                  fit="contain"
                  transparent
                  initialPath={photo.cutout ?? null}
                  hint={t("Le même trophée sans son arrière-plan, en PNG ou WebP. Affichée sous la photo de l'équipe en page d'accueil.")}
                  onChange={() => setDirty(true)}
                />
              </div>
              <div className="flex flex-wrap items-end gap-4">
                <label className={`${labelClass} min-w-40 flex-1`}>
                  {t("Année de cette image")}
                  <input name="photo_year" defaultValue={photo.year ?? ""} className={inputClass} />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPhotos((list) => list.filter((p) => p.key !== key));
                    setDirty(true);
                  }}
                  className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem] text-danger"
                >
                  {t("Retirer cette image")}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPhotos((list) => [...list, { key: nextKey.current++, photo: { path: "" } }])}
            className="btn btn-quiet"
          >
            {t("Ajouter une image")}
          </button>
        </section>
      </div>

      <aside className="space-y-6">
        <div className={`${panelClass} space-y-4 p-5`}>
          <label className="flex items-start gap-2.5 text-[0.9375rem]">
            <input type="checkbox" name="published" defaultChecked={values.published} className="mt-1 h-4 w-4 accent-gold" />
            <span>
              {t("Visible sur le site")}
              <span className={hintClass}>{t("Décochez pour la retirer du site sans la supprimer.")}</span>
            </span>
          </label>
          <ActionButton pending={pending} busy={pending} pendingLabel={t("Enregistrement…")} className="btn btn-gold w-full">
            {values.id ? t("Enregistrer la distinction") : t("Créer la distinction")}
          </ActionButton>
          {dirty && <p className="text-[0.8125rem] text-warning">{t("Modifications non enregistrées.")}</p>}
        </div>
      </aside>
    </form>
  );
}
