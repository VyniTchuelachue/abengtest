// Builds the web versions of the studio portraits (4:5).
// Usage: node scripts/process-portraits.mjs "<ASSETS dir>" <suffix>
// Reads <slug>.png or <slug>.jpg for every team member found in the folder and writes
// public/images/team/<slug>-<suffix>.jpg (served with the site) plus
// supabase/seed/portraits/<slug>.jpg (used by scripts/seed.mjs). A new suffix per
// shoot gives each version its own URL, so no cache keeps showing the old one.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const [assets, suffix] = process.argv.slice(2);
if (!assets || !suffix) throw new Error("Pass the ASSETS folder path and a version suffix, e.g. 2026-10-29.");
const team = JSON.parse(fs.readFileSync("supabase/seed/team.json", "utf8")).map((m) => m.slug);
const out = path.resolve("public/images/team");
fs.mkdirSync(out, { recursive: true });

for (const slug of team) {
  const file = [".png", ".jpg"].map((ext) => path.join(assets, slug + ext)).find((f) => fs.existsSync(f));
  if (!file) continue;
  const image = sharp(file)
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({ width: 1200, height: 1500, fit: "cover", position: "top", withoutEnlargement: true });
  const buffer = await image.jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(out, `${slug}-${suffix}.jpg`), buffer);
  fs.writeFileSync(path.resolve("supabase/seed/portraits", `${slug}.jpg`), buffer);
  const { width, height } = await sharp(buffer).metadata();
  console.log(`${slug}-${suffix}.jpg ${width}x${height}`);
}
