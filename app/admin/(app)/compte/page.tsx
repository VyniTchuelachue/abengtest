import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
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
      <section id="mot-de-passe" className={`${panelClass} scroll-mt-24 p-6`}>
        <h2 className="mb-5 flex items-center gap-3 font-display text-[1.125rem] font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-ink">
            <KeyRound aria-hidden className="h-4 w-4" />
          </span>
          {t("Modifier le mot de passe")}
        </h2>
        <PasswordForm />
      </section>
    </>
  );
}
