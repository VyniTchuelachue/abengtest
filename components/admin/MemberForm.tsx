"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveMember, type MemberActionResult } from "@/app/admin/actions/team";
import { slugify } from "@/lib/format";
import { href } from "@/lib/routes";
import { ActionButton, Flash, useKeepValuesSubmit, useUnsavedChanges } from "./client";
import { useAdminLocale, useT } from "./i18n";
import { ImageField } from "./ImageField";
import { groupLabels, hintClass, inputClass, labelClass, memberStatus, panelClass } from "./ui";

export type MemberFormValues = {
  id: string | null;
  slug: string;
  full_name: string;
  group_key: "partner" | "senior_associate" | "lawyer" | "paralegal" | "administration";
  status: "published" | "hidden" | "inactive";
  featured: boolean;
  email: string | null;
  linkedin_url: string | null;
  photo_path: string | null;
  photo_position: string;
  title_fr: string;
  title_en: string;
  bio_fr: string;
  bio_en: string;
  focus_areas_fr: string[];
  focus_areas_en: string[];
  qualifications_fr: string[];
  qualifications_en: string[];
  bar_admission_fr: string | null;
  bar_admission_en: string | null;
  languages_fr: string[];
  languages_en: string[];
};

type Lang = "fr" | "en";
const langNames: Record<Lang, string> = { fr: "Français", en: "English" };
const positions = [
  { value: "50% 15%", label: "Visage en haut du cadre" },
  { value: "50% 20%", label: "Standard" },
  { value: "50% 30%", label: "Un peu plus bas" },
  { value: "50% 50%", label: "Centrée" },
];

