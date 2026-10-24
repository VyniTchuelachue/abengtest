import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, isLocale } from "./lib/routes";

const PUBLIC_ADMIN_PATHS = ["/admin/connexion", "/admin/mot-de-passe-oublie", "/admin/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  // Public site: every page lives under /en or /fr.
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const preferred = request.headers.get("accept-language")?.toLowerCase().startsWith("fr") ? "fr" : defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
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

// Files served as they are, without the locale redirect (google*.html: Search Console verification).
export const config = {
  matcher: ["/((?!_next/|api/|images/|icon.png|apple-icon.png|favicon.ico|robots.txt|sitemap.xml|opengraph-image|google[a-z0-9]+\\.html).*)"],
};
