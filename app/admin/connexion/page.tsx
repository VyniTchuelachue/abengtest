import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion" };

const errors: Record<string, string> = {
  acces: "Ce compte n'a pas accès à l'administration. Contactez un administrateur du site.",
  lien: "Le lien utilisé a expiré ou n'est plus valide. Demandez un nouveau lien.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string; info?: string }> }) {
  const { erreur, info } = await searchParams;
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden bg-ink lg:block">
        <Image src="/images/team.jpg" alt="" fill priority sizes="50vw" className="object-cover opacity-55" style={{ objectPosition: "40% 20%" }} />
        <div className="absolute inset-x-0 bottom-0 p-12 text-paper">
          <p className="font-serif text-3xl">The Abeng Law Firm</p>
          <p className="mt-2 text-mist">Administration du site</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Image src="/images/crest.png" alt="" width={56} height={56} />
          <h1 className="heading mt-8 text-[2.25rem]">Connexion</h1>
          <p className="mt-2 text-ink-soft">Accédez à l&apos;espace de gestion des actualités et de l&apos;équipe.</p>
          {erreur && errors[erreur] && (
            <p role="alert" className="mt-6 border-l-2 border-danger bg-white px-4 py-3 text-[0.9375rem] text-danger">
              {errors[erreur]}
            </p>
          )}
          {info === "deconnecte" && (
            <p role="status" className="mt-6 border-l-2 border-success bg-white px-4 py-3 text-[0.9375rem] text-success">
              Vous êtes déconnecté.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
