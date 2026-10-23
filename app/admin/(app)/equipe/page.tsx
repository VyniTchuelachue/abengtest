import type { Metadata } from "next";
import Link from "next/link";
import { SubmitButton } from "@/components/admin/client";
import { Badge, Notice, PageHeader, groupLabels, memberStatus, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { initials } from "@/lib/format";
import { mediaUrl } from "@/lib/supabase/public";
import { moveMember, setMemberStatus } from "../../actions/team";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Équipe") };
}

const order = ["partner", "senior_associate", "lawyer", "paralegal", "administration"] as const;

export default async function TeamAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { ok } = await searchParams;
  const { data } = await supabase
    .from("team_members")
    .select("id, slug, full_name, title_fr, title_en, group_key, status, featured, photo_path, photo_position, sort_order")
    .order("sort_order")
    .order("full_name");
  const members = data ?? [];
  const t = await getT();
  const locale = await getAdminLocale();

  return (
    <>
      <PageHeader
        title={t("Équipe")}
        description={t("Ajoutez des membres, modifiez leurs profils et choisissez l'ordre d'affichage sur le site.")}
        actions={
          <Link href="/admin/equipe/nouveau" className="btn btn-gold">
            {t("Ajouter un membre")}
          </Link>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Profil supprimé.")}</Notice>}

      <div className="space-y-10">
        {order.map((group) => {
          const list = members.filter((m) => m.group_key === group);
          return (
            <section key={group} aria-labelledby={`g-${group}`}>
              <h2 id={`g-${group}`} className="mb-3 flex items-baseline gap-3 font-sans text-[1rem] font-semibold">
                {t(groupLabels[group])}
                <span className="text-[0.875rem] font-normal text-slate">{list.length}</span>
              </h2>
              {list.length === 0 ? (
                <p className={`${panelClass} px-5 py-4 text-[0.9375rem] text-slate`}>{t("Aucun membre dans ce groupe.")}</p>
              ) : (
                <ol className={`${panelClass} divide-y divide-rule`}>
                  {list.map((m, i) => {
                    const photo = mediaUrl(m.photo_path);
                    return (
                      <li key={m.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
                        <div className="h-16 w-[3.2rem] shrink-0 overflow-hidden rounded-lg bg-stone-deep">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element -- small dashboard thumbnail
                            <img src={photo} alt="" className="h-full w-full object-cover" style={{ objectPosition: m.photo_position }} />
                          ) : (
                            <span className="flex h-full items-center justify-center font-display font-semibold text-ink-soft">{initials(m.full_name)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={`/admin/equipe/${m.id}`} className="font-medium hover:underline">
                            {m.full_name}
                          </Link>
                          <p className="truncate text-[0.875rem] text-slate">{(locale === "en" ? m.title_en : m.title_fr) || m.title_fr}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.featured && <Badge tone="blue">{t("Accueil")}</Badge>}
                          <Badge tone={memberStatus[m.status].tone}>{t(memberStatus[m.status].label)}</Badge>
                        </div>
                        <form action={setMemberStatus} className="flex items-center">
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value={m.status === "published" ? "hidden" : "published"} />
                          <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-8 px-3 py-1 text-[0.8125rem]">
                            {m.status === "published" ? t("Masquer") : t("Publier")}
                          </SubmitButton>
                        </form>
                        <div className="flex items-center gap-1" aria-label={t("Ordre de {name}", { name: m.full_name })} role="group">
                          <form action={moveMember}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={i === 0}
                              aria-label={t("Monter {name}", { name: m.full_name })}
                              className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                            >
                              ↑
                            </button>
                          </form>
                          <form action={moveMember}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              disabled={i === list.length - 1}
                              aria-label={t("Descendre {name}", { name: m.full_name })}
                              className="btn btn-quiet min-h-8 w-8 px-0 py-1 text-[0.875rem] disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </form>
                        </div>
                        <Link href={`/admin/equipe/${m.id}`} className="link text-[0.9375rem]">
                          {t("Modifier")}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
