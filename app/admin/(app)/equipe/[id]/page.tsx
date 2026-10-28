import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/client";
import { MemberForm } from "@/components/admin/MemberForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { deleteMember } from "../../../actions/team";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Modifier le profil") };
}

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

  const { data: member } = await supabase.from("team_members").select("*").eq("id", id).maybeSingle();
  if (!member) notFound();
  const t = await getT();
  const locale = await getAdminLocale();
  const pick = (fr: string, en: string | null) => (locale === "en" && en ? en : fr);

  return (
    <>
      <PageHeader
        title={member.full_name}
        description={pick(member.title_fr, member.title_en)}
        back={{ href: "/admin/equipe", label: t("Équipe") }}
        actions={
          staff.role === "admin" ? (
            <ConfirmAction
              action={deleteMember}
              fields={{ id: member.id }}
              label={t("Supprimer le profil")}
              title={t("Supprimer le profil de {name} ?", { name: member.full_name })}
              body={t("Le profil et son portrait seront supprimés définitivement. Pour retirer temporairement un profil du site, choisissez plutôt « Masqué » ou « Inactif ».")}
              confirmLabel={t("Supprimer définitivement")}
            />
          ) : undefined
        }
      />
      {erreur === "suppression" && <Notice tone="error">{t("La suppression a échoué. Réessayez.")}</Notice>}
      <MemberForm flash={ok === "cree" ? t("Profil créé.") : undefined} values={member} />
    </>
  );
}
