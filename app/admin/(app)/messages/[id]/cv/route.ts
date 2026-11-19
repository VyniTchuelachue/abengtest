import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";

/** Opens an application's CV for a signed-in staff member, through a link valid for one minute. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireStaff();
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse(null, { status: 404 });
  const { data } = await supabase.from("contact_messages").select("cv_path, cv_name").eq("id", id.data).maybeSingle();
  if (!data?.cv_path) return new NextResponse(null, { status: 404 });
  const { data: link, error } = await supabase.storage.from("applications").createSignedUrl(data.cv_path, 60, { download: data.cv_name ?? true });
  if (error || !link) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(link.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
