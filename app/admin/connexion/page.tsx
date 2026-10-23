import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { Notice } from "@/components/admin/ui";
import { getT } from "@/lib/admin-i18n/server";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Connexion") };
}

const errors: Record<string, string> = {
  acces: "Ce compte n'a pas accès à l'administration. Contactez un administrateur du site.",
  lien: "Le lien utilisé a expiré ou n'est plus valide. Demandez un nouveau lien.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  const { erreur, info } = await searchParams;
  const t = await getT();
  return (
    <AuthShell title={t("Connexion")} intro={t("Accédez à l'espace de gestion des actualités et de l'équipe.")}>
      <div className="mt-6 empty:hidden">
        {erreur && errors[erreur] && <Notice tone="error">{t(errors[erreur])}</Notice>}
        {info === "deconnecte" && <Notice tone="success">{t("Vous êtes déconnecté.")}</Notice>}
      </div>
      <LoginForm />
    </AuthShell>
  );
}
