import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/forms";
import { Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Mon compte") };
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string; reinitialisation?: string }> }) {
  const { email, staff } = await requireStaff();
  const { bienvenue, reinitialisation } = await searchParams;
  const t = await getT();
  return (
    <>
      <PageHeader title={t("Mon compte")} description={`${email} · ${staff.role === "admin" ? t("Administrateur") : t("Éditeur")}`} />
      {bienvenue && <Notice tone="info">{t("Bienvenue. Choisissez votre mot de passe pour finaliser votre accès.")}</Notice>}
      {reinitialisation && <Notice tone="info">{t("Choisissez un nouveau mot de passe.")}</Notice>}
      <section className={`${panelClass} p-6`}>
        <h2 className="mb-5 font-sans text-[1rem] font-semibold">{t("Mot de passe")}</h2>
        <PasswordForm />
      </section>
    </>
  );
}
