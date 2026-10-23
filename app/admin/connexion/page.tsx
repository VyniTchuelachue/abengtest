import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { Notice } from "@/components/admin/ui";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

const errors: Record<string, string> = {
  acces: "Ce compte n'a pas accès à l'administration. Contactez un administrateur du site.",
  lien: "Le lien utilisé a expiré ou n'est plus valide. Demandez un nouveau lien.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  const { erreur, info } = await searchParams;
  return (
    <AuthShell title="Connexion" intro="Accédez à l'espace de gestion des actualités et de l'équipe.">
      <div className="mt-6 empty:hidden">
        {erreur && errors[erreur] && <Notice tone="error">{errors[erreur]}</Notice>}
        {info === "deconnecte" && <Notice tone="success">Vous êtes déconnecté.</Notice>}
      </div>
      <LoginForm />
    </AuthShell>
  );
}
