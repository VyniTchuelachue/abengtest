import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export type CacheTag = "team" | "practice" | "articles" | "categories";

/** Seconds before cached public content is refreshed even without an edit. */
const REVALIDATE = 3600;

/**
 * Anonymous, cookie-free client for public pages. Responses go through the
 * Next.js data cache under the given tags, so the dashboard can expire them
 * the moment content changes (see lib/revalidate.ts).
 */
export function publicClient(tags: CacheTag[]) {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: REVALIDATE, tags } }),
    },
  });
}

/** Anonymous client without caching, for writes such as contact messages. */
export function anonClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
