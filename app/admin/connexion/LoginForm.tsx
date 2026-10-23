"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { useT } from "@/components/admin/i18n";
import { inputClass, labelClass } from "@/components/admin/ui";

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await browserClient().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setPending(false);
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "Adresse email ou mot de passe incorrect."
          : "Connexion impossible pour le moment. Réessayez dans quelques instants.",
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-[#fbefef] px-4 py-3 text-[0.9375rem] text-danger">
          {t(error)}
        </p>
      )}
      <label className={labelClass}>
        {t("Adresse email")}
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className={labelClass}>
        {t("Mot de passe")}
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className="btn btn-gold w-full disabled:opacity-60">
        {pending ? t("Connexion…") : t("Se connecter")}
      </button>
      <Link href="/admin/mot-de-passe-oublie" className="link block text-center text-[0.9375rem] text-gold-dark">
        {t("Mot de passe oublié ?")}
      </Link>
    </form>
  );
}
