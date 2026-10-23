import "server-only";
import { cookies, headers } from "next/headers";
import { ADMIN_LOCALE_COOKIE, isAdminLocale, translator, type AdminLocale } from ".";

/** The language chosen with the dashboard switch; otherwise the browser's, French by default. */
export async function getAdminLocale(): Promise<AdminLocale> {
  const chosen = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  if (isAdminLocale(chosen)) return chosen;
  const accept = (await headers()).get("accept-language")?.toLowerCase() ?? "";
  return accept.startsWith("en") ? "en" : "fr";
}

export async function getT() {
  return translator(await getAdminLocale());
}

/** Messages that end with a variable part (an email, a database error). */
const prefixed = ["Enregistrement impossible : ", "Les expertises n'ont pas pu être enregistrées : ", "Invitation impossible : ", "Accès non enregistré : ", "Invitation envoyée à "];

/** Puts a server action's message and field errors into the dashboard language. */
export async function localized<R extends { message?: string; fieldErrors?: Record<string, string> }>(result: R): Promise<R> {
  const t = await getT();
  const one = (text: string) => {
    const prefix = prefixed.find((p) => text.startsWith(p));
    return prefix ? t(`${prefix}{detail}`, { detail: text.slice(prefix.length) }) : t(text);
  };
  return {
    ...result,
    message: result.message ? one(result.message) : result.message,
    fieldErrors: result.fieldErrors ? Object.fromEntries(Object.entries(result.fieldErrors).map(([k, v]) => [k, one(v)])) : result.fieldErrors,
  };
}
