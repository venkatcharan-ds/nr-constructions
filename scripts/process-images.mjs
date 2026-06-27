/**
 * Image optimisation pipeline for NR Constructions.
 *
 * Reads every file from public/assets/raw/**, converts to WebP at
 * quality-appropriate settings, writes to public/assets/optimized/,
 * generates a tiny base64 blur placeholder per image, and prints a
 * JSON manifest that src/data/gallery.ts imports.
 *
 * Run: node scripts/process-images.mjs
 */

import sharp from "sharp";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(ROOT, "public", "assets", "raw");
const OUT_DIR = path.join(ROOT, "public", "assets", "optimized");

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Image manifest ────────────────────────────────────────────────────────────
// Each entry describes one raw image and its desired output.
// `outputName`  — clean kebab-case filename (no double extension)
// `quality`     — WebP quality (85 photos, 90 line art / floor plans)
// `maxWidth`    — resize so width ≤ maxWidth, keeping aspect ratio
// `category`    — maps to ImageCategory in src/types/index.ts
// `altText`     — accessible description
// `isHero`      — true for the chosen hero image
// `sortOrder`   — gallery display order
// `keepPng`     — true for assets needing alpha that look better as PNG

const MANIFEST = [
  // ── Exterior ──────────────────────────────────────────────────────────────
  {
    input: "exterior/building-front.jpg.jpeg",
    outputName: "exterior-building-front.webp",
    id: "ext-front",
    category: "exterior",
    altText: "Front elevation of Roshan Apartments, Corlim, Goa",
    isHero: true,
    sortOrder: 1,
    quality: 85,
    maxWidth: 1200,
  },
  {
    input: "exterior/building-angle1.jpg.jpeg",
    outputName: "exterior-building-angle-1.webp",
    id: "ext-angle-1",
    category: "exterior",
    altText: "Roshan Apartments — angled view showing full G+4 structure",
    isHero: false,
    sortOrder: 2,
    quality: 85,
    maxWidth: 900,
  },
  {
    input: "exterior/building-angle2.jpg.jpeg",
    outputName: "exterior-building-angle-2.webp",
    id: "ext-angle-2",
    category: "exterior",
    altText: "Roshan Apartments — second angle view with surroundings",
    isHero: false,
    sortOrder: 3,
    quality: 85,
    maxWidth: 900,
  },
  {
    input: "exterior/building-night.jpg.jpeg",
    outputName: "exterior-building-night.webp",
    id: "ext-night",
    category: "exterior",
    altText: "Roshan Apartments illuminated at night",
    isHero: false,
    sortOrder: 4,
    quality: 85,
    maxWidth: 768,
  },

  // ── Interior ──────────────────────────────────────────────────────────────
  {
    input: "interior/living-room.jpg.jpeg",
    outputName: "interior-living-room.webp",
    id: "int-living",
    category: "interior",
    altText: "Spacious living room in a 2 BHK unit at Roshan Apartments",
    isHero: false,
    sortOrder: 5,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "interior/entrance.jpg.jpeg",
    outputName: "interior-entrance.webp",
    id: "int-entrance",
    category: "interior",
    altText: "Unit entrance foyer with tiled flooring",
    isHero: false,
    sortOrder: 6,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "kitchen/kitchen-main.jpg.jpeg",
    outputName: "interior-kitchen.webp",
    id: "int-kitchen",
    category: "interior",
    altText: "Modular kitchen with granite counter and tiled backsplash",
    isHero: false,
    sortOrder: 7,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "balcony/balcony-view-1.jpg.jpeg",
    outputName: "interior-balcony-1.webp",
    id: "int-balcony-1",
    category: "interior",
    altText: "Balcony view from a 2 BHK unit — open skies over Corlim",
    isHero: false,
    sortOrder: 8,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "balcony/balcony-view-2.jpg.jpeg",
    outputName: "interior-balcony-2.webp",
    id: "int-balcony-2",
    category: "interior",
    altText: "Second balcony perspective showing neighbourhood greenery",
    isHero: false,
    sortOrder: 9,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "bathrooms/bathroom-1.jpg.jpeg",
    outputName: "interior-bathroom-1.webp",
    id: "int-bath-1",
    category: "interior",
    altText: "Attached bathroom with premium sanitary fittings",
    isHero: false,
    sortOrder: 10,
    quality: 85,
    maxWidth: 768,
  },
  {
    input: "bathrooms/bathroom-2.jpg.jpeg",
    outputName: "interior-bathroom-2.webp",
    id: "int-bath-2",
    category: "interior",
    altText: "Second bathroom with full-height wall tiles",
    isHero: false,
    sortOrder: 11,
    quality: 85,
    maxWidth: 768,
  },

  // ── Floor Plan ────────────────────────────────────────────────────────────
  {
    input: "floor-plans/typical-floor-plan.jpg.png",
    outputName: "floor-plan-typical.webp",
    id: "fp-typical",
    category: "floor-plan",
    altText: "Typical floor plan — 2 BHK layout, 102–103 sqm",
    isHero: false,
    sortOrder: 12,
    quality: 90,
    maxWidth: 1422,
  },
];

// ── Processing ────────────────────────────────────────────────────────────────

async function generateBlurDataURL(inputPath) {
  const buf = await sharp(inputPath)
    .resize({ width: 10 })
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

async function processEntry(entry) {
  const inputPath = path.join(RAW_DIR, entry.input);
  const outputPath = path.join(OUT_DIR, entry.outputName);

  const { data, info } = await sharp(inputPath)
    .resize({ width: entry.maxWidth, withoutEnlargement: true })
    .webp({ quality: entry.quality, effort: 6 })
    .toBuffer({ resolveWithObject: true });

  fs.writeFileSync(outputPath, data);

  const blurDataURL = await generateBlurDataURL(inputPath);

  const kbIn = Math.round(fs.statSync(inputPath).size / 1024);
  const kbOut = Math.round(data.length / 1024);
  const saving = Math.round((1 - data.length / fs.statSync(inputPath).size) * 100);

  console.log(
    `  ✓ ${entry.outputName.padEnd(42)} ${kbIn}KB → ${kbOut}KB  (${saving}% saved)  ${info.width}×${info.height}`,
  );

  return {
    id: entry.id,
    outputName: entry.outputName,
    url: `/assets/optimized/${entry.outputName}`,
    category: entry.category,
    altText: entry.altText,
    isHero: entry.isHero,
    sortOrder: entry.sortOrder,
    width: info.width,
    height: info.height,
    blurDataURL,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log("\nNR Constructions — Image Optimisation Pipeline");
console.log("=".repeat(60));

const results = [];
for (const entry of MANIFEST) {
  try {
    const result = await processEntry(entry);
    results.push(result);
  } catch (err) {
    console.error(`  ✗ FAILED: ${entry.input} — ${err.message}`);
  }
}

// Write the manifest JSON so we can inspect it
const manifestPath = path.join(OUT_DIR, "manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));

console.log("\n" + "=".repeat(60));
console.log(`Processed ${results.length}/${MANIFEST.length} images`);
console.log(`Manifest written to: public/assets/optimized/manifest.json`);
console.log("");

// Print the blurDataURLs for embedding into gallery.ts
console.log("── Blur data URLs (for gallery.ts) ──");
for (const r of results) {
  console.log(`${r.id}: "${r.blurDataURL.substring(0, 60)}..."`);
}
