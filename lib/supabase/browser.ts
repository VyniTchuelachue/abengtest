import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser client for the dashboard (sign-in and direct image uploads). */
export function browserClient() {
  client ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return client;
}
