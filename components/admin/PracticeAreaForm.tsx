"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { savePracticeArea, type PracticeActionResult } from "@/app/admin/actions/practice";
import { slugify } from "@/lib/format";
import { href } from "@/lib/routes";
import { ActionButton, Flash, useKeepValuesSubmit, useUnsavedChanges } from "./client";
import { useT } from "./i18n";
import { hintClass, inputClass, labelClass, panelClass } from "./ui";

export type PracticeAreaFormValues = {
  id: string | null;
  slug: string;
  slug_fr: string;
  published: boolean;
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  body_fr: string;
  body_en: string;
  scope_fr: string[];
  scope_en: string[];
};

type Lang = "fr" | "en";
const langNames: Record<Lang, string> = { fr: "Français", en: "English" };
/** Each language has its own page address. */
const slugField: Record<Lang, "slug_fr" | "slug"> = { fr: "slug_fr", en: "slug" };

export function PracticeAreaForm({ values, flash }: { values: PracticeAreaFormValues; flash?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState<PracticeActionResult, FormData>(savePracticeArea, { ok: true, message: flash });
  const { onSubmit } = useKeepValuesSubmit(action);
  const [lang, setLang] = useState<Lang>("fr");
  const [dirty, setDirty] = useState(false);
  const [titles, setTitles] = useState<Record<Lang, string>>({ fr: values.title_fr, en: values.title_en });
  useUnsavedChanges(dirty);
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok && state.savedAt) setDirty(false);
  }
  const errors = state.fieldErrors ?? {};
  const err = (key: string) =>
    errors[key] ? <span className="mt-1.5 block text-[0.875rem] font-normal text-danger">{errors[key]}</span> : null;

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={values.id ?? ""} />

      <div className="min-w-0 space-y-8">
        <Flash key={state.savedAt ?? state.message} message={state.message} tone={state.ok ? "success" : "error"} />

        <section className={panelClass}>
          <div role="tablist" aria-label={t("Langue")} className="flex gap-1 border-b border-rule px-4">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`ptab-${l}`}
                aria-selected={lang === l}
                aria-controls={`ppanel-${l}`}
                onClick={() => setLang(l)}
                className="-mb-px border-b-2 border-transparent px-4 py-3 text-[0.9375rem] text-ink-soft aria-selected:border-gold aria-selected:text-ink"
              >
                {langNames[l]}
                {(errors[`title_${l}`] || errors[`summary_${l}`]) && <span className="ml-1.5 text-danger">•</span>}
              </button>
            ))}
          </div>
          {(["fr", "en"] as const).map((l) => (
            <div key={l} id={`ppanel-${l}`} role="tabpanel" aria-labelledby={`ptab-${l}`} hidden={lang !== l} className="space-y-5 p-6">
              <label className={labelClass}>
                {t("Titre ({lang})", { lang: langNames[l] })}
                <input
                  name={`title_${l}`}
                  defaultValue={values[`title_${l}`]}
                  onChange={(e) => setTitles((v) => ({ ...v, [l]: e.target.value }))}
                  aria-invalid={errors[`title_${l}`] ? true : undefined}
                  className={inputClass}
                />
                {err(`title_${l}`)}
              </label>
              <label className={labelClass}>
                {t("Adresse de la page ({lang})", { lang: langNames[l] })}
                <input
                  name={slugField[l]}
                  defaultValue={values[slugField[l]]}
                  placeholder={slugify(titles[l])}
                  className={`${inputClass} font-mono text-[0.8125rem]`}
                />
                <span className={hintClass}>{t("Générée depuis le titre si laissée vide.")}</span>
              </label>
              <label className={labelClass}>
                {t("Présentation courte ({lang})", { lang: langNames[l] })}
                <textarea name={`summary_${l}`} defaultValue={values[`summary_${l}`]} rows={3} aria-invalid={errors[`summary_${l}`] ? true : undefined} className={inputClass} />
                <span className={hintClass}>{t("Affichée sur la liste des expertises et en haut de la page.")}</span>
                {err(`summary_${l}`)}
              </label>
              <label className={labelClass}>
                {t("Description ({lang})", { lang: langNames[l] })}
                <textarea name={`body_${l}`} defaultValue={values[`body_${l}`]} rows={12} className={`${inputClass} text-[1rem] leading-relaxed`} />
                <span className={hintClass}>{t("Laissez une ligne vide entre deux paragraphes.")}</span>
              </label>
              <label className={labelClass}>
                {t("Domaines d'intervention ({lang})", { lang: langNames[l] })}
                <textarea name={`scope_${l}`} defaultValue={values[`scope_${l}`].join("\n")} rows={8} className={inputClass} />
                <span className={hintClass}>{t("Un élément par ligne. Affichés sous la description.")}</span>
              </label>
            </div>
          ))}
        </section>
      </div>

      <aside className="space-y-6">
        <div className={`${panelClass} space-y-4 p-5`}>
          <label className="flex items-start gap-2.5 text-[0.9375rem]">
            <input type="checkbox" name="published" defaultChecked={values.published} className="mt-1 h-4 w-4 accent-gold" />
            <span>
              {t("Visible sur le site")}
              <span className={hintClass}>{t("Décochez pour préparer la page sans la publier.")}</span>
            </span>
          </label>
          <ActionButton pending={pending} busy={pending} pendingLabel={t("Enregistrement…")} className="btn btn-gold w-full">
            {values.id ? t("Enregistrer l'expertise") : t("Créer l'expertise")}
          </ActionButton>
          {values.id && values.published && (
            <div className="grid gap-2">
              <Link href={href("fr", "practice", values.slug_fr)} target="_blank" className="btn btn-quiet w-full">
                {t("Voir la page en français")}
              </Link>
              <Link href={href("en", "practice", values.slug)} target="_blank" className="btn btn-quiet w-full">
                {t("Voir la page en anglais")}
              </Link>
            </div>
          )}
          {dirty && <p className="text-[0.8125rem] text-warning">{t("Modifications non enregistrées.")}</p>}
        </div>
      </aside>
    </form>
  );
}
