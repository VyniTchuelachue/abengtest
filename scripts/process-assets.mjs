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

// Team photograph. The brass plate on the door behind the group belongs to
// another occupant of the building, so it is painted out by interpolating the
// plain door panel above and below it, column by column.
{
  const src = path.join(assets, "Team picture.jpg");
  const { data, info } = await sharp(src).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width, channels } = info;
  const box = { x0: 958, x1: 1162, y0: 50, y1: 116 };
  const px = (x, y, c) => data[(y * width + x) * channels + c];
  for (let x = box.x0; x <= box.x1; x++) {
    for (let y = box.y0; y <= box.y1; y++) {
      const t = (y - box.y0) / (box.y1 - box.y0);
      for (let c = 0; c < 3; c++) {
        const above = px(x, box.y0 - 2, c);
        const below = px(x, box.y1 + 2, c);
        const grain = (Math.random() - 0.5) * 2;
        data[(y * width + x) * channels + c] = Math.round(above * (1 - t) + below * t + grain);
      }
    }
  }
  await sharp(data, { raw: info }).jpeg(jpeg).toFile(path.join(out, "team.jpg"));
  console.log("team.jpg");
}

// Managing Partner in his office (environmental portrait).
await sharp(path.join(assets, "Barrister Abeng.jpg"))
  .rotate()
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg(jpeg)
  .toFile(path.join(out, "roland-abeng-office.jpg"));
console.log("roland-abeng-office.jpg");

// International meetings.
await sharp(path.join(assets, "intl-africa-strategy.png"))
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg(jpeg)
  .toFile(path.join(out, "africa-regional-meeting.jpg"));
await sharp(path.join(assets, "intl-tag-alliances.jpeg"))
  .jpeg(jpeg)
  .toFile(path.join(out, "tag-alliances-meeting.jpg"));
console.log("international photos");

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
