// Builds the web versions of the firm's institutional photographs.
// Usage: node scripts/process-assets.mjs "<ASSETS dir>"
// Writes optimised files to public/images. Lawyer portraits are handled
// separately (they live in Supabase Storage so the firm can replace them).
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const assets = process.argv[2];
if (!assets) throw new Error("Pass the ASSETS folder path.");
const out = path.resolve("public/images");
fs.mkdirSync(out, { recursive: true });

const jpeg = { quality: 84, mozjpeg: true };

// Team photograph (the photographer's edit already removes the neighbouring
// firm's door plate). Kept at 2400px wide: it is shown full-bleed.
await sharp(path.join(assets, "Team picture.jpg"))
  .rotate()
  .resize({ width: 2400, withoutEnlargement: true })
  .jpeg(jpeg)
  .toFile(path.join(out, "team-v2.jpg"));
console.log("team-v2.jpg");

// Managing Partner in his office (environmental portrait).
await sharp(path.join(assets, "Barrister Abeng.jpg"))
  .rotate()
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg(jpeg)
  .toFile(path.join(out, "roland-abeng-office-v2.jpg"));
console.log("roland-abeng-office-v2.jpg");

// Crest: trim the transparent margin, then export a web logo and icons.
const crest = await sharp(path.join(assets, "Logo.png")).trim().png().toBuffer();
await sharp(crest).resize(240, 240, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ palette: true, quality: 92 }).toFile(path.join(out, "crest.png"));
await sharp(crest).resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ palette: true, quality: 90 }).toFile(path.resolve("app/icon.png"));
await sharp(crest)
  .resize(160, 160, { fit: "contain", background: "#ffffff" })
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: "#ffffff" })
  .png()
  .toFile(path.resolve("app/apple-icon.png"));
console.log("crest + icons");
