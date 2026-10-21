import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmAction, SubmitButton } from "@/components/admin/client";
import { Badge, EmptyState, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deleteMessage, setMessageStatus } from "../../actions/misc";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ vue?: string; ok?: string }> }) {
  const { supabase } = await requireStaff();
  const { vue, ok } = await searchParams;
  const archived = vue === "archives";
  let query = supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
  query = archived ? query.eq("status", "archived") : query.neq("status", "archived");
  const { data: messages } = await query;

  const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" });

  return (
    <>
      <PageHeader
        title="Messages"
        description="Demandes envoyées via le formulaire de contact du site."
        actions={
          <nav className="flex gap-1" aria-label="Affichage">
            <Link href="/admin/messages" aria-current={!archived ? "page" : undefined} className="rounded-sm px-3 py-1.5 text-[0.875rem] text-ink-soft hover:bg-stone aria-[current=page]:bg-ink aria-[current=page]:text-paper">
              Boîte de réception
            </Link>
            <Link href="/admin/messages?vue=archives" aria-current={archived ? "page" : undefined} className="rounded-sm px-3 py-1.5 text-[0.875rem] text-ink-soft hover:bg-stone aria-[current=page]:bg-ink aria-[current=page]:text-paper">
              Archives
            </Link>
          </nav>
        }
      />
      {ok === "supprime" && <Notice tone="success">Message supprimé.</Notice>}

      {!messages || messages.length === 0 ? (
        <EmptyState
          title={archived ? "Aucun message archivé" : "Aucun message"}
          body={archived ? "Les messages archivés apparaîtront ici." : "Les demandes envoyées depuis la page Contact du site apparaîtront ici."}
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} id={`m-${m.id}`} className={`${panelClass} scroll-mt-6 p-5 ${m.status === "new" ? "border-l-2 border-l-brass" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {m.name} {m.status === "new" && <Badge tone="blue">Nouveau</Badge>}
                  </p>
                  <p className="text-[0.875rem] text-ink-soft">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Votre message"}`)}`} className="link">
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
                  {fmt.format(new Date(m.created_at))} · {m.locale === "fr" ? "site en français" : "site en anglais"}
                </p>
              </div>
              {m.subject && <p className="mt-3 text-[0.9375rem] font-medium">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-line text-[0.9375rem] text-ink-soft">{m.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Votre message"}`)}`} className="btn btn-primary min-h-9 px-3 py-1.5 text-[0.875rem]">
                  Répondre par email
                </a>
                {m.status === "new" && (
                  <form action={setMessageStatus}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="read" />
                    <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem]">
                      Marquer comme lu
                    </SubmitButton>
                  </form>
                )}
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={archived ? "read" : "archived"} />
                  <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-9 px-3 py-1.5 text-[0.875rem]">
                    {archived ? "Restaurer" : "Archiver"}
                  </SubmitButton>
                </form>
                <ConfirmAction
                  action={deleteMessage}
                  fields={{ id: m.id }}
                  label="Supprimer"
                  title="Supprimer ce message ?"
                  body="Le message sera supprimé définitivement. Pour le garder hors de la boîte de réception, archivez-le plutôt."
                  confirmLabel="Supprimer"
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
