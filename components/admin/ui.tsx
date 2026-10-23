import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Same field, card and accent treatment as the public site (see app/globals.css).
export const labelClass = "block text-[0.9375rem] font-medium text-ink";
export const inputClass =
  "mt-1.5 block w-full rounded-xl border border-rule bg-stone/60 px-4 py-2.5 text-[0.9375rem] text-ink transition-colors placeholder:text-slate/70 hover:border-slate focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-danger disabled:bg-stone";
export const hintClass = "mt-1.5 block text-[0.8125rem] font-normal leading-snug text-slate";
export const panelClass = "rounded-[1.25rem] border border-rule bg-white";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-6">
      <div>
        {back && (
          <Link href={back.href} className="more mb-4 text-[0.875rem]">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {back.label}
          </Link>
        )}
        <h1 className="heading text-[clamp(1.75rem,1.5rem+1vw,2.25rem)]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

const badgeTones = {
  green: "bg-[#e3efe8] text-success",
  amber: "bg-[#f4ead8] text-warning",
  grey: "bg-stone text-ink-soft",
  red: "bg-[#f4e1e1] text-danger",
  blue: "bg-[#e1e8f1] text-ink",
  gold: "bg-gold text-ink",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${badgeTones[tone]}`}>{children}</span>;
}

export const memberStatus = {
  published: { label: "Publié", tone: "green" },
  hidden: { label: "Masqué", tone: "amber" },
  inactive: { label: "Inactif", tone: "grey" },
} as const;

export const articleStatus = {
  published: { label: "Publié", tone: "green" },
  scheduled: { label: "Programmé", tone: "blue" },
  draft: { label: "Brouillon", tone: "amber" },
} as const;

export const groupLabels = {
  partner: "Associé gérant",
  senior_associate: "Associés seniors",
  lawyer: "Associés",
  paralegal: "Juristes",
  administration: "Équipe administrative",
} as const;

export function Notice({ tone, children }: { tone: "success" | "error" | "info"; children: React.ReactNode }) {
  const styles = {
    success: "border-success/30 bg-[#eef6f1] text-success",
    error: "border-danger/30 bg-[#fbefef] text-danger",
    info: "border-gold/40 bg-gold-light text-ink",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`mb-6 rounded-xl border px-4 py-3 text-[0.9375rem] ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className={`${panelClass} px-8 py-14 text-center`}>
      <p className="heading text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-soft">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
