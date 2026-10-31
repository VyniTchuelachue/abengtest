// Downloads and prepares the hover photos of the practice-area and approach cards.
// Usage: node scripts/fetch-stock-photos.mjs
// All photos are from Unsplash under the Unsplash License (free for commercial use,
// no attribution required); none is an Unsplash+ photo. Each entry gives the output
// file and the photo's image ID on images.unsplash.com.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const photos = [
  // Practice areas: public/images/practice/<English slug>.jpg
  ["practice/corporate-commercial-ohada", "1573164574572-cb89e39749b4"], // boardroom meeting
  ["practice/mergers-acquisitions", "1739298061707-cefee19941b7"], // negotiation at a boardroom table
  ["practice/banking-finance", "1763454242946-948f870d730c"], // modern glass tower
  ["practice/energy-infrastructure", "1745725427994-30530297f537"], // Third Mainland Bridge, Lagos
  ["practice/real-estate-construction", "1709715987498-1e5f745b2c72"], // tower under construction
  ["practice/tax-customs-exchange", "1790597546345-c2e4c8abbd90"], // shipping containers
  ["practice/regulatory-public-law", "1594538756542-8c88bda491c5"], // Lagos skyline
  ["practice/compliance-investigations", "1573167710701-35950a41e251"], // review meeting
  ["practice/data-technology", "1573164574511-73c773193279"], // office team with laptops
  ["practice/employment-immigration", "1739302750695-31a8c978c770"], // team in a bright office
  ["practice/intellectual-property", "1655720357872-ce227e4164ba"], // creative professionals
  ["practice/environment-esg", "1659944975073-453265ccf3a6"], // Avenue of the Baobabs
  ["practice/litigation-arbitration", "1637684666772-1f215bfd0f5d"], // lawyer in a suit
  ["practice/debt-recovery-insolvency", "1686628269259-84b867e8c036"], // professional with documents
  ["practice/maritime-transport", "1765475467677-579353b25ce0"], // Lagos waterfront
  ["practice/private-client", "1647616927583-1d44a79a38a5"], // family portrait
  // Firm page, "How we work": public/images/approach/<n>.jpg in the order of the boxes
  ["approach/1", "1589829545856-d10d557cf95f"], // Lady Justice
  ["approach/2", "1610652492500-ded49ceeb378"], // man in a dark suit
  ["approach/3", "1744907895363-d351aa6019ef"], // aerial view of Lagos business district
  ["approach/4", "1648023200201-8fcede127835"], // Lekki-Ikoyi bridge at night
];

const root = path.resolve("public/images");
for (const [name, id] of photos) {
  const res = await fetch(`https://images.unsplash.com/photo-${id}?w=1600&q=85&fm=jpg`);
  if (!res.ok) throw new Error(`${name}: ${res.status}`);
  const out = path.join(root, `${name}.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const info = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: 1200, height: 900, fit: "cover", position: "attention" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log(`${name}.jpg ${info.width}x${info.height}`);
}
