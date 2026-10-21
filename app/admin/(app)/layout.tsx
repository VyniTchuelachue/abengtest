import { Sidebar } from "@/components/admin/Sidebar";
import { requireStaff } from "@/lib/auth";
import { signOut } from "../actions/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, staff, email } = await requireStaff();
  const { count: unread } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new");

  const items = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/actualites", label: "Actualités" },
    { href: "/admin/equipe", label: "Équipe" },
    { href: "/admin/messages", label: "Messages", badge: unread ?? 0 },
    { href: "/admin/categories", label: "Catégories" },
    ...(staff.role === "admin" ? [{ href: "/admin/utilisateurs", label: "Utilisateurs" }] : []),
    { href: "/admin/compte", label: "Mon compte" },
  ];

  return (
    <div className="min-h-dvh bg-paper">
      <Sidebar
        items={items}
        footer={
          <>
            <p className="truncate text-paper" title={email}>
              {staff.full_name || email}
            </p>
            <p className="text-[0.75rem]">{staff.role === "admin" ? "Administrateur" : "Éditeur"}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <a href="/fr" target="_blank" rel="noopener" className="link">
                Voir le site
              </a>
              <form action={signOut}>
                <button type="submit" className="link">
                  Se déconnecter
                </button>
              </form>
            </div>
          </>
        }
      />
      <main id="contenu" className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
