import "server-only";
import { secretClient } from "./supabase/server";

/**
 * Retention periods of the privacy notice (19 November 2026), applied to the website's copies:
 * - an enquiry is kept while it is handled and for at most six months after it is closed;
 * - an application is kept for at most six months after the recruitment decision (recorded by closing
 *   it), or six months after receipt when no decision has been recorded (unsolicited applications).
 * Copies in the firm's mailbox are outside the website and are deleted by the firm itself.
 */
export const RETENTION_MONTHS = 6;

type Retained = { kind: string; created_at: string; closed_at: string | null };

const addMonths = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
};

/** Date after which the website copy is deleted; null while an enquiry is still open. */
export function retainUntil(m: Retained): Date | null {
  if (m.kind === "application") return addMonths(m.closed_at ?? m.created_at, RETENTION_MONTHS);
  return m.closed_at ? addMonths(m.closed_at, RETENTION_MONTHS) : null;
}

/** Records whose retention period ends within `days` days (or has ended). */
export function dueWithin(m: Retained, days: number, now = new Date()): boolean {
  const end = retainUntil(m);
  return !!end && end.getTime() - now.getTime() <= days * 86_400_000;
}

/**
 * Deletes the website copies whose retention period has ended (the record and its CV), and CV uploads
 * abandoned before an application was sent (pending/, older than a day). Runs daily from the scheduled
 * job and whenever the Messages page of the dashboard is opened.
 */
export async function purgeExpired(): Promise<{ records: number; files: number } | null> {
  const supabase = secretClient();
  if (!supabase) return null;
  const now = new Date();
  const cutoff = addMonths(now.toISOString(), -RETENTION_MONTHS).toISOString();

  const { data: rows, error } = await supabase
    .from("contact_messages")
    .select("id, kind, created_at, closed_at, cv_path")
    .or(`and(kind.eq.application,closed_at.lt.${cutoff}),and(kind.eq.application,closed_at.is.null,created_at.lt.${cutoff}),and(kind.eq.enquiry,closed_at.lt.${cutoff})`);
  if (error) {
    console.error("retention query failed", error.message);
    return null;
  }
  const expired = (rows ?? []).filter((r) => {
    const end = retainUntil(r);
    return end && end <= now;
  });

  const files = expired.map((r) => r.cv_path).filter((p): p is string => !!p);
  const { data: pending } = await supabase.storage.from("applications").list("pending", { limit: 1000 });
  const dayAgo = now.getTime() - 86_400_000;
  const stale = (pending ?? []).filter((o) => o.created_at && new Date(o.created_at).getTime() < dayAgo).map((o) => `pending/${o.name}`);

  if (files.length + stale.length) {
    const { error: removeError } = await supabase.storage.from("applications").remove([...files, ...stale]);
    if (removeError) {
      console.error("retention file removal failed", removeError.message);
      return null;
    }
  }
  if (expired.length) {
    const { error: deleteError } = await supabase.from("contact_messages").delete().in("id", expired.map((r) => r.id));
    if (deleteError) {
      console.error("retention deletion failed", deleteError.message);
      return null;
    }
  }
  return { records: expired.length, files: files.length + stale.length };
}
