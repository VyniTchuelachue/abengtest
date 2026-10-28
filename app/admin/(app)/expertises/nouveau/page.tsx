import type { Metadata } from "next";
import { PracticeAreaForm } from "@/components/admin/PracticeAreaForm";
import { PageHeader } from "@/components/admin/ui";
import { getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ajouter une expertise") };
}

export default async function NewPracticeAreaPage() {
  await requireStaff();
  const t = await getT();
  return (
    <>
      <PageHeader
        title={t("Ajouter une expertise")}
        description={t("La page reste masquée tant que « Visible sur le site » n'est pas coché.")}
        back={{ href: "/admin/expertises", label: t("Expertises") }}
      />
      <PracticeAreaForm
        values={{
          id: null,
          slug: "",
          slug_fr: "",
          published: false,
          title_fr: "",
          title_en: "",
          summary_fr: "",
          summary_en: "",
          body_fr: "",
          body_en: "",
          scope_fr: [],
          scope_en: [],
        }}
      />
    </>
  );
}
