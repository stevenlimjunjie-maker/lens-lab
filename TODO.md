# Outstanding tasks

Status as of 2026-09-26. Live at https://lens-lab-six.vercel.app (pushes to `main` auto-deploy).

## Waiting on the owner

- [ ] **Test the pinned preview on a real phone (Galaxy S25 FE).** Drag the sliders on Exposure, Lenses and Pro
      controls. Decide whether the pinned photo should shrink once you scroll into the controls, or stay as it is
      (currently capped at about 40% of the screen height).
- [ ] **Check the platform instructions** in `lib/content.ts` against current One UI and iOS versions. Most likely to
      have moved: where Expert RAW lives, the Samsung burst gesture setting, Samsung Portrait blur controls, and the
      iPhone burst and Macro toggles.
- [ ] **Watch the video** (80 seconds, `public/video/`) and flag any scene that feels rushed, especially the two tips
      lists (about 52 frames per tip).
- [ ] **Decide on the site address.** `lens-lab.vercel.app` was taken, so the site is on `lens-lab-six.vercel.app`. If a
      custom domain is added: update `SITE_URL` in `lib/site.ts`, re-render the video with `SITE_LABEL=<domain>`
      (its closing screen shows the address) and redeploy.
- [ ] **Optional music.** The video is silent. To add a licensed track, place it at `video/public/music.mp3` and run
      `npm run render` in `video/`.
- [ ] **Commit author name.** The public commit history shows the local git author name. If that should not be public,
      rewrite the history with a neutral author (needs a force push, so only on explicit approval).

## Engineering follow-ups

- [ ] **Simulator page performance.** Lighthouse mobile performance is about 72 to 76 on `/lab/*` and `/quiz`
      (target 85). Every other score is 100. TBT comes from hydration plus the first WebGL scene draw; Lighthouse runs
      without a GPU, which inflates it. Ideas:
  - show the pre-rendered WebP (`public/samples/*-800.webp`) as a placeholder and start WebGL on first interaction or
    when idle
  - move `renderScene` (Canvas 2D scene drawing) to an OffscreenCanvas in a Web Worker
  - use `KHR_parallel_shader_compile` so shader linking does not block the main thread
- [ ] **Shrink the pinned preview on scroll** (if the owner wants it after testing on a phone).

## Useful commands

```bash
npm run dev                      # local dev
npm run build                    # static export to out/ (includes the RSC flatten step)
npx serve out -l 4173            # serve the export
npm run qa:screens               # overflow and screenshot QA at 412x915 and 1440x900
npm run check:copy               # no em dashes, hashtags or personal names
cd video && npm run render       # re-render both videos and posters
```
