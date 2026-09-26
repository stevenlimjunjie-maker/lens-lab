// Screenshots every page at phone and desktop sizes and reports horizontal
// overflow. Usage: serve the static export (npx serve out -l 4173), then
//   node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:4173";
const ROUTES = ["/", "/lab/exposure", "/lab/lenses", "/lab/pro-controls", "/lab/scenarios", "/quiz", "/cheat-sheet", "/about"];
const VIEWPORTS = [
  { name: "mobile", width: 412, height: 915 },
  { name: "desktop", width: 1440, height: 900 },
];

mkdirSync("qa/screens", { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
let problems = 0;

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const route of ROUTES) {
    errors.length = 0;
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const report = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const scroll = document.documentElement.scrollWidth;
      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || el.closest(".sr-only")) continue;
        // Ignore content inside clipped containers.
        let clipped = false;
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") {
            clipped = true;
            break;
          }
        }
        if (!clipped && (r.right > vw + 1 || r.left < -1)) {
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
        }
      }
      // Text clipped by its own box (e.g. overflowing buttons).
      const clippedText = [];
      for (const el of document.querySelectorAll("button, a, label, th, td, h1, h2, h3, p")) {
        if (el.closest(".sr-only")  || el.classList.contains("sr-only")) continue;
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== "visible") {
          clippedText.push(`${el.tagName.toLowerCase()}: ${el.textContent.trim().slice(0, 40)}`);
        }
      }
      return { vw, scroll, offenders: offenders.slice(0, 8), clippedText: clippedText.slice(0, 8) };
    });
    const slug = route === "/" ? "home" : route.slice(1).replace(/\//g, "-");
    await page.screenshot({ path: `qa/screens/${slug}-${vp.name}.png`, fullPage: true });
    const hScroll = report.scroll > report.vw;
    const bad = hScroll || report.offenders.length || report.clippedText.length || errors.length;
    if (bad) problems++;
    console.log(`${bad ? "FAIL" : "ok  "} ${vp.name.padEnd(7)} ${route}${hScroll ? `  scrollWidth ${report.scroll} > ${report.vw}` : ""}`);
    report.offenders.forEach((o) => console.log(`       overflow: ${o}`));
    report.clippedText.forEach((o) => console.log(`       clipped: ${o}`));
    errors.slice(0, 3).forEach((e) => console.log(`       error: ${e.slice(0, 160)}`));
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `\n${problems} page(s) need attention` : "\nAll pages clean");
process.exit(problems ? 1 : 0);
