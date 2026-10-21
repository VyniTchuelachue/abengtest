"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient } from "@/lib/supabase/browser";
import { inputClass, labelClass } from "@/components/admin/ui";

export function LoginForm() {
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
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {error && (
        <p role="alert" className="border-l-2 border-danger bg-white px-4 py-3 text-[0.9375rem] text-danger">
          {error}
        </p>
      )}
      <label className={labelClass}>
        Adresse email
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className={labelClass}>
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <Link href="/admin/mot-de-passe-oublie" className="link block text-center text-[0.9375rem] text-ink-soft">
        Mot de passe oublié ?
      </Link>
    </form>
  );
}
