// Exports the procedurally drawn scenes to /public/samples as WebP stills.
// Usage: start `npm run dev` on port 3100, then `node scripts/gen-samples.mjs`.
import { chromium } from "playwright";
import { mkdirSync, statSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = new URL("../public/samples/", import.meta.url);
const SIZES = [1280, 800, 480];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/dev-samples`, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const scenes = await page.$$eval("[data-scene]", (els) => els.map((e) => e.getAttribute("data-scene")));
for (const id of scenes) {
  for (const size of SIZES) {
    const dataUrl = await page.$eval(
      `[data-scene="${id}"] canvas`,
      (c, size) => {
        const out = document.createElement("canvas");
        out.width = size;
        out.height = Math.round(size * 0.75);
        const ctx = out.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(c, 0, 0, out.width, out.height);
        return out.toDataURL("image/webp", 0.82);
      },
      size,
    );
    const file = new URL(`${id}-${size}.webp`, OUT);
    writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
    const kb = statSync(file).size / 1024;
    console.log(`${id}-${size}.webp ${kb.toFixed(0)} KB`);
    if (kb > 400) throw new Error(`${id}-${size}.webp is over 400KB`);
  }
}
await browser.close();
