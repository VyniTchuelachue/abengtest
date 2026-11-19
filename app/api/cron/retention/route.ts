import { NextResponse } from "next/server";
import { purgeExpired } from "@/lib/retention";

/**
 * Daily deletion of website records whose retention period has ended (vercel.json "crons").
 * Vercel calls it with "Authorization: Bearer <CRON_SECRET>"; any other caller is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await purgeExpired();
  return NextResponse.json({ ok: !!result, ...(result ?? {}) }, { status: result ? 200 : 500 });
}
