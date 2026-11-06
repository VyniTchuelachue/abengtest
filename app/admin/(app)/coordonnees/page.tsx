import type { Metadata } from "next";
import { SiteContactForm } from "@/components/admin/forms";
import { PageHeader, panelClass } from "@/components/admin/ui";
import { getT } from "@/lib/admin-i18n/server";
import { requireAdmin } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Coordonnées") };
}

export default async function SiteContactPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_contact").select("phones, emails").maybeSingle();
  const t = await getT();

  return (
    <>
      <PageHeader
        title={t("Coordonnées")}
        description={t("Les numéros de téléphone et adresses email affichés sur le site : en-tête, pied de page, pages Contact et Recrutement.")}
      />
      <section className={`${panelClass} max-w-2xl p-6`}>
        <SiteContactForm phones={data?.phones ?? []} emails={data?.emails ?? []} />
      </section>
    </>
  );
}
