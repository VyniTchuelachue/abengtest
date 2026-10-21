"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { inputClass, labelClass } from "@/components/admin/ui";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    const { error } = await browserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent("/admin/compte?reinitialisation=1")}`,
    });
    setPending(false);
    // Same message whether or not the address exists, so accounts cannot be probed.
    if (error && error.status !== 400) setError("L'envoi a échoué. Réessayez dans quelques minutes.");
    else setSent(true);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Image src="/images/crest.png" alt="" width={56} height={56} />
        <h1 className="heading mt-8 text-[2.25rem]">Mot de passe oublié</h1>
        {sent ? (
          <p role="status" className="mt-6 border-l-2 border-success bg-white px-4 py-3 text-[0.9375rem] text-success">
            Si cette adresse correspond à un accès, un email contenant un lien de réinitialisation vient d&apos;être envoyé.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <p className="text-ink-soft">Indiquez votre adresse email : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
            {error && (
              <p role="alert" className="border-l-2 border-danger bg-white px-4 py-3 text-[0.9375rem] text-danger">
                {error}
              </p>
            )}
            <label className={labelClass}>
              Adresse email
              <input name="email" type="email" required autoComplete="username" className={inputClass} />
            </label>
            <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
              {pending ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}
        <Link href="/admin/connexion" className="link mt-6 block text-center text-[0.9375rem] text-ink-soft">
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
