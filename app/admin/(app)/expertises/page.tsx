import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/admin/client";
import { Badge, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { movePracticeArea, setPracticeAreaPublished } from "../../actions/practice";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Expertises") };
}

export default async function PracticeAreasAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { ok } = await searchParams;
  const { data } = await supabase.from("practice_areas").select("id, title_fr, title_en, summary_fr, published, sort_order").order("sort_order").order("title_fr");
  const areas = data ?? [];
  const t = await getT();
  const locale = await getAdminLocale();

  return (
    <>
      <PageHeader
        title={t("Expertises")}
        description={t("Ajoutez des expertises, modifiez leurs textes et choisissez l'ordre d'affichage sur le site.")}
        actions={
          <Link href="/admin/expertises/nouveau" className="btn btn-gold">
            {t("Ajouter une expertise")}
          </Link>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Expertise supprimée.")}</Notice>}

      <p className="mb-3 text-[0.9375rem] text-ink-soft">{t("Les expertises apparaissent sur la page Expertises dans cet ordre.")}</p>
      <ol className={`${panelClass} divide-y divide-rule`}>
        {areas.map((a, i) => {
          const title = (locale === "en" ? a.title_en : a.title_fr) || a.title_fr;
          return (
            <li key={a.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/expertises/${a.id}`} className="font-medium hover:underline">
                  {title}
                </Link>
                {!a.summary_fr && <p className="text-[0.875rem] text-slate">{t("Texte à compléter")}</p>}
              </div>
              <Badge tone={a.published ? "green" : "amber"}>{a.published ? t("Publié") : t("Masqué")}</Badge>
              <form action={setPracticeAreaPublished} className="flex items-center">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="published" value={a.published ? "false" : "true"} />
                <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-8 px-3 py-1 text-[0.8125rem]">
                  {a.published ? t("Masquer") : t("Publier")}
                </SubmitButton>
              </form>
              <div className="flex items-center gap-1" aria-label={t("Ordre de {name}", { name: title })} role="group">
                <form action={movePracticeArea}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    disabled={i === 0}
                    aria-label={t("Monter {name}", { name: title })}
                    className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form action={movePracticeArea}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={i === areas.length - 1}
                    aria-label={t("Descendre {name}", { name: title })}
                    className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
              </div>
              <Link href={`/admin/expertises/${a.id}`} className="link text-[0.9375rem]">
                {t("Modifier")}
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
