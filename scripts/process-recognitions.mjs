// Builds the web versions of the award and recognition photos.
// Usage: node scripts/process-recognitions.mjs "<ASSETS dir>/Recognitions"
// Each photo is turned upright, cropped to the award (percent box, after rotation)
// and written to public/images/recognitions.
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const src = process.argv[2];
if (!src) throw new Error("Pass the Recognitions folder path.");
const out = path.resolve("public/images/recognitions");
fs.mkdirSync(out, { recursive: true });

const photo = (time) => `WhatsApp Image 2026-10-23 at ${time}.jpeg`;
const items = [
  { file: photo("18.13.51 (2)"), name: "chambers-global-2024", crop: [4, 8, 92, 90] },
  { file: photo("18.13.49"), name: "chambers-global-2022", rotate: 180, crop: [3, 3, 94, 94] },
  { file: photo("18.13.50"), name: "iflr1000-2021-22", rotate: 90, crop: [0, 2, 100, 88] },
  { file: photo("18.13.48"), name: "taglaw-15-years", crop: [6, 4, 90, 92] },
  { file: photo("18.13.46"), name: "chambers-global-2019", crop: [2, 2, 96, 96] },
  { file: photo("18.13.49 (1)"), name: "world-bank-doing-business-2011", rotate: 270, crop: [14, 8, 82, 78] },
  { file: photo("18.13.50 (2)"), name: "world-justice-project-2012-13", crop: [10, 14, 78, 82] },
  { file: photo("18.13.50 (3)"), name: "aba-international-law-award-2008-09", crop: [17, 12, 72, 79] },
  { file: photo("18.13.48 (1)"), name: "uja-cameroon", crop: [4, 8, 92, 88] },
  { file: photo("18.13.51 (1)"), name: "aba-dispute-resolution-2003-04", crop: [15, 12, 73, 77] },
  { file: photo("18.13.51"), name: "aba-business-law-section", crop: [12, 9, 75, 81] },
];

for (const item of items) {
  const upright = await sharp(path.join(src, item.file)).rotate(item.rotate ?? 0).toBuffer();
  const { width, height } = await sharp(upright).metadata();
  const [l, t, w, h] = item.crop;
  await sharp(upright)
    .extract({
      left: Math.round((width * l) / 100),
      top: Math.round((height * t) / 100),
      width: Math.round((width * w) / 100),
      height: Math.round((height * h) / 100),
    })
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .modulate({ brightness: 1.03 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(out, `${item.name}.jpg`));
  console.log(item.name);
}
