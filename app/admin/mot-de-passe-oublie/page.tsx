"use client";

import Link from "next/link";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { AuthShell } from "@/components/admin/AuthShell";
import { useT } from "@/components/admin/i18n";
import { inputClass, labelClass } from "@/components/admin/ui";

export default function ForgotPasswordPage() {
  const t = useT();
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
    <AuthShell title={t("Mot de passe oublié")}>
      {sent ? (
        <p role="status" className="mt-6 rounded-xl border border-success/30 bg-[#eef6f1] px-4 py-3 text-[0.9375rem] text-success">
          {t("Si cette adresse correspond à un accès, un email contenant un lien de réinitialisation vient d'être envoyé.")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <p className="text-ink-soft">{t("Indiquez votre adresse email : vous recevrez un lien pour choisir un nouveau mot de passe.")}</p>
          {error && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-[#fbefef] px-4 py-3 text-[0.9375rem] text-danger">
              {t(error)}
            </p>
          )}
          <label className={labelClass}>
            {t("Adresse email")}
            <input name="email" type="email" required autoComplete="username" className={inputClass} />
          </label>
          <button type="submit" disabled={pending} className="btn btn-gold w-full disabled:opacity-60">
            {pending ? t("Envoi…") : t("Envoyer le lien")}
          </button>
        </form>
      )}
      <Link href="/admin/connexion" className="link mt-6 block text-center text-[0.9375rem] text-gold-dark">
        {t("Retour à la connexion")}
      </Link>
    </AuthShell>
  );
}
