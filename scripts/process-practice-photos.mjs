// Builds the hover photos of the practice-area cards from generated images.
// Usage: node scripts/process-practice-photos.mjs <folder> <suffix>
// The folder holds one JPEG per area, named by the area's English slug (e.g.
// banking-finance.jpg). Output: public/images/practice/<slug>-<suffix>.jpg.
// The current set (suffix v2) was generated with Google Flow (Nano Banana 2.1)
// on 31 Oct 2026, from prompts describing Cameroonian settings and people;
// none of the people shown is a real member of the firm or a real client.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const [src, suffix] = process.argv.slice(2);
if (!src || !suffix) throw new Error("Pass the folder of photos and a version suffix, e.g. v2.");
const out = path.resolve("public/images/practice");
fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(src).filter((f) => /\.jpe?g$/i.test(f))) {
  const name = `${path.parse(file).name}-${suffix}.jpg`;
  const info = await sharp(path.join(src, file))
    .resize({ width: 1200, height: 900, fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(out, name));
  console.log(`${name} ${info.width}x${info.height}`);
}
