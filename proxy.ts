import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { browserLocale, defaultLocale, isLocale, languageCookie, localizedSegments, switchLocalePath, type Locale } from "./lib/routes";

const frenchSegments = new Set(localizedSegments.map((s) => s.fr));
const PUBLIC_ADMIN_PATHS = ["/admin/connexion", "/admin/mot-de-passe-oublie", "/admin/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  // Public site: every page lives under /en or /fr.
  const first = pathname.split("/")[1];
  const chosen = request.cookies.get(languageCookie)?.value;
  if (isLocale(first)) {
    // Someone arriving from outside the site (a search result, a shared link, a bookmark, the address bar) on a page
    // in the other language gets the same page in their language: the one they picked with the switch, otherwise their
    // browser's, so their phone does not machine-translate it. Links followed inside the site are left alone.
    const wanted = isLocale(chosen) ? chosen : browserLocale(request.headers.get("accept-language"));
    if (wanted && wanted !== first && isArrival(request)) return redirectTo(request, switchLocalePath(pathname, wanted));
    return NextResponse.next();
  }

  // A French page name without its prefix (/equipe, /cabinet…) is a French page; otherwise the visitor's choice, then
  // their browser's language.
  const preferred: Locale = frenchSegments.has(first)
    ? "fr"
    : isLocale(chosen)
      ? chosen
      : (browserLocale(request.headers.get("accept-language")) ?? defaultLocale);
  return redirectTo(request, `/${preferred}${pathname === "/" ? "" : pathname}`);
}

/** A page opened from outside the site, not a link followed or a request made from one of its pages. */
function isArrival(request: NextRequest) {
  const site = request.headers.get("sec-fetch-site");
  return request.method === "GET" && request.headers.get("sec-fetch-dest") === "document" && (site === "none" || site === "cross-site");
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * Refreshes the Supabase session cookie and turns away anyone without a
 * session before a dashboard page renders. Pages and server actions check
 * the staff role again on the server; this is only the first gate.
 */
async function guardAdmin(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Files served as they are, without the locale redirect (google*.html: Search Console verification;
// llms.txt: site guide for AI assistants).
export const config = {
  matcher: ["/((?!_next/|api/|images/|icon.png|apple-icon.png|favicon.ico|robots.txt|sitemap.xml|llms.txt|opengraph-image|google[a-z0-9]+\\.html).*)"],
};
