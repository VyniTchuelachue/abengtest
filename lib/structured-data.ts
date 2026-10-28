import { chambersProfileUrl, firmEmail, getDictionary, officeCoordinates, phones } from "./dictionaries";
import { getRecognitions } from "./recognitions";
import { href, siteUrl, type Locale } from "./routes";
import type { Article, Member, PracticeArea } from "./data";

// Stable identifiers, shared by both languages, so search engines join the pieces into one firm.
const firmId = `${siteUrl}/#firm`;
const websiteId = `${siteUrl}/#website`;
const personId = (slug: string) => `${siteUrl}${href("en", "team", slug)}#person`;
const partnerSlug = "abeng-roland";

/** Rankings and awards held by the firm or a person, one line each (see lib/recognitions.ts). */
const awardLines = (holder: "firm" | "abeng-roland", locale: Locale) =>
  getRecognitions(locale)
    .filter((r) => (r.kind === "ranking" || r.kind === "award") && r.recipientKey === holder)
    .map((r) => `${r.name}${r.year ? ` ${r.year}` : ""}${r.detail ? `: ${r.detail}` : ""}`);

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: "The Abeng Law Firm",
    inLanguage: ["en", "fr"],
    publisher: { "@id": firmId },
  };
}

export function legalServiceSchema(locale: Locale, areas: PracticeArea[]) {
  const dict = getDictionary(locale);
  return {
    "@type": "LegalService",
    "@id": firmId,
    name: "The Abeng Law Firm",
    alternateName: "Abeng Law Firm",
    description: dict.meta.defaultDescription,
    url: `${siteUrl}${href(locale)}`,
    logo: `${siteUrl}/images/crest.png`,
    image: `${siteUrl}/images/team-v2.jpg`,
    foundingDate: "1998",
    founder: { "@type": "Person", "@id": personId(partnerSlug), name: "Roland Abeng" },
    telephone: phones[0],
    email: firmEmail,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: phones[0],
      email: firmEmail,
      availableLanguage: ["English", "French"],
      areaServed: "CM",
    },
    areaServed: [
      { "@type": "Country", name: "Cameroon" },
      { "@type": "Place", name: "Central Africa" },
    ],
    knowsLanguage: ["en", "fr"],
    knowsAbout: ["OHADA", "CEMAC", ...areas.map((a) => a.title)],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Immeuble 4 Étages, Apt. 300, Rue Koloko, Bonapriso",
      addressLocality: "Douala",
      addressRegion: "Littoral",
      postOfficeBoxNumber: "4155",
      addressCountry: "CM",
    },
    geo: { "@type": "GeoCoordinates", latitude: officeCoordinates.lat, longitude: officeCoordinates.lng },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${officeCoordinates.lat},${officeCoordinates.lng}`,
    sameAs: [chambersProfileUrl],
    award: awardLines("firm", locale),
    memberOf: getRecognitions(locale, "membership").map((r) => ({ "@type": "Organization", name: r.name })),
  };
}

/** Site-wide graph: the website and the firm it belongs to. */
export function siteSchema(locale: Locale, areas: PracticeArea[]) {
  return { "@context": "https://schema.org", "@graph": [websiteSchema(), legalServiceSchema(locale, areas)] };
}

export function personSchema(member: Member, locale: Locale) {
  const knowsAbout = member.focusAreas;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(member.slug),
    name: member.name,
    jobTitle: member.title,
    description: member.bio[0] || undefined,
    url: `${siteUrl}${href(locale, "team", member.slug)}`,
    image: member.profilePhoto ?? member.photo ?? undefined,
    email: member.email ?? undefined,
    worksFor: { "@id": firmId },
    knowsLanguage: member.languages.length ? member.languages : undefined,
    knowsAbout: knowsAbout.length ? knowsAbout : undefined,
    hasCredential: member.qualifications.length
      ? member.qualifications.map((q) => ({ "@type": "EducationalOccupationalCredential", name: q }))
      : undefined,
    award: member.slug === partnerSlug ? awardLines("abeng-roland", locale) : undefined,
    sameAs: member.linkedin ? [member.linkedin] : undefined,
  };
}

/** Team page: the people, in display order, each linked to their profile. */
export function teamListSchema(members: Member[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: members.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Person", "@id": personId(m.slug), name: m.name, jobTitle: m.title, url: `${siteUrl}${href(locale, "team", m.slug)}` },
    })),
  };
}

/** A practice area as a service the firm provides. */
export function serviceSchema(area: PracticeArea, locale: Locale) {
  const url = `${siteUrl}${href(locale, "practice", area.slug)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: area.title,
    serviceType: area.title,
    description: area.summary,
    url,
    provider: { "@id": firmId },
    areaServed: { "@type": "Country", name: "Cameroon" },
    availableLanguage: ["English", "French"],
  };
}

export function articleSchema(article: Article, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    inLanguage: article.lang,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: article.cover ? [article.cover] : undefined,
    mainEntityOfPage: `${siteUrl}${href(locale, "insights", article.slug)}`,
    author: article.author
      ? { "@type": "Person", "@id": personId(article.author.slug), name: article.author.name, url: `${siteUrl}${href(locale, "team", article.author.slug)}` }
      : { "@id": firmId },
    publisher: { "@id": firmId },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
