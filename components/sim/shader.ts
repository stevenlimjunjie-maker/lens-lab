export const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * One pass photo simulator. Scene radiance comes from the colour texture,
 * boosted by the "hot" channel so highlights can exceed white. Blur for depth
 * of field, subject motion and camera shake is gathered in a single loop.
 */
export const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uColor;
uniform sampler2D uData;
uniform sampler2D uSubj;

uniform float uAspect;     // height / width
uniform float uStops;      // exposure relative to correct
uniform vec3  uWB;         // white balance gains
uniform float uNoise;      // noise sigma (display units)
uniform float uChroma;     // chroma noise share
uniform float uSeed;
uniform float uGrain;      // device pixels per grain
uniform float uMotion;     // subject motion blur length (fraction of width)
uniform vec2  uShake;      // camera shake vector (fraction of width)
uniform float uDof;        // blur radius per unit depth difference
uniform float uFocus;      // focus depth 0 near .. 1 far
uniform float uSubjDepth;
uniform float uZebra;
uniform float uPeak;
uniform float uRaw;        // 1 = RAW latitude, 0 = JPEG (clipped, 8 bit)
uniform float uHighlights; // stops, <= 0 recovers highlights
uniform float uShadows;    // stops, >= 0 lifts shadows
uniform float uDistort;    // barrel distortion amount
uniform float uVignette;
uniform vec2  uTexel;

const int N = 36;

vec3 toLin(vec3 c) { return pow(max(c, vec3(0.0)), vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float gauss(vec2 p) {
  float u1 = max(hash(p), 1e-4);
  float u2 = hash(p + 17.13);
  return sqrt(-2.0 * log(u1)) * cos(6.2831853 * u2);
}

vec2 lensUv(vec2 uv) {
  vec2 d = uv - 0.5;
  d.y *= uAspect;
  float r2 = dot(d, d);
  d *= 1.0 + uDistort * r2 * 4.0;
  d /= 1.0 + uDistort * 0.5;
  d.y /= uAspect;
  return d + 0.5;
}

vec4 scene(vec2 uv) {
  vec3 c = toLin(texture(uColor, uv).rgb);
  vec2 dh = texture(uData, uv).rg;
  return vec4(c * exp2(dh.g * 4.0), dh.r);
}

vec4 subj(vec2 uv) {
  vec4 s = texture(uSubj, uv);
  if (s.a < 1e-4) return vec4(0.0);
  return vec4(toLin(s.rgb / s.a) * s.a, s.a);
}

float lumAt(vec2 uv) {
  vec3 bg = scene(uv).rgb;
  vec4 s = subj(uv);
  vec3 c = bg * (1.0 - s.a) + s.rgb;
  return dot(toSrgb(c), vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  vec2 uv = lensUv(vUv);
  vec4 c0 = scene(uv);
  vec4 s0 = subj(uv);
  float here = mix(c0.a, uSubjDepth, step(0.5, s0.a));

  float rBg = uDof * abs(c0.a - uFocus);
  float rS = uDof * abs(uSubjDepth - uFocus);

  vec3 bg = vec3(0.0);
  vec4 sa = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) + 0.5) / float(N);
    float a = float(i) * 2.3999632;
    vec2 disc = vec2(cos(a), sin(a)) * sqrt(t);
    vec2 sh = uShake * (fract(t * 7.0 + 0.13) - 0.5);
    vec2 ob = disc * rBg + sh;
    vec2 os = disc * rS + vec2(uMotion * (t - 0.5), 0.0) + sh;
    ob.y /= uAspect;
    os.y /= uAspect;
    bg += scene(uv + ob).rgb;
    sa += subj(uv + os);
  }
  bg /= float(N);
  sa /= float(N);
  vec3 x = bg * (1.0 - sa.a) + sa.rgb;

  // exposure and white balance
  x *= exp2(uStops) * uWB;

  // sensor noise, stronger in the shadows
  vec2 g = floor(gl_FragCoord.xy / uGrain) + uSeed;
  vec3 s = toSrgb(x);
  float n = gauss(g) * uNoise;
  vec3 cn = vec3(gauss(g + 3.1), gauss(g + 7.7), gauss(g + 11.3)) * uNoise * uChroma;
  s += (vec3(n) + cn) * (1.1 - 0.6 * clamp(s, 0.0, 1.0));
  x = toLin(s);

  // JPEG: clip and quantise before any edit. RAW keeps the headroom.
  if (uRaw < 0.5) {
    x = toLin(floor(toSrgb(clamp(x, 0.0, 1.0)) * 255.0 + 0.5) / 255.0);
  }

  float L = dot(x, vec3(0.2126, 0.7152, 0.0722));
  x *= exp2(uHighlights * smoothstep(0.25, 1.4, L));
  x *= exp2(uShadows * (1.0 - smoothstep(0.0, 0.2, L)));

  vec3 outc = clamp(toSrgb(x), 0.0, 1.0);

  vec2 vd = vUv - 0.5;
  outc *= 1.0 - uVignette * dot(vd, vd) * 2.2;

  if (uZebra > 0.5 && max(outc.r, max(outc.g, outc.b)) > 0.985) {
    float stripe = mod((gl_FragCoord.x + gl_FragCoord.y) / uGrain, 12.0);
    if (stripe < 6.0) outc = vec3(0.725, 0.11, 0.11);
  }

  if (uPeak > 0.5) {
    vec2 tx = uTexel * 1.5;
    float gx = lumAt(uv + vec2(tx.x, 0.0)) - lumAt(uv - vec2(tx.x, 0.0));
    float gy = lumAt(uv + vec2(0.0, tx.y)) - lumAt(uv - vec2(0.0, tx.y));
    float edge = sqrt(gx * gx + gy * gy);
    float inFocus = 1.0 - smoothstep(0.02, 0.07, abs(here - uFocus));
    if (edge * inFocus > 0.16) outc = vec3(0.2, 1.0, 0.25);
  }

  outColor = vec4(outc, 1.0);
}`;
