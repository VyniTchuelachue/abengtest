"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveArticle, type ArticleActionResult } from "@/app/admin/actions/articles";
import { slugify } from "@/lib/format";
import { ActionButton, Flash, useKeepValuesSubmit, useUnsavedChanges } from "./client";
import { ImageField } from "./ImageField";
import { RichTextEditor } from "./RichTextEditor";
import { Badge, articleStatus, hintClass, inputClass, labelClass, panelClass } from "./ui";

export type ArticleFormValues = {
  id: string | null;
  slug: string;
  status: "draft" | "published";
  published_at: string | null;
  category_id: string | null;
  author_id: string | null;
  cover_path: string | null;
  cover_alt_fr: string | null;
  cover_alt_en: string | null;
  title_fr: string | null;
  title_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  body_fr: string | null;
  body_en: string | null;
};

type Option = { id: string; label: string };
type Lang = "fr" | "en";

const langNames: Record<Lang, string> = { fr: "Français", en: "English" };

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ArticleForm({
  values,
  categories,
  authors,
  flash,
}: {
  values: ArticleFormValues;
  categories: Option[];
  authors: Option[];
  flash?: string;
}) {
  const [state, action, pending] = useActionState<ArticleActionResult, FormData>(saveArticle, { ok: true, message: flash });
  const { onSubmit, intent } = useKeepValuesSubmit(action);
  const busy = (v: string) => pending && intent === v;
  const [lang, setLang] = useState<Lang>("fr");
  const [dirty, setDirty] = useState(false);
  const [titles, setTitles] = useState({ fr: values.title_fr ?? "", en: values.title_en ?? "" });
  const [slug, setSlug] = useState(values.slug);
  const [dateLocal, setDateLocal] = useState(toLocalInput(values.published_at));
  useUnsavedChanges(dirty);

  const errors = state.fieldErrors ?? {};
  // React to each new save result: clear the dirty flag, or show the tab holding the first error.
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok && state.savedAt) setDirty(false);
    if (errors.body_en && !errors.body_fr && !errors.title_fr) setLang("en");
  }

  const isPublished = values.status === "published";
  const scheduled = isPublished && values.published_at && new Date(values.published_at) > new Date();
  const statusKey = scheduled ? "scheduled" : values.status;
  const suggestedSlug = slugify(titles.fr || titles.en);
  const markDirty = () => setDirty(true);

  return (
    <form onSubmit={onSubmit} onChange={markDirty} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={values.id ?? ""} />
      <input type="hidden" name="published_at" value={dateLocal ? new Date(dateLocal).toISOString() : ""} />

      <div className="min-w-0">
        <Flash key={state.savedAt ?? state.message} message={state.message} tone={state.ok ? "success" : "error"} />

        <div role="tablist" aria-label="Langue de la version" className="flex gap-1 border-b border-rule">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              id={`tab-${l}`}
              aria-selected={lang === l}
              aria-controls={`panel-${l}`}
              onClick={() => setLang(l)}
              className="-mb-px flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-[0.9375rem] text-ink-soft aria-selected:border-gold aria-selected:text-ink"
            >
              {langNames[l]}
              <span
                aria-label={titles[l] ? "version renseignée" : "version vide"}
                className={`h-2 w-2 rounded-full ${titles[l] ? "bg-success" : "bg-rule"}`}
              />
            </button>
          ))}
        </div>
        <p className={`${hintClass} mb-6`}>
          Rédigez au moins une version. Une actualité sans traduction est affichée dans sa langue d&apos;origine, avec une mention.
        </p>

        {(["fr", "en"] as const).map((l) => (
          <div key={l} id={`panel-${l}`} role="tabpanel" aria-labelledby={`tab-${l}`} hidden={lang !== l} className="space-y-6">
            <label className={labelClass}>
              Titre ({langNames[l]})
              <input
                name={`title_${l}`}
                defaultValue={values[`title_${l}`] ?? ""}
                maxLength={200}
                onChange={(e) => setTitles((t) => ({ ...t, [l]: e.target.value }))}
                aria-invalid={errors[`title_${l}`] ? true : undefined}
                className={`${inputClass} font-serif text-[1.375rem]`}
              />
              {errors[`title_${l}`] && <span className="mt-1.5 block text-[0.875rem] font-normal text-danger">{errors[`title_${l}`]}</span>}
            </label>
            <label className={labelClass}>
              Chapô (résumé affiché dans les listes)
              <textarea name={`excerpt_${l}`} defaultValue={values[`excerpt_${l}`] ?? ""} maxLength={600} rows={3} className={inputClass} />
              <span className={hintClass}>Deux ou trois phrases. Elles servent aussi de description pour les moteurs de recherche.</span>
            </label>
            <div>
              <p id={`body-label-${l}`} className="text-[0.9375rem] font-medium">
                Texte ({langNames[l]})
              </p>
              <RichTextEditor
                name={`body_${l}`}
                initialHtml={values[`body_${l}`] ?? ""}
                label={`Texte de l'actualité, version ${langNames[l]}`}
                placeholder="Rédigez le contenu de l'actualité…"
                invalid={Boolean(errors[`body_${l}`])}
                describedBy={errors[`body_${l}`] ? `body-err-${l}` : undefined}
                onDirty={markDirty}
              />
              {errors[`body_${l}`] && (
                <p id={`body-err-${l}`} className="mt-1.5 text-[0.875rem] text-danger">
                  {errors[`body_${l}`]}
                </p>
              )}
            </div>
            <label className={labelClass}>
              Description de l&apos;image de couverture ({langNames[l]})
              <input name={`cover_alt_${l}`} defaultValue={values[`cover_alt_${l}`] ?? ""} maxLength={240} className={inputClass} />
              <span className={hintClass}>Décrit l&apos;image pour les personnes malvoyantes et sert de légende.</span>
            </label>
          </div>
        ))}
      </div>

      <aside className="space-y-6">
        <div className={`${panelClass} p-5`}>
          <div className="flex items-center justify-between">
            <p className="text-[0.9375rem] font-medium">Publication</p>
            {values.id && <Badge tone={articleStatus[statusKey].tone}>{articleStatus[statusKey].label}</Badge>}
          </div>
          <label className={`${labelClass} mt-4`}>
            Date de publication
            <input type="datetime-local" value={dateLocal} onChange={(e) => setDateLocal(e.target.value)} className={inputClass} />
            <span className={hintClass}>Laissez vide pour publier immédiatement. Une date future programme la parution.</span>
          </label>
          <div className="mt-5 flex flex-col gap-2">
            {isPublished ? (
              <>
                <ActionButton name="intent" value="save" pending={pending} busy={busy("save")} pendingLabel="Enregistrement…">
                  Enregistrer les modifications
                </ActionButton>
                <ActionButton name="intent" value="unpublish" pending={pending} busy={busy("unpublish")} pendingLabel="Retrait…" className="btn btn-quiet">
                  Dépublier
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton name="intent" value="publish" pending={pending} busy={busy("publish")} pendingLabel="Publication…">
                  Publier
                </ActionButton>
                <ActionButton name="intent" value="draft" pending={pending} busy={busy("draft")} pendingLabel="Enregistrement…" className="btn btn-quiet">
                  Enregistrer le brouillon
                </ActionButton>
              </>
            )}
            {values.id ? (
              <Link href={`/admin/actualites/${values.id}/apercu`} target="_blank" className="btn btn-quiet">
                Aperçu
              </Link>
            ) : (
              <p className={hintClass}>L&apos;aperçu est disponible après le premier enregistrement.</p>
            )}
          </div>
          {dirty && <p className="mt-3 text-[0.8125rem] text-warning">Modifications non enregistrées.</p>}
        </div>

        <div className={`${panelClass} space-y-5 p-5`}>
          <label className={labelClass}>
            Catégorie
            <select name="category_id" defaultValue={values.category_id ?? ""} className={inputClass}>
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Auteur
            <select name="author_id" defaultValue={values.author_id ?? ""} className={inputClass}>
              <option value="">Le cabinet</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Adresse de la page
            <input
              name="slug"
              value={slug}
              placeholder={suggestedSlug || "titre-de-l-actualite"}
              onChange={(e) => setSlug(e.target.value)}
              className={`${inputClass} font-mono text-[0.8125rem]`}
            />
            <span className={hintClass}>
              /fr/actualites/<strong className="font-medium text-ink-soft">{slugify(slug) || suggestedSlug || "…"}</strong>. Générée depuis le titre si
              laissée vide.
            </span>
          </label>
        </div>

        <div className={`${panelClass} p-5`}>
          <ImageField
            name="cover_path"
            label="Image de couverture"
            folder="articles"
            initialPath={values.cover_path}
            hint="Format paysage conseillé (au moins 1600 px de large)."
            onChange={markDirty}
          />
        </div>
      </aside>
    </form>
  );
}
