import type { Locale } from "./routes";

/**
 * Awards, rankings and certificates photographed at the firm (scripts/process-recognitions.mjs).
 * Wording follows what is printed on each item; nothing here is paraphrased into a claim
 * the item does not make.
 */
type Text = Record<Locale, string>;
type Entry = {
  id: string;
  image: string;
  width: number;
  height: number;
  /** "firm" for the firm's own rankings; otherwise the team member's slug. */
  holder: "firm" | "abeng-roland";
  issuer: Text;
  year?: string;
  title: Text;
};

const entries: Entry[] = [
  {
    id: "chambers-global-2024",
    image: "/images/recognitions/chambers-global-2024.jpg",
    width: 883,
    height: 1152,
    holder: "firm",
    issuer: { en: "Chambers Global", fr: "Chambers Global" },
    year: "2024",
    title: {
      en: "The Abeng Law Firm – Cameroon highly recommended as a ranked firm in General Business Law.",
      fr: "The Abeng Law Firm – Cameroun recommandé comme cabinet classé en droit général des affaires (General Business Law).",
    },
  },
  {
    id: "chambers-global-2022",
    image: "/images/recognitions/chambers-global-2022.jpg",
    width: 902,
    height: 1203,
    holder: "firm",
    issuer: { en: "Chambers Global", fr: "Chambers Global" },
    year: "2022",
    title: {
      en: "The firm highly recommended as a ranked firm in General Business Law.",
      fr: "Le cabinet recommandé comme cabinet classé en droit général des affaires (General Business Law).",
    },
  },
  {
    id: "iflr1000-2021-22",
    image: "/images/recognitions/iflr1000-2021-22.jpg",
    width: 960,
    height: 1126,
    holder: "firm",
    issuer: { en: "IFLR1000", fr: "IFLR1000" },
    year: "2021/22",
    title: {
      en: "Recommended firm in the 31st edition of IFLR1000, the guide to the world's leading financial law firms (Financial and Corporate).",
      fr: "Cabinet recommandé dans la 31e édition de l'IFLR1000, guide des principaux cabinets de droit financier (Financial and Corporate).",
    },
  },
  {
    id: "taglaw-15-years",
    image: "/images/recognitions/taglaw-15-years.jpg",
    width: 864,
    height: 1178,
    holder: "firm",
    issuer: { en: "TAGLaw", fr: "TAGLaw" },
    title: {
      en: "Membership Award – Distinction for 15 years of outstanding service to the worldwide alliance of independent law firms.",
      fr: "Membership Award – Distinction pour 15 ans de service remarquable au sein de l'alliance mondiale de cabinets indépendants.",
    },
  },
  {
    id: "chambers-global-2019",
    image: "/images/recognitions/chambers-global-2019.jpg",
    width: 922,
    height: 1229,
    holder: "abeng-roland",
    issuer: { en: "Chambers Global", fr: "Chambers Global" },
    year: "2019",
    title: {
      en: "Roland D. Abeng highly recommended as a ranked lawyer in General Business Law.",
      fr: "Roland D. Abeng recommandé comme avocat classé en droit général des affaires (General Business Law).",
    },
  },
  {
    id: "world-bank-doing-business-2011",
    image: "/images/recognitions/world-bank-doing-business-2011.jpg",
    width: 1050,
    height: 749,
    holder: "abeng-roland",
    issuer: { en: "The World Bank", fr: "Banque mondiale" },
    year: "2011",
    title: {
      en: "Certificate of Appreciation for his contribution to Doing Business 2011: Making a Difference for Entrepreneurs.",
      fr: "Certificat de reconnaissance pour sa contribution au rapport Doing Business 2011 : Making a Difference for Entrepreneurs.",
    },
  },
  {
    id: "world-justice-project-2012-13",
    image: "/images/recognitions/world-justice-project-2012-13.jpg",
    width: 998,
    height: 787,
    holder: "abeng-roland",
    issuer: { en: "The World Justice Project", fr: "World Justice Project" },
    year: "2012–2013",
    title: {
      en: "Certificate of Contribution to the World Justice Project Rule of Law Index 2012–2013 report.",
      fr: "Certificat de contribution au rapport Rule of Law Index 2012–2013 du World Justice Project.",
    },
  },
  {
    id: "aba-international-law-award-2008-09",
    image: "/images/recognitions/aba-international-law-award-2008-09.jpg",
    width: 922,
    height: 758,
    holder: "abeng-roland",
    issuer: { en: "American Bar Association – Section of International Law", fr: "American Bar Association – Section of International Law" },
    year: "2008–2009",
    title: {
      en: "Best Stand-Alone Program Award, conferred upon “Good Governance in Cameroon”.",
      fr: "Best Stand-Alone Program Award, décerné au programme « Good Governance in Cameroon ».",
    },
  },
  {
    id: "uja-cameroon",
    image: "/images/recognitions/uja-cameroon.jpg",
    width: 883,
    height: 1126,
    holder: "abeng-roland",
    issuer: { en: "Cameroon Union of Young Lawyers (UJA)", fr: "Union des jeunes avocats du Cameroun (UJA)" },
    title: {
      en: "Award in recognition of his continuous support and contributions to the professional development of young lawyers.",
      fr: "Distinction en reconnaissance de son soutien constant et de sa contribution à la formation professionnelle des jeunes avocats.",
    },
  },
  {
    id: "aba-dispute-resolution-2003-04",
    image: "/images/recognitions/aba-dispute-resolution-2003-04.jpg",
    width: 934,
    height: 739,
    holder: "abeng-roland",
    issuer: { en: "American Bar Association – Section of Dispute Resolution", fr: "American Bar Association – Section of Dispute Resolution" },
    year: "2003–2004",
    title: { en: "Certificate of Membership.", fr: "Certificat de membre." },
  },
  {
    id: "aba-business-law-section",
    image: "/images/recognitions/aba-business-law-section.jpg",
    width: 960,
    height: 778,
    holder: "abeng-roland",
    issuer: { en: "American Bar Association – Business Law Section", fr: "American Bar Association – Business Law Section" },
    title: { en: "Member of the Business Law Section.", fr: "Membre de la Business Law Section." },
  },
];

export type Recognition = { id: string; image: string; width: number; height: number; issuer: string; year?: string; title: string };

export function getRecognitions(holder: Entry["holder"], locale: Locale): Recognition[] {
  return entries
    .filter((e) => e.holder === holder)
    .map((e) => ({ id: e.id, image: e.image, width: e.width, height: e.height, issuer: e.issuer[locale], year: e.year, title: e.title[locale] }));
}