export function MemberForm({ values, flash }: { values: MemberFormValues; flash?: string }) {
  const t = useT();
  const locale = useAdminLocale();
  const [state, action, pending] = useActionState<MemberActionResult, FormData>(saveMember, { ok: true, message: flash });
  const { onSubmit } = useKeepValuesSubmit(action);
  const [lang, setLang] = useState<Lang>("fr");
  const [dirty, setDirty] = useState(false);
  const [name, setName] = useState(values.full_name);
  const [position, setPosition] = useState(values.photo_position);
  useUnsavedChanges(dirty);
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok && state.savedAt) setDirty(false);
  }
  const errors = state.fieldErrors ?? {};
  const err = (key: string) =>
    errors[key] ? <span className="mt-1.5 block text-[0.875rem] font-normal text-danger">{errors[key]}</span> : null;
  const joined = (arr: string[]) => arr.join("\n");

  return (
    <form onSubmit={onSubmit} onChange={() => setDirty(true)} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={values.id ?? ""} />

      <div className="min-w-0 space-y-8">
        <Flash key={state.savedAt ?? state.message} message={state.message} tone={state.ok ? "success" : "error"} />

        <section className={`${panelClass} space-y-5 p-6`}>
          <h2 className="font-sans text-[1rem] font-semibold">{t("Identité")}</h2>
          <label className={labelClass}>
            {t("Nom complet")}
            <input
              name="full_name"
              required
              defaultValue={values.full_name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={errors.full_name ? true : undefined}
              className={inputClass}
            />
            <span className={hintClass}>{t("Tel qu'il apparaît sur le site, par exemple « Jean-Aimé Kounga ».")}</span>
            {err("full_name")}
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              {t("Groupe")}
              <select name="group_key" defaultValue={values.group_key} className={inputClass}>
                {Object.entries(groupLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {t(label)}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              {t("Adresse de la page")}
              <input name="slug" defaultValue={values.slug} placeholder={slugify(name)} className={`${inputClass} font-mono text-[0.8125rem]`} />
              <span className={hintClass}>{t("Générée depuis le nom si laissée vide.")}</span>
            </label>
            <label className={labelClass}>
              {t("Email professionnel (facultatif)")}
              <input name="email" type="email" defaultValue={values.email ?? ""} aria-invalid={errors.email ? true : undefined} className={inputClass} />
              {err("email")}
            </label>
            <label className={labelClass}>
              {t("Profil LinkedIn (facultatif)")}
              <input name="linkedin_url" type="url" defaultValue={values.linkedin_url ?? ""} placeholder="https://www.linkedin.com/in/…" aria-invalid={errors.linkedin_url ? true : undefined} className={inputClass} />
              {err("linkedin_url")}
            </label>
          </div>
        </section>

        <section className={panelClass}>
          <div role="tablist" aria-label={t("Langue")} className="flex gap-1 border-b border-rule px-4">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`mtab-${l}`}
                aria-selected={lang === l}
                aria-controls={`mpanel-${l}`}
                onClick={() => setLang(l)}
                className="-mb-px border-b-2 border-transparent px-4 py-3 text-[0.9375rem] text-ink-soft aria-selected:border-gold aria-selected:text-ink"
              >
                {langNames[l]}
              </button>
            ))}
          </div>
          {(["fr", "en"] as const).map((l) => (
            <div key={l} id={`mpanel-${l}`} role="tabpanel" aria-labelledby={`mtab-${l}`} hidden={lang !== l} className="space-y-5 p-6">
              <label className={labelClass}>
                {t("Fonction ({lang})", { lang: langNames[l] })}
                <input
                  name={`title_${l}`}
                  defaultValue={values[`title_${l}`]}
                  placeholder={l === "fr" ? "Collaboratrice senior" : "Senior Associate"}
                  aria-invalid={errors[`title_${l}`] ? true : undefined}
                  className={inputClass}
                />
                {err(`title_${l}`)}
              </label>
              <label className={labelClass}>
                {t("Biographie ({lang})", { lang: langNames[l] })}
                <textarea name={`bio_${l}`} defaultValue={values[`bio_${l}`]} rows={12} className={`${inputClass} text-[1rem] leading-relaxed`} />
                <span className={hintClass}>{t("Laissez une ligne vide entre deux paragraphes.")}</span>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  {t("Domaines d'intervention")}
                  <textarea name={`focus_areas_${l}`} defaultValue={joined(values[`focus_areas_${l}`])} rows={7} className={inputClass} />
                  <span className={hintClass}>{t("Un domaine par ligne.")}</span>
                </label>
                <label className={labelClass}>
                  {t("Formation et diplômes")}
                  <textarea name={`qualifications_${l}`} defaultValue={joined(values[`qualifications_${l}`])} rows={7} className={inputClass} />
                  <span className={hintClass}>{t("Un diplôme par ligne.")}</span>
                </label>
                <label className={labelClass}>
                  {t("Barreau (facultatif)")}
                  <input name={`bar_admission_${l}`} defaultValue={values[`bar_admission_${l}`] ?? ""} className={inputClass} />
                </label>
                <label className={labelClass}>
                  {t("Langues")}
                  <textarea name={`languages_${l}`} defaultValue={joined(values[`languages_${l}`])} rows={3} className={inputClass} />
                  <span className={hintClass}>{t("Une langue par ligne.")}</span>
                </label>
              </div>
            </div>
          ))}
        </section>
      </div>

      <aside className="space-y-6">
        <div className={`${panelClass} space-y-4 p-5`}>
          <label className={labelClass}>
            {t("Visibilité")}
            <select name="status" defaultValue={values.status} className={inputClass}>
              {Object.entries(memberStatus).map(([value, s]) => (
                <option key={value} value={value}>
                  {t(s.label)}
                </option>
              ))}
            </select>
            <span className={hintClass}>{t("« Masqué » retire temporairement le profil du site. « Inactif » correspond à un ancien membre.")}</span>
          </label>
          <label className="flex items-start gap-2.5 text-[0.9375rem]">
            <input type="checkbox" name="featured" defaultChecked={values.featured} className="mt-1 h-4 w-4 accent-gold" />
            <span>
              {t("Afficher sur la page d'accueil")}
              <span className={hintClass}>{t("Pour les avocats présentés dans la section « Les avocats ».")}</span>
            </span>
          </label>
          <ActionButton pending={pending} busy={pending} pendingLabel={t("Enregistrement…")} className="btn btn-gold w-full">
            {values.id ? t("Enregistrer le profil") : t("Créer le profil")}
          </ActionButton>
          {values.id && values.status === "published" && (
            <Link href={href(locale, "team", values.slug)} target="_blank" className="btn btn-quiet w-full">
              {t("Voir sur le site")}
            </Link>
          )}
          {dirty && <p className="text-[0.8125rem] text-warning">{t("Modifications non enregistrées.")}</p>}
        </div>

        <div className={`${panelClass} space-y-4 p-5`}>
          <ImageField
            name="photo_path"
            label={t("Portrait")}
            folder="team"
            aspect="portrait"
            initialPath={values.photo_path}
            objectPosition={position}
            hint={t("Photo verticale, de préférence sur fond gris neutre comme les autres portraits.")}
            onChange={() => setDirty(true)}
          />
          <label className={labelClass}>
            {t("Cadrage")}
            <select name="photo_position" value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass}>
              {positions.map((p) => (
                <option key={p.value} value={p.value}>
                  {t(p.label)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>
    </form>
  );
}
