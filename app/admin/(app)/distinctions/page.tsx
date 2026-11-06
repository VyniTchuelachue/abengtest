import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/admin/client";
import { Badge, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import type { RecognitionKind } from "@/lib/recognitions";
import { moveRecognition, setRecognitionPublished } from "../../actions/recognitions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Distinctions") };
}

export default async function RecognitionsAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { ok } = await searchParams;
  const { data } = await supabase.from("recognitions").select("id, kind, name_fr, name_en, recipient, year, published, photos").order("sort_order").order("name_fr");
  const items = data ?? [];
  const t = await getT();
  const locale = await getAdminLocale();
  const kinds = getDictionary(locale).firmPage.recognitionKinds;

  return (
    <>
      <PageHeader
        title={t("Distinctions")}
        description={t("Ajoutez, modifiez ou retirez les classements, prix, réseaux et contributions affichés sur le site.")}
        actions={
          <Link href="/admin/distinctions/nouveau" className="btn btn-gold">
            {t("Ajouter une distinction")}
          </Link>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Distinction supprimée.")}</Notice>}

      <p className="mb-3 text-[0.9375rem] text-ink-soft">{t("Les images de cette liste défilent, dans cet ordre, sous la photo de l'équipe en page d'accueil.")}</p>
      <ol className={`${panelClass} divide-y divide-rule`}>
        {items.map((r, i) => {
          const name = (locale === "en" ? r.name_en : r.name_fr) || r.name_fr;
          const label = [name, r.recipient, r.year].filter(Boolean).join(" · ");
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/distinctions/${r.id}`} className="font-medium hover:underline">
                  {label}
                </Link>
                <p className="text-[0.875rem] text-slate">
                  {kinds[r.kind as RecognitionKind]}
                  {Array.isArray(r.photos) && !r.photos.length && ` · ${t("Sans image")}`}
                </p>
              </div>
              <Badge tone={r.published ? "green" : "amber"}>{r.published ? t("Publié") : t("Masqué")}</Badge>
              <form action={setRecognitionPublished} className="flex items-center">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="published" value={r.published ? "false" : "true"} />
                <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-8 px-3 py-1 text-[0.8125rem]">
                  {r.published ? t("Masquer") : t("Publier")}
                </SubmitButton>
              </form>
              <div className="flex items-center gap-1" aria-label={t("Ordre de {name}", { name })} role="group">
                <form action={moveRecognition}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label={t("Monter {name}", { name })}
                    className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveRecognition}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === items.length - 1}
                    aria-label={t("Descendre {name}", { name })}
                    className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>
              <Link href={`/admin/distinctions/${r.id}`} className="link text-[0.9375rem]">
                {t("Modifier")}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
