// Renders both video cuts with the Remotion CLI, compresses them with ffmpeg
// (H.264, target under 15MB) and writes MP4s and posters to ../public/video.
// Usage: npm run render   (from the video folder)
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";

const run = (cmd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

mkdirSync("public/samples", { recursive: true });
cpSync("../public/samples", "public/samples", { recursive: true });
mkdirSync("out", { recursive: true });
mkdirSync("../public/video", { recursive: true });

const props = { url: process.env.SITE_LABEL ?? "lens-lab.vercel.app" };
// Optional licensed music: put it at video/public/music.mp3. Silent otherwise.
if (existsSync("public/music.mp3")) props.music = "music.mp3";
// A props file avoids shell quoting differences between Windows and Unix.
writeFileSync("out/props.json", JSON.stringify(props));
const propsArg = "--props=out/props.json";

const cuts = [
  { id: "Vertical", name: "lens-lab-vertical", posterFrame: 120 },
  { id: "Landscape", name: "lens-lab-landscape", posterFrame: 120 },
];

for (const cut of cuts) {
  const raw = `out/${cut.name}.raw.mp4`;
  run(`npx remotion render src/index.ts ${cut.id} ${raw} --codec=h264 --crf=18 ${propsArg}`);
  let crf = 26;
  const final = `../public/video/${cut.name}.mp4`;
  for (;;) {
    const audio = props.music ? "-c:a aac -b:a 128k" : "-an";
    run(`ffmpeg -y -loglevel error -i ${raw} -c:v libx264 -preset slow -crf ${crf} -vf scale=out_range=tv,format=yuv420p -color_range tv -movflags +faststart ${audio} ${final}`);
    const mb = statSync(final).size / 1024 / 1024;
    console.log(`${final}: ${mb.toFixed(2)} MB at CRF ${crf}`);
    if (mb < 15 || crf >= 34) break;
    crf += 2;
  }
  const still = `out/${cut.name}-poster.png`;
  run(`npx remotion still src/index.ts ${cut.id} ${still} --frame=${cut.posterFrame} ${propsArg}`);
  run(`ffmpeg -y -loglevel error -i ${still} -q:v 4 ../public/video/${cut.name}-poster.jpg`);
}
