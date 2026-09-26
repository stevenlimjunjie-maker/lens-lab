// Screenshots the dev-only OG page into public/og.png. Requires `npm run dev` on port 3100.
import { chromium } from "playwright";
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto(`${BASE}/dev-og`, { waitUntil: "networkidle" });
await p.waitForTimeout(800);
await p.locator("#og").screenshot({ path: "public/og.png" });
await b.close();
console.log("wrote public/og.png");
