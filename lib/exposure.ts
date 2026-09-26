/**
 * Exposure maths shared by the simulator, presets, quiz and video.
 * Values are expressed in stops relative to a "correct" exposure for each scene.
 */

export const ISO_VALUES = [
  50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400,
] as const;

/** Shutter speeds in seconds, one third stop apart. */
export const SHUTTER_VALUES = [
  1 / 4000, 1 / 3200, 1 / 2500, 1 / 2000, 1 / 1600, 1 / 1250, 1 / 1000, 1 / 800, 1 / 640, 1 / 500, 1 / 400, 1 / 320,
  1 / 250, 1 / 200, 1 / 160, 1 / 125, 1 / 100, 1 / 80, 1 / 60, 1 / 50, 1 / 40, 1 / 30, 1 / 25, 1 / 20, 1 / 15, 1 / 13,
  1 / 10, 1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 0.4, 0.5, 0.6, 0.8, 1,
] as const;

export const EV_VALUES = [-2, -5 / 3, -4 / 3, -1, -2 / 3, -1 / 3, 0, 1 / 3, 2 / 3, 1, 4 / 3, 5 / 3, 2] as const;

export const APERTURE_VALUES = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16] as const;

/** Typical phone main camera aperture used as the reference point. */
export const PHONE_APERTURE = 1.8;

export function formatShutter(t: number): string {
  if (t >= 0.3) return `${Number(t.toFixed(1))}s`;
  return `1/${Math.round(1 / t)}s`;
}

export function formatIso(iso: number): string {
  return `ISO ${iso}`;
}

export function formatEv(ev: number): string {
  const r = Math.round(ev * 10) / 10;
  if (Math.abs(r) < 0.05) return "0.0";
  return `${r > 0 ? "+" : ""}${r.toFixed(1)}`;
}

export function formatAperture(f: number): string {
  return `f/${f}`;
}

