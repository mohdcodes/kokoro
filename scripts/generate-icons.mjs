// One-off script to rasterize public/icons/icon.svg into the PNG sizes needed by manifest.json.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "..", "public", "icons", "icon.svg");
const outDir = join(__dirname, "..", "public", "icons");

const sizes = [192, 512];

for (const size of sizes) {
  const outPath = join(outDir, `icon-${size}.png`);
  await sharp(svgPath).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${outPath}`);
}
