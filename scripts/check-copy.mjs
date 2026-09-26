// Fails if written copy contains em dashes, hashtags or personal names.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components", "lib", "video/src", "README.md", "public/samples/CREDITS.md"];
const EXT = /\.(tsx?|mjs|md|css)$/;
const BANNED = [
  { re: /—/, why: "em dash" },
  { re: /(^|[\s>(])#[A-Za-z][A-Za-z0-9_]{2,}\b(?![-\w]*[:;])/, why: "hashtag", skip: (l) => /href=|#[0-9a-fA-F]{3,8}\b|\[#|url\(#|getElementById|querySelector/.test(l) },
  { re: /steven|stevenlim/i, why: "personal name" },
];

const files = [];
const walk = (p) => {
  const s = statSync(p);
  if (s.isDirectory()) readdirSync(p).forEach((f) => walk(join(p, f)));
  else if (EXT.test(p)) files.push(p);
};
ROOTS.forEach((r) => {
  try {
    walk(r);
  } catch {
    /* optional root missing */
  }
});

let bad = 0;
for (const f of files) {
  readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const b of BANNED) {
        if (b.re.test(line) && !(b.skip && b.skip(line))) {
          console.log(`${f}:${i + 1} ${b.why}: ${line.trim().slice(0, 120)}`);
          bad++;
        }
      }
    });
}
console.log(bad ? `\n${bad} problem(s) found` : `Copy check passed (${files.length} files)`);
process.exit(bad ? 1 : 0);