export function nearestIndex(values: readonly number[], v: number): number {
  let best = 0;
  let bestD = Infinity;
  values.forEach((x, i) => {
    const d = Math.abs(Math.log2(x) - Math.log2(v));
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export function nearestEvIndex(v: number): number {
  let best = 0;
  let bestD = Infinity;
  EV_VALUES.forEach((x, i) => {
    const d = Math.abs(x - v);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

export type LightInfo = {
  /** Shutter time that gives a correct exposure at ISO 100 and f/1.8. */
  t0: number;
  /** Colour temperature of the light in the scene (Kelvin). */
  lightK: number;
  /** Subject speed in frame widths per second (0 for static). */
  motion: number;
};

/** Stops of exposure relative to correct, for manual settings. */
export function exposureStops(light: LightInfo, iso: number, t: number, aperture = PHONE_APERTURE): number {
  return Math.log2(iso / 100) + Math.log2(t / light.t0) + 2 * Math.log2(PHONE_APERTURE / aperture);
}

/**
 * A simplified phone auto-exposure program: keep ISO low, stay at or faster
 * than 1/60s for handheld shots, then raise ISO, then slow the shutter.
 */
export function autoExposure(light: LightInfo, ev: number, aperture = PHONE_APERTURE) {
  // Required ISO x time product for the target exposure.
  const needed = 100 * light.t0 * Math.pow(2, ev) * Math.pow(aperture / PHONE_APERTURE, 2);
  const minIso = 50;
  const maxIso = 3200;
  const handheldLimit = light.motion > 0.2 ? 1 / 250 : 1 / 60;
  let iso = minIso;
  let t = needed / iso;
  if (t > handheldLimit) {
    t = handheldLimit;
    iso = needed / t;
    if (iso > maxIso) {
      iso = maxIso;
      t = needed / iso;
    }
  }
  t = Math.max(1 / 4000, Math.min(1, t));
  iso = Math.max(minIso, Math.min(6400, iso));
  const isoIdx = nearestIndex(ISO_VALUES, iso);
  const tIdx = nearestIndex(SHUTTER_VALUES, t);
  return { isoIdx, tIdx, iso: ISO_VALUES[isoIdx], t: SHUTTER_VALUES[tIdx] };
}

/** Noise standard deviation in display units for a given ISO. */
export function noiseForIso(iso: number): number {
  return 0.006 * Math.pow(iso / 50, 0.62);
}

/** Motion blur length as a fraction of frame width. */
export function motionBlur(light: LightInfo, t: number): number {
  return light.motion * t;
}

/** Handheld shake length as a fraction of frame width (stabilisation assumed). */
export function shakeBlur(t: number, handheld: boolean): number {
  if (!handheld) return 0;
  return Math.max(0, t - 1 / 250) * 0.09;
}

/** Depth of field blur scale for an aperture (concept: bigger opening, blurrier background). */
export function dofForAperture(f: number, portrait = false): number {
  if (portrait) return 0.012 * Math.pow(2.8 / f, 1.1) + 0.002;
  // Real small-sensor phones have deep depth of field; the concept slider
  // shows what a larger camera would do.
  return 0.02 * Math.pow(1.4 / f, 1.2);
}

/** Blur below this (fraction of width) is not visible at phone screen sizes. */
export const BLUR_VISIBLE = 0.004;

export function suggestShutterFor(lengthPerSecond: number): string {
  const t = 0.0025 / Math.max(lengthPerSecond, 1e-6);
  const idx = nearestIndex(SHUTTER_VALUES, Math.min(t, 1 / 60));
  return formatShutter(SHUTTER_VALUES[idx]);
}

export type Stats = {
  /** 64 bin luminance histogram, normalised to sum 1. */
  hist: number[];
  mean: number;
  clipped: number;
  crushed: number;
};

export type Verdict = { tone: "good" | "caution" | "bad"; text: string; detail?: string };

export function verdictFor(input: {
  stops: number;
  stats?: Stats | null;
  motion: number;
  motionPerSecond: number;
  shake: number;
  noise: number;
}): Verdict[] {
  const out: Verdict[] = [];
  const { stats } = input;
  const clipped = stats?.clipped ?? 0;
  const mean = stats?.mean ?? 0.45;

  if (input.stops > 1.2 || clipped > 0.12) {
    out.push({
      tone: "bad",
      text: "Too bright, highlights are blown",
      detail: "Crimson stripes mark pure white areas with no detail left. Lower EV, use a faster shutter or a lower ISO.",
    });
  } else if (input.stops > 0.5 || clipped > 0.05) {
    out.push({
      tone: "caution",
      text: "A little bright, watch the highlights",
      detail: "Try EV -0.3 to -0.7 to keep detail in the sky and bright surfaces.",
    });
  } else if (input.stops < -1.5 || mean < 0.12) {
    out.push({
      tone: "bad",
      text: "Too dark",
      detail: "Raise EV, slow the shutter a little or raise ISO. Brightening later adds noise.",
    });
  } else if (input.stops < -0.6) {
    out.push({ tone: "caution", text: "Slightly dark", detail: "Add about +0.7 EV, or accept it for a moody look." });
  }

  if (input.motion > BLUR_VISIBLE) {
    out.push({
      tone: input.motion > BLUR_VISIBLE * 3 ? "bad" : "caution",
      text: `Motion blur likely, try ${suggestShutterFor(input.motionPerSecond)}`,
      detail: "The moving subject travels too far while the shutter is open.",
    });
  }
  if (input.shake > BLUR_VISIBLE) {
    out.push({
      tone: input.shake > BLUR_VISIBLE * 3 ? "bad" : "caution",
      text: "Camera shake likely",
      detail: "Handheld at this speed blurs the whole frame. Brace the phone, use a faster shutter or a tripod.",
    });
  }
  if (input.noise > 0.045) {
    out.push({ tone: "caution", text: "Visible noise", detail: "High ISO adds grain and colour speckles. Use more light or Night mode if you can." });
  }
  if (out.length === 0 || out.every((v) => v.tone === "caution" && v.text === "Visible noise")) {
    out.unshift({ tone: "good", text: "Well exposed", detail: "Detail in the shadows and highlights, and a sharp subject." });
  }
  return out;
}
