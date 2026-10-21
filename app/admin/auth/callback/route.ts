import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { serverClient } from "@/lib/supabase/server";

/** Completes email links (invitation, password reset) and opens the dashboard. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = url.searchParams.get("next") ?? "/admin";
  // Only ever continue inside the dashboard.
  const target = next.startsWith("/admin") ? next : "/admin";
  const supabase = await serverClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing token") };

  return NextResponse.redirect(new URL(error ? "/admin/connexion?erreur=lien" : target, url.origin));
}
