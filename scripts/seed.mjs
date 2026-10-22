// Seeds the content tables through the public API, signed in as an
// administrator, so every write goes through Row Level Security.
// Usage: node --env-file=.env.local scripts/seed.mjs <portraitsDir>
// Admin credentials are read from ADMIN_ACCESS.local.md (git-ignored).
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const portraitsDir = process.argv[2];
const access = fs.readFileSync("ADMIN_ACCESS.local.md", "utf8");
const email = access.match(/Email: (\S+)/)[1];
const password = access.match(/Temporary password: (\S+)/)[1];

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

function check(label, { error }) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) throw authError;

// Practice areas -------------------------------------------------------------
const areas = JSON.parse(fs.readFileSync("supabase/seed/practice-areas.json", "utf8"));
const groupOrder = {};
const areaRows = areas.map(({ members, ...a }) => {
  groupOrder[a.group_key] = (groupOrder[a.group_key] ?? 0) + 10;
  return { ...a, sort_order: groupOrder[a.group_key] };
});
check("practice areas", await supabase.from("practice_areas").upsert(areaRows, { onConflict: "slug" }));
const { data: areaIds } = await supabase.from("practice_areas").select("id, slug");
const areaBySlug = Object.fromEntries(areaIds.map((a) => [a.slug, a.id]));
console.log(`practice areas: ${areaRows.length}`);

// Team members + portraits ------------------------------------------------------
const team = JSON.parse(fs.readFileSync("supabase/seed/team.json", "utf8"));
const featured = new Set(["abeng-roland", "jean-aime-kounga", "queenta-asibong", "mirabel-toko", "doly-azangue", "jean-patrick-musima"]);
for (const member of team) {
  let photo_path = null;
  const file = portraitsDir && path.join(portraitsDir, `${member.slug}.jpg`);
  if (file && fs.existsSync(file)) {
    photo_path = `team/${member.slug}.jpg`;
    check(
      `upload ${member.slug}`,
      await supabase.storage.from("media").upload(photo_path, fs.readFileSync(file), { contentType: "image/jpeg", upsert: true }),
    );
  }
  check(
    `member ${member.slug}`,
    await supabase.from("team_members").upsert(
      { ...member, status: "published", featured: featured.has(member.slug), photo_path, photo_position: "50% 20%" },
      { onConflict: "slug" },
    ),
  );
}
const { data: memberIds } = await supabase.from("team_members").select("id, slug");
const memberBySlug = Object.fromEntries(memberIds.map((m) => [m.slug, m.id]));
console.log(`team members: ${team.length}`);

const links = areas.flatMap((a) => a.members.map((slug) => ({ member_id: memberBySlug[slug], practice_area_id: areaBySlug[a.slug] })));
check("links", await supabase.from("team_member_practice_areas").upsert(links, { onConflict: "member_id,practice_area_id" }));
console.log(`practice links: ${links.length}`);

// Categories ---------------------------------------------------------------------
const categories = [
  { slug: "firm-news", name_en: "Firm news", name_fr: "Vie du cabinet", sort_order: 10 },
  { slug: "legal-updates", name_en: "Legal updates", name_fr: "Actualités juridiques", sort_order: 20 },
  { slug: "recognition", name_en: "Recognition", name_fr: "Distinctions", sort_order: 30 },
  { slug: "events", name_en: "Events", name_fr: "Événements", sort_order: 40 },
];
check("categories", await supabase.from("article_categories").upsert(categories, { onConflict: "slug" }));
const { data: cats } = await supabase.from("article_categories").select("id, slug");
const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

// Articles -----------------------------------------------------------------------
const cover = "articles/chambers-global-2026.jpg";
check(
  "upload cover",
  await supabase.storage
    .from("media")
    .upload(cover, fs.readFileSync("public/images/roland-abeng-office-v2.jpg"), { contentType: "image/jpeg", upsert: true }),
);

const articles = [
  {
    slug: "chambers-global-2026",
    status: "published",
    published_at: "2026-10-21T09:00:00Z",
    category_id: catBySlug.recognition,
    author_id: null,
    cover_path: cover,
    cover_alt_en: "Roland Abeng, Managing Partner, in his office",
    cover_alt_fr: "Roland Abeng, associé gérant, dans son bureau",
    title_en: "The Abeng Law Firm ranked in Chambers Global 2026",
    title_fr: "The Abeng Law Firm classé dans Chambers Global 2026",
    excerpt_en:
      "The firm is ranked in the General Business Law: Cameroon table of Chambers Global 2026, and Managing Partner Roland Abeng is individually ranked in the same practice area.",
    excerpt_fr:
      "Le cabinet figure dans le classement « General Business Law: Cameroon » de Chambers Global 2026, et l'associé gérant Roland Abeng y est classé à titre individuel.",
    body_en: [
      "<p>The Abeng Law Firm is ranked in Band 3 of the General Business Law: Cameroon table of <em>Chambers Global</em> 2026. Managing Partner Roland Abeng is individually ranked in Band 2 for General Business Law.</p>",
      "<p>Chambers and Partners publishes independent rankings of law firms and lawyers, based on research and interviews with clients and peers. Its <em>Chambers Global</em> guide covers leading practices in jurisdictions around the world.</p>",
      "<p>The ranking reflects the firm's work for businesses operating in Cameroon and the wider OHADA region, across corporate and commercial matters, banking and finance, regulatory questions and disputes.</p>",
      '<p>The full listing is available on the <a href="https://chambers.com/law-firm/the-abeng-law-firm-global-2:22621119">Chambers and Partners website</a>.</p>',
    ].join(""),
    body_fr: [
      "<p>The Abeng Law Firm est classé en Band 3 du classement « General Business Law: Cameroon » de <em>Chambers Global</em> 2026. L'associé gérant Roland Abeng est classé à titre individuel en Band 2 dans la même catégorie.</p>",
      "<p>Chambers and Partners publie des classements indépendants de cabinets et d'avocats, établis à partir de recherches et d'entretiens avec des clients et des confrères. Son guide <em>Chambers Global</em> couvre les pratiques de référence dans les juridictions du monde entier.</p>",
      "<p>Ce classement reflète le travail du cabinet auprès des entreprises opérant au Cameroun et dans l'espace OHADA, en droit des sociétés et des affaires, en banque et finance, en réglementation et en contentieux.</p>",
      '<p>Le classement complet est consultable sur le <a href="https://chambers.com/law-firm/the-abeng-law-firm-global-2:22621119">site de Chambers and Partners</a>.</p>',
    ].join(""),
  },
  {
    slug: "new-website",
    status: "draft",
    published_at: null,
    category_id: catBySlug["firm-news"],
    author_id: null,
    cover_path: null,
    title_en: "Our new website",
    title_fr: "Notre nouveau site internet",
    excerpt_en: "A new home for the firm's news, publications and team profiles.",
    excerpt_fr: "Un nouvel espace pour les actualités, les publications et les profils de l'équipe du cabinet.",
    body_en: "<p>Draft — to be completed by the firm before publication.</p>",
    body_fr: "<p>Brouillon — à compléter par le cabinet avant publication.</p>",
  },
];
check("articles", await supabase.from("articles").upsert(articles, { onConflict: "slug" }));
console.log(`articles: ${articles.length}`);

await supabase.auth.signOut();
