import type { Locale } from "./routes";

/**
 * Rankings, awards, memberships and acknowledgments of contributions, kept apart
 * by their nature as the firm asked. Wording follows what is printed on each
 * certificate; the firm will confirm the final selection and text.
 */
type Text = Record<Locale, string>;

export type RecognitionKind = "ranking" | "award" | "membership" | "contribution";
export const recognitionKinds: RecognitionKind[] = ["ranking", "award", "membership", "contribution"];

type Entry = {
  id: string;
  kind: RecognitionKind;
  name: Text;
  /** Firm or person recognised; omitted when the item names neither (e.g. a programme award). */
  recipient?: "firm" | "abeng-roland";
  year?: string;
  detail?: Text;
  /** Photos of the award or certificate (scripts/process-recognitions.mjs), with the year printed on each. */
  photos?: { file: string; year?: string }[];
};

const recipients: Record<NonNullable<Entry["recipient"]>, string> = {
  firm: "The Abeng Law Firm",
  "abeng-roland": "Roland Abeng",
};

const entries: Entry[] = [
  {
    id: "chambers-global-firm",
    photos: [{ file: "chambers-global-2024", year: "2024" }, { file: "chambers-global-2022", year: "2022" }],
    kind: "ranking",
    name: { en: "Chambers Global", fr: "Chambers Global" },
    recipient: "firm",
    year: "2026",
    detail: {
      en: "Ranked in General Business Law: Cameroon. Also ranked in the 2022 and 2024 editions.",
      fr: "Classé en « General Business Law: Cameroon ». Également classé dans les éditions 2022 et 2024.",
    },
  },
  {
    id: "chambers-global-abeng",
    photos: [{ file: "chambers-global-2019", year: "2019" }],
    kind: "ranking",
    name: { en: "Chambers Global", fr: "Chambers Global" },
    recipient: "abeng-roland",
    year: "2026",
    detail: {
      en: "Individually ranked in General Business Law: Cameroon. Also ranked in the 2019 edition.",
      fr: "Classé à titre individuel en « General Business Law: Cameroon ». Également classé dans l'édition 2019.",
    },
  },
  {
    id: "iflr1000",
    photos: [{ file: "iflr1000-2021-22", year: "2021/22" }],
    kind: "ranking",
    name: { en: "IFLR1000", fr: "IFLR1000" },
    recipient: "firm",
    year: "2021/22",
    detail: {
      en: "Recommended firm, Financial and Corporate, in the 31st edition.",
      fr: "Cabinet recommandé, Financial and Corporate, dans la 31e édition.",
    },
  },
  {
    id: "uja-cameroon",
    photos: [{ file: "uja-cameroon" }],
    kind: "award",
    name: { en: "Cameroon Union of Young Lawyers (UJA)", fr: "Union des jeunes avocats du Cameroun (UJA)" },
    recipient: "abeng-roland",
    detail: {
      en: "Distinction in recognition of his continuous support and contributions to the professional development of young lawyers.",
      fr: "Distinction en reconnaissance de son soutien constant et de sa contribution à la formation professionnelle des jeunes avocats.",
    },
  },
  {
    id: "aba-best-stand-alone-program",
    photos: [{ file: "aba-international-law-award-2008-09", year: "2008–2009" }],
    kind: "award",
    name: { en: "American Bar Association, Section of International Law", fr: "American Bar Association, Section of International Law" },
    year: "2008–2009",
    detail: {
      en: "Best Stand-Alone Program Award, conferred on the programme “Good Governance in Cameroon”.",
      fr: "Best Stand-Alone Program Award, décerné au programme « Good Governance in Cameroon ».",
    },
  },
  {
    id: "taglaw",
    photos: [{ file: "taglaw-15-years" }],
    kind: "membership",
    name: { en: "TAGLaw", fr: "TAGLaw" },
    recipient: "firm",
    detail: {
      en: "Member of TAGLaw, an international alliance of independent law firms.",
      fr: "Membre de TAGLaw, alliance internationale de cabinets d'avocats indépendants.",
    },
  },
  {
    id: "trace",
    kind: "membership",
    name: { en: "TRACE", fr: "TRACE" },
    recipient: "firm",
    detail: {
      en: "Member of TRACE, an international anti-bribery compliance network.",
      fr: "Membre de TRACE, réseau international de conformité anticorruption.",
    },
  },
  {
    id: "miranda-alliance",
    kind: "membership",
    name: { en: "Miranda Alliance", fr: "Miranda Alliance" },
    recipient: "firm",
  },
  {
    id: "world-bank-doing-business-2011",
    photos: [{ file: "world-bank-doing-business-2011", year: "2011" }],
    kind: "contribution",
    name: { en: "The World Bank", fr: "Banque mondiale" },
    recipient: "abeng-roland",
    year: "2011",
    detail: {
      en: "Certificate of Appreciation for his contribution to Doing Business 2011: Making a Difference for Entrepreneurs.",
      fr: "Certificat de reconnaissance pour sa contribution au rapport Doing Business 2011 : Making a Difference for Entrepreneurs.",
    },
  },
  {
    id: "world-justice-project-2012-13",
    photos: [{ file: "world-justice-project-2012-13", year: "2012–2013" }],
    kind: "contribution",
    name: { en: "The World Justice Project", fr: "World Justice Project" },
    recipient: "abeng-roland",
    year: "2012–2013",
    detail: {
      en: "Certificate of Contribution to the World Justice Project Rule of Law Index 2012–2013 report.",
      fr: "Certificat de contribution au rapport Rule of Law Index 2012–2013 du World Justice Project.",
    },
  },
];

/** One photo, ready for the page: `label` names the item and its year, e.g. "Chambers Global 2024". */
export type RecognitionPhoto = { src: string; label: string; recipient?: string; year?: string };

export type Recognition = {
  id: string;
  kind: RecognitionKind;
  name: string;
  recipient?: string;
  recipientKey?: Entry["recipient"];
  year?: string;
  detail?: string;
  photos: RecognitionPhoto[];
};

export function getRecognitions(locale: Locale, kind?: RecognitionKind): Recognition[] {
  return entries
    .filter((e) => !kind || e.kind === kind)
    .map((e) => {
      const recipient = e.recipient && recipients[e.recipient];
      return {
        id: e.id,
        kind: e.kind,
        name: e.name[locale],
        recipient,
        recipientKey: e.recipient,
        year: e.year,
        detail: e.detail?.[locale],
        photos: (e.photos ?? []).map((p) => ({
          src: `/images/recognitions/${p.file}.jpg`,
          label: `${e.name[locale]}${p.year ? ` ${p.year}` : ""}`,
          recipient,
          year: p.year,
        })),
      };
    });
}
