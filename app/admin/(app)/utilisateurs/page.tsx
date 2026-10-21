import type { Metadata } from "next";
import { ConfirmAction, SubmitButton } from "@/components/admin/client";
import { InviteForm } from "@/components/admin/forms";
import { Badge, Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { removeStaff, updateStaffRole } from "../../actions/misc";

export const metadata: Metadata = { title: "Utilisateurs" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { supabase, userId } = await requireAdmin();
  const { ok, erreur } = await searchParams;
  const { data: staff } = await supabase.from("staff").select("*").order("created_at");
  const invitesEnabled = Boolean(process.env.SUPABASE_SECRET_KEY);

  return (
    <>
      <PageHeader title="Utilisateurs" description="Personnes autorisées à accéder à l'administration du site." />
      {ok === "retire" && <Notice tone="success">Accès retiré.</Notice>}
      {erreur === "soi" && <Notice tone="error">Vous ne pouvez pas retirer votre propre accès.</Notice>}

      <ul className={`${panelClass} divide-y divide-rule`}>
        {(staff ?? []).map((s) => (
          <li key={s.user_id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{s.full_name || s.email}</p>
              <p className="text-[0.875rem] text-slate">{s.email}</p>
            </div>
            <Badge tone={s.role === "admin" ? "blue" : "grey"}>{s.role === "admin" ? "Administrateur" : "Éditeur"}</Badge>
            {s.user_id === userId ? (
              <span className="text-[0.8125rem] text-slate">Vous</span>
            ) : (
              <>
                <form action={updateStaffRole}>
                  <input type="hidden" name="user_id" value={s.user_id} />
                  <input type="hidden" name="role" value={s.role === "admin" ? "editor" : "admin"} />
                  <SubmitButton pendingLabel="…" className="btn btn-quiet min-h-8 px-3 py-1 text-[0.8125rem]">
                    {s.role === "admin" ? "Passer éditeur" : "Passer administrateur"}
                  </SubmitButton>
                </form>
                <ConfirmAction
                  action={removeStaff}
                  fields={{ user_id: s.user_id }}
                  label="Retirer l'accès"
                  title={`Retirer l'accès de ${s.full_name || s.email} ?`}
                  body="Cette personne ne pourra plus se connecter à l'administration."
                  confirmLabel="Retirer l'accès"
                  className="btn btn-quiet min-h-8 px-3 py-1 text-[0.8125rem] text-danger"
                />
              </>
            )}
          </li>
        ))}
      </ul>

      <section className={`${panelClass} mt-8 p-6`}>
        <h2 className="mb-1 font-sans text-[1rem] font-semibold">Inviter une personne</h2>
        <p className="mb-5 text-[0.9375rem] text-ink-soft">La personne reçoit un email pour choisir son mot de passe.</p>
        {!invitesEnabled && (
          <Notice tone="info">
            Pour activer les invitations, ajoutez la clé secrète Supabase (variable SUPABASE_SECRET_KEY) dans les réglages du serveur. En attendant, un accès peut être
            créé depuis le tableau de bord Supabase.
          </Notice>
        )}
        <InviteForm enabled={invitesEnabled} />
      </section>
    </>
  );
}
