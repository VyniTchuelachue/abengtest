import { en } from "./en";

/**
 * Dashboard language. French is the source text: every UI string is written in
 * French and looked up in `en` when the dashboard is switched to English.
 * Placeholders use {name} and are filled from `vars`.
 */
export type AdminLocale = "fr" | "en";
export type Translate = (text: string, vars?: Record<string, string | number>) => string;

export const ADMIN_LOCALE_COOKIE = "admin_lang";

export function isAdminLocale(value: string | undefined | null): value is AdminLocale {
  return value === "fr" || value === "en";
}

export function translator(locale: AdminLocale): Translate {
  return (text, vars) => {
    const template = locale === "en" ? (en[text] ?? text) : text;
    return vars ? template.replace(/\{(\w+)\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m)) : template;
  };
}
