/** Approximate RGB colour of a light source at a colour temperature (Kelvin). */
export function kelvinToRgb(k: number): [number, number, number] {
  const t = k / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.max(0, Math.min(255, v)) / 255;
  return [c(r), c(g), c(b)];
}

/**
 * Gains applied to a correctly balanced image when the camera's white
 * balance (camK) does not match the light (lightK).
 * Setting a lower Kelvin than the light makes the photo cooler (bluer).
 */
export function whiteBalanceGains(lightK: number, camK: number): [number, number, number] {
  const l = kelvinToRgb(lightK);
  const c = kelvinToRgb(camK);
  const g: [number, number, number] = [l[0] / c[0], l[1] / c[1], l[2] / c[2]];
  const lum = 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2];
  // Soften so extreme mismatches stay readable rather than monochrome.
  return g.map((v) => Math.pow(v / lum, 0.95)) as [number, number, number];
}

export function kelvinCss(k: number): string {
  const [r, g, b] = kelvinToRgb(k);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}
