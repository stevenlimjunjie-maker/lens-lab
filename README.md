# Lens Lab

A mobile-first, interactive web app that teaches how the camera settings on Samsung Galaxy and iPhone phones work, so
beginner and intermediate photographers can shoot closer to a professional.

- **Exposure triangle simulator**: ISO, shutter speed, EV and a conceptual aperture control on a live photo, with noise,
  motion blur, camera shake, clipping zebras, a live histogram and a plain-English verdict.
- **Lens and zoom comparison**: ultra-wide, main and telephoto on the same scene, perspective compression, edge
  distortion and a digital zoom warning.
- **Pro controls and RAW**: white balance in Kelvin, manual focus with focus peaking, metering modes, and a side by side
  JPEG versus RAW recovery demo, with drawn "On Samsung" and "On iPhone" guides.
- **Scenario presets and quiz**: seven shooting situations with settings and step by step instructions, plus a
  fix-the-photo quiz.
- **Cheat sheet**: a printable summary table that stacks into cards on small phones.
- **Explainer video**: an 80 second captioned video made with Remotion, in vertical (1080x1920) and landscape
  (1920x1080) cuts.

Every sample image is drawn procedurally in code. There are no stock photos, screenshots or logos.

## Tech

- Next.js (App Router, static export), TypeScript, Tailwind CSS
- WebGL2 fragment shader for the photo simulator (`components/sim`)
- Framer Motion for the home page intro
- Remotion for the video, in its own workspace (`video/`)
- Playwright for screenshots and QA

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Production build and static export to `out/` |
| `npm run check:copy` | Fails on em dashes, hashtags or personal names in the copy |
| `npm run qa:screens` | Screenshots every page at 412x915 and 1440x900 and reports overflow (serve `out/` on port 4173 first) |

### Regenerating the sample images and OG image

The scenes live in `lib/scenes.ts`. With the dev server running on port 3100 (`npx next dev -p 3100`):

```bash
node scripts/gen-samples.mjs   # writes public/samples/*.webp (each checked to be under 400KB)
node scripts/gen-og.mjs        # writes public/og.png
```

These use dev-only pages (`*.dev.tsx`) that are excluded from production builds.

## Re-rendering the video

The video is rendered locally and committed as static files in `public/video`. It is never rendered during the
Vercel build.

```bash
cd video
npm install
npm run studio      # optional: preview in Remotion Studio
npm run render      # renders both cuts, compresses with ffmpeg, writes MP4s and posters to ../public/video
```

Requirements: ffmpeg on your PATH. The render script targets H.264 under 15MB per file and raises the CRF if needed.

The video is silent. To add a licensed background track, place it at `video/public/music.mp3` before rendering; the
script picks it up automatically.

## Deploy

The site is a static export and deploys to Vercel as a Next.js project.

```bash
npm i -g vercel
vercel link          # link or create the project
vercel --prod        # production deploy
vercel git connect   # auto deploy on every push to main
```

`.vercelignore` keeps the `video/` workspace out of the upload, so Vercel never installs Remotion.

## Accuracy notes

Features vary by model, region and software version. The site describes settings common to recent Samsung Galaxy and
iPhone models in general terms, labels model-dependent features "on supported models", and gives focal lengths as
approximate equivalents. All platform copy lives in `lib/content.ts` for easy review.

Lens Lab is not affiliated with Samsung or Apple. Product names are trademarks of their owners and are used only to
describe compatibility.

## Credits

- Sample scenes and phone drawings: created for this project in code
- Fonts: Libre Baskerville and IBM Plex Sans (SIL Open Font License), via Google Fonts
- Built with Next.js, Tailwind CSS, Framer Motion, Remotion and Playwright
