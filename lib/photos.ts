// Hover photos of the practice-area and approach cards (scripts/fetch-stock-photos.mjs).

/** Practice areas (by English slug) that have a photo in public/images/practice. */
const practicePhotos = new Set([
  "corporate-commercial-ohada",
  "mergers-acquisitions",
  "banking-finance",
  "energy-infrastructure",
  "real-estate-construction",
  "tax-customs-exchange",
  "regulatory-public-law",
  "compliance-investigations",
  "data-technology",
  "employment-immigration",
  "intellectual-property",
  "environment-esg",
  "litigation-arbitration",
  "debt-recovery-insolvency",
  "maritime-transport",
  "private-client",
]);

export function practicePhoto(slug: string): string | undefined {
  return practicePhotos.has(slug) ? `/images/practice/${slug}.jpg` : undefined;
}

/** Photos of the firm page's "How we work" boxes, in the order of the boxes. */
export const approachPhotos = ["/images/approach/1.jpg", "/images/approach/2.jpg", "/images/approach/3.jpg", "/images/approach/4.jpg"];
