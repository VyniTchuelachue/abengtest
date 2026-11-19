import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { retainUntil } from "@/lib/retention";

/**
 * Everything the website holds about one enquiry or application, as a JSON file: for access and
 * portability requests (privacy notice, section 12). The CV itself is downloaded separately.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse(null, { status: 404 });
  const { data: m } = await supabase.from("contact_messages").select("*").eq("id", id.data).maybeSingle();
  if (!m) return new NextResponse(null, { status: 404 });
  const record = {
    type: m.kind,
    received: m.created_at,
    name: m.name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message,
    language: m.locale,
    consent: m.consent_at ? { given: m.consent_at, purpose: m.consent_purpose, privacyNoticeVersion: m.consent_notice_version } : null,
    cv: m.cv_path ? { fileName: m.cv_name, sizeBytes: m.cv_size } : null,
    closed: m.closed_at,
    deletionDue: retainUntil(m)?.toISOString() ?? null,
  };
  const safe = m.email.replace(/[^a-z0-9]+/gi, "-").slice(0, 60);
  return new NextResponse(JSON.stringify(record, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="abeng-${m.kind}-${safe}-${m.created_at.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
