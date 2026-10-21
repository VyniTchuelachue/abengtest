import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "./supabase/server";
import type { StaffRecord } from "./database.types";

export type Session = {
  supabase: Awaited<ReturnType<typeof serverClient>>;
  userId: string;
  email: string;
  staff: StaffRecord;
};

/** The signed-in dashboard user, or null when signed out or not on the staff list. */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: staff } = await supabase.from("staff").select("*").eq("user_id", user.id).maybeSingle();
  if (!staff) return null;
  return { supabase, userId: user.id, email: user.email ?? staff.email, staff };
});

/** Use at the top of every dashboard page and server action. */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/connexion?erreur=acces");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireStaff();
  if (session.staff.role !== "admin") redirect("/admin?erreur=droits");
  return session;
}

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};
