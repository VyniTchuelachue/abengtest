import { getArticles, getPracticeAreas, getTeam } from "@/lib/data";
import { firmEmail, getDictionary, phones } from "@/lib/dictionaries";
import { href, siteUrl } from "@/lib/routes";

// Plain-text guide to the site for AI assistants and crawlers (llmstxt.org), built from live data.
export const revalidate = 3600;

export async function GET() {
  const [team, areas, articles] = await Promise.all([getTeam("en"), getPracticeAreas("en"), getArticles("en", { limit: 10 })]);
  const en = getDictionary("en");
  const fr = getDictionary("fr");
  const link = (label: string, path: string, note?: string) => `- [${label}](${siteUrl}${path})${note ? `: ${note}` : ""}`;

  const body = [
    "# The Abeng Law Firm",
    "",
    `> ${en.meta.defaultDescription}`,
    "",
    `Business law firm in Douala, Cameroon, founded in 1998 by Barrister Roland Abeng. The site is published in English (/en) and French (/fr). ${en.address.lines.join(", ")}. Telephone ${phones[0]}. Email ${firmEmail}.`,
    "",
    "## Main pages",
    link(en.firmPage.title, href("en", "firm"), "history, approach, rankings, awards, memberships and acknowledged contributions"),
    link(en.practicePage.title, href("en", "practice")),
    link(en.teamPage.title, href("en", "team")),
    link(en.insightsPage.title, href("en", "insights")),
    link(en.careersPage.title, href("en", "careers")),
    link(en.contactPage.title, href("en", "contact")),
    link(`${fr.nav.homeLabel} (français)`, href("fr")),
    "",
    "## Practice areas",
    ...areas.map((a) => link(a.title, href("en", "practice", a.slug), a.summary)),
    "",
    "## People",
    ...team.map((m) => link(m.name, href("en", "team", m.slug), m.title)),
    ...(articles.length ? ["", "## News", ...articles.map((a) => link(a.title, href("en", "insights", a.slug), a.publishedAt.slice(0, 10)))] : []),
    "",
    "## Optional",
    link("Sitemap", "/sitemap.xml"),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
