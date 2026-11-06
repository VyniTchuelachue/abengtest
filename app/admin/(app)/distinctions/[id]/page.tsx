import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/client";
import { RecognitionForm, type RecognitionFormPhoto } from "@/components/admin/RecognitionForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import { deleteRecognition } from "../../../actions/recognitions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Modifier la distinction") };
}

export default async function EditRecognitionPage({
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

  const { data: item } = await supabase.from("recognitions").select("*").eq("id", id).maybeSingle();
  if (!item) notFound();
  const t = await getT();
  const locale = await getAdminLocale();
  const name = (locale === "en" ? item.name_en : item.name_fr) || item.name_fr;

  return (
    <>
      <PageHeader
        title={name}
        back={{ href: "/admin/distinctions", label: t("Distinctions") }}
        actions={
          staff.role === "admin" ? (
            <ConfirmAction
              action={deleteRecognition}
              fields={{ id: item.id }}
              label={t("Supprimer la distinction")}
              title={t("Supprimer la distinction « {name} » ?", { name })}
              body={t("Elle sera supprimée définitivement, dans les deux langues. Pour la retirer temporairement du site, décochez plutôt « Visible sur le site ».")}
              confirmLabel={t("Supprimer définitivement")}
            />
          ) : undefined
        }
      />
      {erreur === "suppression" && <Notice tone="error">{t("La suppression a échoué. Réessayez.")}</Notice>}
      <RecognitionForm
        key={item.updated_at}
        flash={ok === "cree" ? t("Distinction créée.") : undefined}
        kindLabels={getDictionary(locale).firmPage.recognitionKinds}
        values={{ ...item, photos: item.photos as RecognitionFormPhoto[] }}
      />
    </>
  );
}
