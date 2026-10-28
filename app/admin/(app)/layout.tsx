import Link from "next/link";
import { ExternalLink, KeyRound, LogOut } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { getAdminLocale, getT } from "@/lib/admin-i18n/server";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../actions/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, staff, email } = await requireStaff();
  const locale = await getAdminLocale();
  const t = await getT();
  const { count: unread } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new");

  const items = [
    { href: "/admin", label: t("Tableau de bord") },
    { href: "/admin/actualites", label: t("Actualités") },
    { href: "/admin/equipe", label: t("Équipe") },
    { href: "/admin/expertises", label: t("Expertises") },
    { href: "/admin/messages", label: t("Messages"), badge: unread ?? 0 },
    { href: "/admin/categories", label: t("Catégories") },
    ...(staff.role === "admin" ? [{ href: "/admin/utilisateurs", label: t("Utilisateurs") }] : []),
    { href: "/admin/compte", label: t("Mon compte") },
  ];
  const name = staff.full_name || email;

  return (
    <div className="min-h-dvh bg-stone">
      <Sidebar
        items={items}
        footer={
          <>
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold font-display text-[0.9375rem] font-bold text-ink">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-white" title={email}>
                  {name}
                </span>
                <span className="block text-[0.75rem] uppercase tracking-[0.14em] text-gold">{staff.role === "admin" ? t("Administrateur") : t("Éditeur")}</span>
              </span>
            </div>
            <Link href="/admin/compte#mot-de-passe" className="mt-4 inline-flex items-center gap-1.5 text-gold transition-colors hover:text-white">
              <KeyRound aria-hidden className="h-4 w-4" />
              {t("Modifier le mot de passe")}
            </Link>
            <div className="mt-4 flex items-center justify-between gap-3">
              <a href={`/${locale}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                <ExternalLink aria-hidden className="h-4 w-4" />
                {t("Voir le site")}
              </a>
              <form action={signOut}>
                <button type="submit" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                  <LogOut aria-hidden className="h-4 w-4" />
                  {t("Se déconnecter")}
                </button>
              </form>
            </div>
          </>
        }
      />
      <main id="contenu" className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
