import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Notice, PageHeader, articleStatus, panelClass } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Overview({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { supabase, staff } = await requireStaff();
  const { erreur } = await searchParams;

  const count = async (table: "articles" | "team_members" | "contact_messages", column: string, value: string) => {
    const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(column, value);
    return count ?? 0;
  };
  const [published, drafts, profiles, unread, recentArticles, recentMessages] = await Promise.all([
    count("articles", "status", "published"),
    count("articles", "status", "draft"),
    count("team_members", "status", "published"),
    count("contact_messages", "status", "new"),
    supabase.from("articles").select("id, title_fr, title_en, status, published_at, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("contact_messages").select("id, name, subject, created_at, status").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Actualités publiées", value: published, href: "/admin/actualites?statut=published" },
    { label: "Brouillons", value: drafts, href: "/admin/actualites?statut=draft" },
    { label: "Profils en ligne", value: profiles, href: "/admin/equipe" },
    { label: "Messages non lus", value: unread, href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader
        title={`Bonjour${staff.full_name && staff.full_name !== "Administrateur" ? `, ${staff.full_name.split(" ")[0]}` : ""}`}
        description="Gérez les actualités, les profils de l'équipe et les messages reçus via le site."
        actions={
          <>
            <Link href="/admin/equipe/nouveau" className="btn btn-quiet">
              Ajouter un membre
            </Link>
            <Link href="/admin/actualites/nouveau" className="btn btn-primary">
              Rédiger une actualité
            </Link>
          </>
        }
      />
      {erreur === "droits" && <Notice tone="error">Cette page est réservée aux administrateurs.</Notice>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`${panelClass} block px-5 py-5 transition-colors hover:border-ink`}>
              <span className="block font-serif text-[2.25rem] leading-none">{s.value}</span>
              <span className="mt-2 block text-[0.875rem] text-ink-soft">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className={panelClass}>
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <h2 className="font-sans text-[1rem] font-semibold">Dernières actualités modifiées</h2>
            <Link href="/admin/actualites" className="link text-[0.875rem]">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-rule">
            {(recentArticles.data ?? []).map((a) => {
              const s = a.status === "published" && a.published_at && new Date(a.published_at) > new Date() ? "scheduled" : a.status;
              return (
                <li key={a.id}>
                  <Link href={`/admin/actualites/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate text-[0.9375rem]">{a.title_fr || a.title_en}</span>
                      <span className="text-[0.8125rem] text-slate">Modifiée le {formatDate(a.updated_at, "fr")}</span>
                    </span>
                    <Badge tone={articleStatus[s].tone}>{articleStatus[s].label}</Badge>
                  </Link>
                </li>
              );
            })}
            {(recentArticles.data ?? []).length === 0 && <li className="px-5 py-6 text-[0.9375rem] text-slate">Aucune actualité pour le moment.</li>}
          </ul>
        </section>

        <section className={panelClass}>
          <div className="flex items-center justify-between border-b border-rule px-5 py-4">
            <h2 className="font-sans text-[1rem] font-semibold">Derniers messages</h2>
            <Link href="/admin/messages" className="link text-[0.875rem]">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-rule">
            {(recentMessages.data ?? []).map((m) => (
              <li key={m.id}>
                <Link href={`/admin/messages#m-${m.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-paper">
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9375rem]">{m.name}</span>
                    <span className="text-[0.8125rem] text-slate">
                      {m.subject ?? "Message"} · {formatDate(m.created_at, "fr")}
                    </span>
                  </span>
                  {m.status === "new" && <Badge tone="blue">Nouveau</Badge>}
                </Link>
              </li>
            ))}
            {(recentMessages.data ?? []).length === 0 && <li className="px-5 py-6 text-[0.9375rem] text-slate">Aucun message reçu pour le moment.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
