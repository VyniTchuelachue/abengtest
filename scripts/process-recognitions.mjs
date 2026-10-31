// Builds the web versions of the award, certificate and ranking photos.
// Usage: node scripts/process-recognitions.mjs "<ASSETS dir>/Edited Awards, Certificates and Rankings"
// Each edited PNG (already cropped and cleaned) is resized and written as JPEG
// to public/images/recognitions under the same name.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const src = process.argv[2];
if (!src) throw new Error("Pass the edited awards folder path.");
const out = path.resolve("public/images/recognitions");
fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(src).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
  const name = path.parse(file).name;
  const info = await sharp(path.join(src, file))
    .flatten({ background: "#ffffff" })
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(out, `${name}.jpg`));
  console.log(`${name}.jpg ${info.width}x${info.height}`);
}
