import type { Metadata } from "next";
import { MemberForm } from "@/components/admin/MemberForm";
import { PageHeader } from "@/components/admin/ui";
import { getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ajouter un membre") };
}

export default async function NewMemberPage() {
  await requireStaff();
  const t = await getT();
  return (
    <>
      <PageHeader
        title={t("Ajouter un membre")}
        description={t("Le profil reste masqué tant que vous ne choisissez pas « Publié ».")}
        back={{ href: "/admin/equipe", label: t("Équipe") }}
      />
      <MemberForm
        values={{
          id: null,
          slug: "",
          full_name: "",
          group_key: "lawyer",
          status: "hidden",
          featured: false,
          email: null,
          linkedin_url: null,
          photo_path: null,
          photo_position: "50% 20%",
          title_fr: "",
          title_en: "",
          bio_fr: "",
          bio_en: "",
          focus_areas_fr: [],
          focus_areas_en: [],
          qualifications_fr: [],
          qualifications_en: [],
          bar_admission_fr: null,
          bar_admission_en: null,
          languages_fr: [],
          languages_en: [],
        }}
      />
    </>
  );
}
