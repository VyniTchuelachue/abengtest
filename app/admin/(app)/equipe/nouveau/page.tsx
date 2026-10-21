import type { Metadata } from "next";
import { MemberForm } from "@/components/admin/MemberForm";
import { PageHeader } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Ajouter un membre" };

export default async function NewMemberPage() {
  const { supabase } = await requireStaff();
  const { data: areas } = await supabase.from("practice_areas").select("id, title_fr, group_key, sort_order").order("sort_order");
  return (
    <>
      <PageHeader
        title="Ajouter un membre"
        description="Le profil reste masqué tant que vous ne choisissez pas « Publié »."
        back={{ href: "/admin/equipe", label: "Équipe" }}
      />
      <MemberForm
        practiceAreas={(areas ?? []).map((a) => ({ id: a.id, label: a.title_fr, group: a.group_key }))}
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
          practiceAreaIds: [],
        }}
      />
    </>
  );
}
