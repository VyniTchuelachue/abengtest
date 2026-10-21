import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/forms";
import { Notice, PageHeader, panelClass } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string; reinitialisation?: string }> }) {
  const { email, staff } = await requireStaff();
  const { bienvenue, reinitialisation } = await searchParams;
  return (
    <>
      <PageHeader title="Mon compte" description={`${email} · ${staff.role === "admin" ? "Administrateur" : "Éditeur"}`} />
      {bienvenue && <Notice tone="info">Bienvenue. Choisissez votre mot de passe pour finaliser votre accès.</Notice>}
      {reinitialisation && <Notice tone="info">Choisissez un nouveau mot de passe.</Notice>}
      <section className={`${panelClass} p-6`}>
        <h2 className="mb-5 font-sans text-[1rem] font-semibold">Mot de passe</h2>
        <PasswordForm />
      </section>
    </>
  );
}
