import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmAction, SubmitButton } from "@/components/admin/client";
import { Badge, EmptyState, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { dueWithin, purgeExpired, retainUntil } from "@/lib/retention";
import { deleteMessage, setMessageClosed, setMessageStatus } from "../../actions/misc";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Messages") };
}

type View = "inbox" | "due" | "archives";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ vue?: string; ok?: string; erreur?: string; q?: string }> }) {
  const { supabase } = await requireStaff();
  const { vue, ok, erreur, q } = await searchParams;
  const view: View = vue === "archives" ? "archives" : vue === "echeance" ? "due" : "inbox";
  const search = (q ?? "").trim().slice(0, 100);

  // Records past their retention period are deleted before the list is read (the daily job does the same).
  const purged = await purgeExpired();

  let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(300);
  if (view === "archives") query = query.eq("status", "archived");
  if (view === "inbox") query = query.neq("status", "archived");
  if (search) query = query.or(`email.ilike.%${search.replace(/[%,()]/g, "")}%,name.ilike.%${search.replace(/[%,()]/g, "")}%`);
  const { data } = await query;
  const messages = view === "due" ? (data ?? []).filter((m) => dueWithin(m, 31)).sort((a, b) => (retainUntil(a)?.getTime() ?? 0) - (retainUntil(b)?.getTime() ?? 0)) : (data ?? []);

  const t = await getT();
  const locale = await getAdminLocale();
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" });
  const day = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "long", timeZone: "Africa/Douala" });
  const tab = (key: View, label: string, href: string) => (
    <Link href={href} aria-current={view === key ? "page" : undefined} className="rounded-full px-3.5 py-1.5 text-[0.875rem] text-ink-soft hover:bg-white aria-[current=page]:bg-charcoal aria-[current=page]:text-white">
      {label}
    </Link>
  );
  const small = "btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem]";

  return (
    <>
      <PageHeader
        title={t("Messages")}
        description={t("Demandes envoyées via les formulaires de contact et de recrutement du site.")}
        actions={
          <nav className="flex flex-wrap gap-1" aria-label={t("Affichage")}>
            {tab("inbox", t("Boîte de réception"), "/admin/messages")}
            {tab("due", t("À supprimer bientôt"), "/admin/messages?vue=echeance")}
            {tab("archives", t("Archives"), "/admin/messages?vue=archives")}
          </nav>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Message supprimé du site, avec son CV le cas échéant. Supprimez aussi la copie reçue dans la boîte email du cabinet.")}</Notice>}
      {erreur === "cv" && <Notice tone="error">{t("Le CV n'a pas pu être supprimé ; le message a été conservé. Réessayez.")}</Notice>}
      {purged && purged.records > 0 && (
        <Notice tone="success">{t("{n} message(s) arrivé(s) au terme de la durée de conservation ont été supprimés du site.", { n: purged.records })}</Notice>
      )}

      <div className={`${panelClass} mb-6 p-5 text-[0.9375rem] text-ink-soft`}>
        <p>
          {t(
            "Durée de conservation (avis de confidentialité) : une demande est supprimée du site six mois après sa clôture ; une candidature, six mois après la décision (enregistrée en la clôturant) ou, sans décision, six mois après sa réception. La suppression est automatique chaque jour. Les copies reçues dans la boîte email du cabinet doivent être supprimées à la même date par le cabinet.",
          )}
        </p>
        <form className="mt-4 flex flex-wrap gap-2" role="search">
          {view !== "inbox" && <input type="hidden" name="vue" value={view === "due" ? "echeance" : "archives"} />}
          <input name="q" defaultValue={search} placeholder={t("Rechercher un nom ou une adresse email")} className="min-w-56 flex-1 rounded-xl border border-rule bg-white px-4 py-2 text-[0.9375rem]" />
          <button className="btn btn-quiet min-h-10 px-4">{t("Rechercher")}</button>
        </form>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title={view === "archives" ? t("Aucun message archivé") : view === "due" ? t("Aucune suppression prévue dans les 30 jours") : t("Aucun message")}
          body={view === "archives" ? t("Les messages archivés apparaîtront ici.") : view === "due" ? t("Les messages dont la durée de conservation se termine bientôt apparaîtront ici.") : t("Les demandes envoyées depuis les pages Contact et Recrutement du site apparaîtront ici.")}
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => {
            const end = retainUntil(m);
            const isApplication = m.kind === "application";
            return (
              <li key={m.id} id={`m-${m.id}`} className={`${panelClass} scroll-mt-6 p-5 ${m.status === "new" ? "border-l-4 border-l-gold" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {m.name} {m.status === "new" && <Badge tone="gold">{t("Nouveau")}</Badge>} {isApplication && <Badge tone="blue">{t("Candidature")}</Badge>}{" "}
                      {m.closed_at && <Badge tone="green">{isApplication ? t("Décision prise") : t("Clôturée")}</Badge>}
                    </p>
                    <p className="text-[0.875rem] text-ink-soft">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? t("Votre message")}`)}`} className="link">
                        {m.email}
                      </a>
                      {m.phone && (
                        <>
                          {" · "}
                          <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="link">
                            {m.phone}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-[0.8125rem] text-slate">
                    {fmt.format(new Date(m.created_at))} · {m.locale === "fr" ? t("site en français") : t("site en anglais")}
                  </p>
                </div>
                {m.subject && <p className="mt-3 text-[0.9375rem] font-medium">{m.subject}</p>}
                <p className="mt-2 whitespace-pre-line text-[0.9375rem] text-ink-soft">{m.message}</p>

                <dl className="mt-4 grid gap-x-6 gap-y-1 text-[0.8125rem] text-slate sm:grid-cols-2">
                  <div>
                    <dt className="inline">{t("Consentement")} : </dt>
                    <dd className="inline">
                      {m.consent_at ? t("donné le {date} (avis du {version})", { date: fmt.format(new Date(m.consent_at)), version: m.consent_notice_version ?? "" }) : t("non enregistré (message reçu avant l'avis du 19 novembre 2026)")}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">{t("Suppression du site")} : </dt>
                    <dd className="inline">{end ? day.format(end) : t("six mois après la clôture")}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? t("Votre message")}`)}`} className="btn btn-gold min-h-9 px-3 py-1.5 text-[0.875rem]">
                    {t("Répondre par email")}
                  </a>
                  {m.cv_path && (
                    <a href={`/admin/messages/${m.id}/cv`} className={small}>
                      {t("Télécharger le CV")} ({m.cv_name})
                    </a>
                  )}
                  {m.status === "new" && (
                    <form action={setMessageStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="status" value="read" />
                      <SubmitButton pendingLabel="…" className={small}>
                        {t("Marquer comme lu")}
                      </SubmitButton>
                    </form>
                  )}
                  <form action={setMessageClosed}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="closed" value={m.closed_at ? "0" : "1"} />
                    <SubmitButton pendingLabel="…" className={small}>
                      {m.closed_at ? t("Rouvrir") : isApplication ? t("Enregistrer la décision") : t("Clôturer la demande")}
                    </SubmitButton>
                  </form>
                  <form action={setMessageStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value={m.status === "archived" ? "read" : "archived"} />
                    <SubmitButton pendingLabel="…" className={small}>
                      {m.status === "archived" ? t("Restaurer") : t("Archiver")}
                    </SubmitButton>
                  </form>
                  <a href={`/admin/messages/${m.id}/export`} className={small}>
                    {t("Exporter les données")}
                  </a>
                  <ConfirmAction
                    action={deleteMessage}
                    fields={{ id: m.id }}
                    label={t("Supprimer")}
                    title={t("Supprimer ce message ?")}
                    body={t("Le message et son CV éventuel seront supprimés définitivement du site. Supprimez aussi la copie reçue dans la boîte email du cabinet.")}
                    confirmLabel={t("Supprimer")}
                    className={`${small} text-danger`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
