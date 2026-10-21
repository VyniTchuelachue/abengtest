import { officeCoordinates, phones } from "./dictionaries";
import { href, siteUrl, type Locale } from "./routes";
import type { Article, Member } from "./data";

const firmId = `${siteUrl}/#firm`;

export function legalServiceSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": firmId,
    name: "The Abeng Law Firm",
    url: `${siteUrl}${href(locale)}`,
    logo: `${siteUrl}/images/crest.png`,
    image: `${siteUrl}/images/team.jpg`,
    foundingDate: "1998",
    founder: { "@type": "Person", name: "Roland Abeng" },
    telephone: phones[0],
    areaServed: ["Cameroon", "Central Africa"],
    knowsLanguage: ["en", "fr"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Immeuble 4 Étages, Apt. 300, Rue Koloko, Bonapriso",
      addressLocality: "Douala",
      addressRegion: "Littoral",
      postOfficeBoxNumber: "4155",
      addressCountry: "CM",
    },
    geo: { "@type": "GeoCoordinates", latitude: officeCoordinates.lat, longitude: officeCoordinates.lng },
    memberOf: [
      { "@type": "Organization", name: "TAGLaw" },
      { "@type": "Organization", name: "TRACE" },
    ],
  };
}

export function personSchema(member: Member, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.title,
    url: `${siteUrl}${href(locale, "team", member.slug)}`,
    image: member.photo ?? undefined,
    worksFor: { "@id": firmId },
    knowsLanguage: member.languages.length ? member.languages : undefined,
    knowsAbout: member.focusAreas.length ? member.focusAreas : undefined,
    sameAs: member.linkedin ? [member.linkedin] : undefined,
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
      ? { "@type": "Person", name: article.author.name, url: `${siteUrl}${href(locale, "team", article.author.slug)}` }
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
