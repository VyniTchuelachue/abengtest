import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/client";
import { PracticeAreaForm } from "@/components/admin/PracticeAreaForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { deletePracticeArea } from "../../../actions/practice";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Modifier l'expertise") };
}

export default async function EditPracticeAreaPage({
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

  const { data: area } = await supabase.from("practice_areas").select("*").eq("id", id).maybeSingle();
  if (!area) notFound();
  const t = await getT();
  const locale = await getAdminLocale();
  const title = (locale === "en" ? area.title_en : area.title_fr) || area.title_fr;

  return (
    <>
      <PageHeader
        title={title}
        back={{ href: "/admin/expertises", label: t("Expertises") }}
        actions={
          staff.role === "admin" ? (
            <ConfirmAction
              action={deletePracticeArea}
              fields={{ id: area.id }}
              label={t("Supprimer l'expertise")}
              title={t("Supprimer l'expertise « {name} » ?", { name: title })}
              body={t("La page sera supprimée définitivement, dans les deux langues. Pour la retirer temporairement du site, décochez plutôt « Visible sur le site ».")}
              confirmLabel={t("Supprimer définitivement")}
            />
          ) : undefined
        }
      />
      {erreur === "suppression" && <Notice tone="error">{t("La suppression a échoué. Réessayez.")}</Notice>}
      <PracticeAreaForm flash={ok === "cree" ? t("Expertise créée.") : undefined} values={area} />
    </>
  );
}
