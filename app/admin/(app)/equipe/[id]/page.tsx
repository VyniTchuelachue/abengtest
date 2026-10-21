import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/client";
import { MemberForm } from "@/components/admin/MemberForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deleteMember } from "../../../actions/team";

export const metadata: Metadata = { title: "Modifier le profil" };

export default async function EditMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const { supabase, staff } = await requireStaff();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: member }, { data: areas }, { data: links }] = await Promise.all([
    supabase.from("team_members").select("*").eq("id", id).maybeSingle(),
    supabase.from("practice_areas").select("id, title_fr, group_key, sort_order").order("sort_order"),
    supabase.from("team_member_practice_areas").select("practice_area_id").eq("member_id", id),
  ]);
  if (!member) notFound();

  return (
    <>
      <PageHeader
        title={member.full_name}
        description={member.title_fr}
        back={{ href: "/admin/equipe", label: "Équipe" }}
        actions={
          staff.role === "admin" ? (
            <ConfirmAction
              action={deleteMember}
              fields={{ id: member.id }}
              label="Supprimer le profil"
              title={`Supprimer le profil de ${member.full_name} ?`}
              body="Le profil et son portrait seront supprimés définitivement. Pour retirer temporairement un profil du site, choisissez plutôt « Masqué » ou « Inactif »."
              confirmLabel="Supprimer définitivement"
            />
          ) : undefined
        }
      />
      {erreur === "suppression" && <Notice tone="error">La suppression a échoué. Réessayez.</Notice>}
      <MemberForm
        flash={ok === "cree" ? "Profil créé." : undefined}
        practiceAreas={(areas ?? []).map((a) => ({ id: a.id, label: a.title_fr, group: a.group_key }))}
        values={{ ...member, practiceAreaIds: (links ?? []).map((l) => l.practice_area_id) }}
      />
    </>
  );
}
