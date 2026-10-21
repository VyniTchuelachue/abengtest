import "server-only";
import { updateTag } from "next/cache";
import type { CacheTag } from "./supabase/public";

/** Expire public pages that read these tags; visitors get fresh content on the next request. */
export function refreshPublic(...tags: CacheTag[]) {
  for (const tag of new Set(tags)) updateTag(tag);
}
