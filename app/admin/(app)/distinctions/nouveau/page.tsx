import type { Metadata } from "next";
import { RecognitionForm } from "@/components/admin/RecognitionForm";
import { PageHeader } from "@/components/admin/ui";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ajouter une distinction") };
}

export default async function NewRecognitionPage() {
  await requireStaff();
  const t = await getT();
  const locale = await getAdminLocale();
  return (
    <>
      <PageHeader
        title={t("Ajouter une distinction")}
        description={t("Elle reste masquée tant que « Visible sur le site » n'est pas coché.")}
        back={{ href: "/admin/distinctions", label: t("Distinctions") }}
      />
      <RecognitionForm
        kindLabels={getDictionary(locale).firmPage.recognitionKinds}
        values={{
          id: null,
          kind: "award",
          name_fr: "",
          name_en: "",
          recipient: "",
          year: "",
          detail_fr: "",
          detail_en: "",
          published: false,
          photos: [],
        }}
      />
    </>
  );
}
