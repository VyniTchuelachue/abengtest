// Downloads and prepares the stock hover photos of the firm page's "How we work" boxes (the first two;
// the other two, 3-v2 and 4-v2, are generated images of Douala and the Wouri bridge).
// (The practice-area photos are generated images: see scripts/process-practice-photos.mjs.)
// Usage: node scripts/fetch-stock-photos.mjs
// All photos are from Unsplash under the Unsplash License (free for commercial use,
// no attribution required); none is an Unsplash+ photo. Each entry gives the output
// file and the photo's image ID on images.unsplash.com.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const photos = [
  // Firm page, "How we work": public/images/approach/<n>.jpg in the order of the boxes
  ["approach/1", "1589829545856-d10d557cf95f"], // Lady Justice
  ["approach/2", "1610652492500-ded49ceeb378"], // man in a dark suit
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
