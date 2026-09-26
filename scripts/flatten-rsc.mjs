// Next.js static export writes route segment prefetch data in nested folders
// (out/lab/exposure/__next.lab/exposure/__PAGE__.txt) while the client requests
// a flat dotted name (out/lab/exposure/__next.lab.exposure.__PAGE__.txt).
// Copy each nested file to its flat name so client prefetches do not 404.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(dir, p);
    else walk(p);
  }
}

function flatten(routeDir, segDir) {
  const visit = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) visit(p);
      else {
        const flat = relative(routeDir, p).split(sep).join(".");
        copyFileSync(p, join(routeDir, flat));
        copied++;
      }
    }
  };
  visit(segDir);
}

walk(OUT);
console.log(`flatten-rsc: wrote ${copied} prefetch file(s)`);
