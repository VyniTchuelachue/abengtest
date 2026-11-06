/**
 * Rankings, awards, memberships and acknowledgments of contributions, kept apart
 * by their nature as the firm asked. The items themselves are edited in the
 * dashboard (table `recognitions`, read by getRecognitions in lib/data.ts).
 */
export type RecognitionKind = "ranking" | "award" | "membership" | "contribution";
export const recognitionKinds: RecognitionKind[] = ["ranking", "award", "membership", "contribution"];

/**
 * One photo, ready for the page: `label` names the item and its year, e.g. "Chambers Global 2024".
 * `cutout` is the same award without its background, for the home page's opening section; photos
 * without one show as they are.
 */
export type RecognitionPhoto = { src: string; cutout: string | null; label: string; recipient?: string; year?: string };

export type Recognition = {
  id: string;
  kind: RecognitionKind;
  name: string;
  recipient?: string;
  /** Set when the recipient is the firm or its managing partner, for the search-engine data. */
  recipientKey?: "firm" | "abeng-roland";
  year?: string;
  detail?: string;
  photos: RecognitionPhoto[];
};
