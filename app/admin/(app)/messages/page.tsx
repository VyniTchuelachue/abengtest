import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmAction, SubmitButton } from "@/components/admin/client";
import { Badge, EmptyState, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { deleteMessage, setMessageStatus } from "../../actions/misc";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Messages") };
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ vue?: string; ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { vue, ok } = await searchParams;
  const archived = vue === "archives";
  let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  query = archived ? query.eq("status", "archived") : query.neq("status", "archived");
  const { data: messages } = await query;

  const t = await getT();
  const locale = await getAdminLocale();
  const fmt = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" });

  return (
    <>
      <PageHeader
        title={t("Messages")}
        description={t("Demandes envoyées via les formulaires de contact et de recrutement du site.")}
        actions={
          <nav className="flex gap-1" aria-label={t("Affichage")}>
            <Link href="/admin/messages" aria-current={!archived ? "page" : undefined} className="rounded-full px-3.5 py-1.5 text-[0.875rem] text-ink-soft hover:bg-white aria-[current=page]:bg-charcoal aria-[current=page]:text-white">
              {t("Boîte de réception")}
            </Link>
            <Link href="/admin/messages?vue=archives" aria-current={archived ? "page" : undefined} className="rounded-full px-3.5 py-1.5 text-[0.875rem] text-ink-soft hover:bg-white aria-[current=page]:bg-charcoal aria-[current=page]:text-white">
              {t("Archives")}
            </Link>
          </nav>
        }
      />
      {ok === "supprime" && <Notice tone="success">{t("Message supprimé.")}</Notice>}

      {!messages || messages.length === 0 ? (
        <EmptyState
          title={archived ? t("Aucun message archivé") : t("Aucun message")}
          body={archived ? t("Les messages archivés apparaîtront ici.") : t("Les demandes envoyées depuis les pages Contact et Recrutement du site apparaîtront ici.")}
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} id={`m-${m.id}`} className={`${panelClass} scroll-mt-6 p-5 ${m.status === "new" ? "border-l-4 border-l-gold" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {m.name} {m.status === "new" && <Badge tone="gold">{t("Nouveau")}</Badge>}{" "}
                    {(m.subject === "Recrutement" || m.subject === "Careers") && <Badge tone="blue">{t("Candidature")}</Badge>}
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
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? t("Votre message")}`)}`} className="btn btn-gold min-h-9 px-3 py-1.5 text-[0.875rem]">
                  {t("Répondre par email")}
                </a>
                {m.status === "new" && (
                  <form action={setMessageStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="read" />
                    <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem]">
                      {t("Marquer comme lu")}
                    </SubmitButton>
                  </form>
                )}
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={archived ? "read" : "archived"} />
                  <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem]">
                    {archived ? t("Restaurer") : t("Archiver")}
                  </SubmitButton>
                </form>
                <ConfirmAction
                  action={deleteMessage}
                  fields={{ id: m.id }}
                  label={t("Supprimer")}
                  title={t("Supprimer ce message ?")}
                  body={t("Le message sera supprimé définitivement. Pour le garder hors de la boîte de réception, archivez-le plutôt.")}
                  confirmLabel={t("Supprimer")}
                  className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem] text-danger"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
