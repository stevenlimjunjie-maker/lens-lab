/**
 * Procedurally drawn sample scenes. Everything is drawn with Canvas 2D in
 * "world" units: the main (1x) camera frame spans x 0..1 and y 0..0.75.
 * The ultra-wide (0.5x) view extends to x -0.5..1.5 and y -0.375..1.125,
 * so backgrounds are drawn wide enough to cover it.
 *
 * Each layer carries a depth (0 near, 1 far) used for focus and depth of field,
 * and an optional "hot" value: extra stops of brightness above white, used to
 * show highlight clipping and RAW recovery.
 */

import type { LightInfo } from "./exposure";

export type Ctx = CanvasRenderingContext2D;

export type DepthSpec = number | { y0: number; d0: number; y1: number; d1: number };

export type Layer = {
  name: string;
  depth: DepthSpec;
  hot?: number;
  draw: (c: Ctx) => void;
};

export type SceneId = "street" | "night" | "portrait" | "food" | "landscape" | "indoor";

export type SceneDef = {
  id: SceneId;
  title: string;
  alt: string;
  light: LightInfo;
  subject: { depth: number; draw: (c: Ctx) => void; label: string };
  /** A near object that manual focus can land on. */
  near?: { depth: number; label: string };
  /** A far object that manual focus can land on. */
  far?: { depth: number; label: string };
  layers: Layer[];
  /** Zoom centre in world units. */
  center?: [number, number];
};

// ---------- drawing helpers ----------

const X0 = -0.62;
const X1 = 1.62;
const Y0 = -0.45;
const Y1 = 1.2;

function rect(c: Ctx, x: number, y: number, w: number, h: number, fill: string | CanvasGradient) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
}

function circle(c: Ctx, x: number, y: number, r: number, fill: string | CanvasGradient) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function ellipse(c: Ctx, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient, rot = 0) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  c.fill();
}

function poly(c: Ctx, pts: number[], fill: string | CanvasGradient) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
  c.fill();
}

function line(c: Ctx, pts: number[], stroke: string, w: number) {
  c.strokeStyle = stroke;
  c.lineWidth = w;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
}

function vgrad(c: Ctx, y0: number, y1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

function rgrad(c: Ctx, x: number, y: number, r: number, stops: [number, string][]) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

/** Deterministic pseudo random generator so scenes look the same every time. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function cloud(c: Ctx, x: number, y: number, s: number, fill: string) {
  ellipse(c, x, y, 0.09 * s, 0.03 * s, fill);
  ellipse(c, x - 0.05 * s, y + 0.008 * s, 0.06 * s, 0.022 * s, fill);
  ellipse(c, x + 0.03 * s, y - 0.018 * s, 0.05 * s, 0.03 * s, fill);
  ellipse(c, x + 0.08 * s, y + 0.006 * s, 0.05 * s, 0.02 * s, fill);
}

function tree(c: Ctx, x: number, base: number, h: number, leaf: string, leafDark: string) {
  rect(c, x - h * 0.035, base - h * 0.45, h * 0.07, h * 0.45, "#5b4636");
  circle(c, x, base - h * 0.62, h * 0.3, leafDark);
  circle(c, x - h * 0.16, base - h * 0.55, h * 0.2, leafDark);
  circle(c, x + h * 0.17, base - h * 0.58, h * 0.22, leafDark);
  circle(c, x - h * 0.05, base - h * 0.72, h * 0.22, leaf);
  circle(c, x + h * 0.1, base - h * 0.66, h * 0.17, leaf);
}

function windows(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  fill: (i: number, j: number) => string | null,
) {
  const cw = w / cols;
  const rh = h / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const f = fill(i, j);
      if (f) rect(c, x + i * cw + cw * 0.22, y + j * rh + rh * 0.2, cw * 0.56, rh * 0.55, f);
    }
  }
}

// ---------- people and props ----------

function person(
  c: Ctx,
  x: number,
  foot: number,
  h: number,
  o: { skin: string; hair: string; top: string; legs: string; stride?: number; bag?: string },
) {
  const s = h;
  const stride = o.stride ?? 0;
  // legs
  line(c, [x, foot - s * 0.45, x - s * 0.08 * stride - 0.004 * s, foot], o.legs, s * 0.075);
  line(c, [x, foot - s * 0.45, x + s * 0.1 * stride + 0.004 * s, foot], o.legs, s * 0.075);
  // shoes
  ellipse(c, x - s * 0.08 * stride - 0.004 * s + s * 0.02, foot, s * 0.045, s * 0.018, "#1f1f1f");
  ellipse(c, x + s * 0.1 * stride + 0.004 * s + s * 0.02, foot, s * 0.045, s * 0.018, "#1f1f1f");
  // torso
  poly(c, [x - s * 0.1, foot - s * 0.78, x + s * 0.1, foot - s * 0.78, x + s * 0.085, foot - s * 0.43, x - s * 0.085, foot - s * 0.43], o.top);
  // arms
  line(c, [x - s * 0.09, foot - s * 0.74, x - s * 0.13 - s * 0.06 * stride, foot - s * 0.5], o.top, s * 0.06);
  line(c, [x + s * 0.09, foot - s * 0.74, x + s * 0.12 + s * 0.07 * stride, foot - s * 0.52], o.top, s * 0.06);
  circle(c, x - s * 0.13 - s * 0.06 * stride, foot - s * 0.49, s * 0.03, o.skin);
  circle(c, x + s * 0.12 + s * 0.07 * stride, foot - s * 0.51, s * 0.03, o.skin);
  if (o.bag) rect(c, x + s * 0.1 + s * 0.07 * stride, foot - s * 0.52, s * 0.09, s * 0.12, o.bag);
  // neck and head
  rect(c, x - s * 0.025, foot - s * 0.84, s * 0.05, s * 0.07, o.skin);
  ellipse(c, x, foot - s * 0.9, s * 0.07, s * 0.085, o.skin);
  ellipse(c, x, foot - s * 0.95, s * 0.075, s * 0.05, o.hair);
}

function cyclist(c: Ctx, x: number, y: number, s: number) {
  // y is the ground line under the wheels
  const r = s * 0.2;
  const rear = x - s * 0.3;
  const front = x + s * 0.32;
  const wy = y - r;
  [rear, front].forEach((wx) => {
    c.strokeStyle = "#1c1c1c";
    c.lineWidth = s * 0.035;
    c.beginPath();
    c.arc(wx, wy, r, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = "#9ca3af";
    c.lineWidth = s * 0.006;
    for (let a = 0; a < 8; a++) {
      c.beginPath();
      c.moveTo(wx, wy);
      c.lineTo(wx + Math.cos((a * Math.PI) / 4) * r, wy + Math.sin((a * Math.PI) / 4) * r);
      c.stroke();
    }
  });
  // frame
  const crank: [number, number] = [x - s * 0.02, wy];
  const seat: [number, number] = [x - s * 0.1, y - s * 0.62];
  const head: [number, number] = [x + s * 0.24, y - s * 0.66];
  line(c, [rear, wy, crank[0], crank[1], seat[0], seat[1], rear, wy], "#d9480f", s * 0.03);
  line(c, [crank[0], crank[1], head[0], head[1], seat[0] + 0.01 * s, seat[1] + 0.04 * s], "#d9480f", s * 0.03);
  line(c, [head[0], head[1], front, wy], "#374151", s * 0.028);
  line(c, [head[0], head[1], head[0] + s * 0.05, head[1] - s * 0.08, head[0] + s * 0.11, head[1] - s * 0.06], "#111", s * 0.025);
  line(c, [seat[0] - s * 0.05, seat[1] - s * 0.01, seat[0] + s * 0.06, seat[1] - s * 0.01], "#111", s * 0.03);
  // rider
  const hip: [number, number] = [seat[0], seat[1] - s * 0.04];
  const shoulder: [number, number] = [x + s * 0.12, y - s * 1.08];
  line(c, [hip[0], hip[1], x + s * 0.06, y - s * 0.46, crank[0] + s * 0.06, crank[1] + s * 0.04], "#1e3a5f", s * 0.075);
  line(c, [hip[0], hip[1], x - s * 0.02, y - s * 0.42, crank[0] - s * 0.07, crank[1] - s * 0.02], "#274b75", s * 0.075);
  poly(
    c,
    [hip[0] - s * 0.06, hip[1] + s * 0.02, hip[0] + s * 0.05, hip[1] + s * 0.03, shoulder[0] + s * 0.06, shoulder[1] + s * 0.02, shoulder[0] - s * 0.05, shoulder[1] - s * 0.04],
    "#f4c430",
  );
  line(c, [shoulder[0], shoulder[1] + s * 0.02, head[0] + s * 0.02, head[1] - s * 0.1], "#f4c430", s * 0.055);
  circle(c, head[0] + s * 0.04, head[1] - s * 0.09, s * 0.03, "#a16a4a");
  ellipse(c, shoulder[0] + s * 0.07, shoulder[1] - s * 0.11, s * 0.075, s * 0.085, "#a16a4a");
  // helmet
  c.fillStyle = "#1d4ed8";
  c.beginPath();
  c.ellipse(shoulder[0] + s * 0.06, shoulder[1] - s * 0.15, s * 0.1, s * 0.07, -0.2, Math.PI, 0);
  c.fill();
}

function dog(c: Ctx, x: number, y: number, s: number) {
  const body = "#b7793f";
  const dark = "#6e4424";
  line(c, [x - s * 0.28, y - s * 0.28, x - s * 0.42, y - s * 0.05], body, s * 0.07);
  line(c, [x - s * 0.18, y - s * 0.26, x - s * 0.08, y - s * 0.02], body, s * 0.07);
  line(c, [x + s * 0.18, y - s * 0.28, x + s * 0.34, y - s * 0.06], body, s * 0.07);
  line(c, [x + s * 0.24, y - s * 0.3, x + s * 0.12, y - s * 0.02], body, s * 0.07);
  ellipse(c, x, y - s * 0.36, s * 0.34, s * 0.14, body);
  line(c, [x - s * 0.32, y - s * 0.4, x - s * 0.48, y - s * 0.56], body, s * 0.05);
  ellipse(c, x + s * 0.38, y - s * 0.52, s * 0.14, s * 0.12, body);
  ellipse(c, x + s * 0.5, y - s * 0.48, s * 0.08, s * 0.055, "#d9a066");
  circle(c, x + s * 0.57, y - s * 0.5, s * 0.022, "#1a1a1a");
  circle(c, x + s * 0.42, y - s * 0.56, s * 0.018, "#1a1a1a");
  ellipse(c, x + s * 0.3, y - s * 0.55, s * 0.05, s * 0.1, dark, 0.5);
}

// ---------- scenes ----------

const street: SceneDef = {
  id: "street",
  title: "City street, daytime",
  alt: "Drawn city street on a sunny day with a cyclist riding past trees and shopfronts",
  light: { t0: 1 / 640, lightK: 5500, motion: 0.6 },
  subject: {
    depth: 0.42,
    label: "cyclist",
    draw: (c) => cyclist(c, 0.52, 0.6, 0.2),
  },
  near: { depth: 0.1, label: "flower planter" },
  center: [0.53, 0.47],
  far: { depth: 0.88, label: "buildings" },
  layers: [
    {
      name: "sky",
      depth: 1,
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, 0.9, vgrad(c, Y0, 0.4, [[0, "#5d95cf"], [0.6, "#9cc3e6"], [1, "#e4eef6"]]));
        cloud(c, 0.18, 0.06, 1, "#f1f4f7");
        cloud(c, 0.78, 0.1, 0.8, "#eaeff4");
        cloud(c, 1.3, 0.0, 1.1, "#f1f4f7");
        cloud(c, -0.3, 0.12, 0.9, "#eaeff4");
      },
    },
    {
      name: "sun glow",
      depth: 1,
      hot: 2.6,
      draw: (c) => {
        circle(c, 1.32, -0.22, 0.12, rgrad(c, 1.32, -0.22, 0.12, [[0, "#ffffff"], [0.4, "#fffdf2"], [1, "rgba(255,250,235,0)"]]));
      },
    },
    {
      name: "buildings",
      depth: 0.88,
      draw: (c) => {
        const r = rng(7);
        const cols = ["#c98b6b", "#e6d5b8", "#8fa3b8", "#b56a5a", "#d9c7a3", "#7f8c99", "#e2b77f"];
        let x = X0;
        let i = 0;
        while (x < X1) {
          const w = 0.14 + r() * 0.12;
          const top = 0.06 + r() * 0.14;
          const col = cols[i % cols.length];
          rect(c, x, top, w + 0.002, 0.44 - top, col);
          rect(c, x, top, w + 0.002, 0.012, "rgba(0,0,0,0.12)");
          windows(c, x + 0.01, top + 0.03, w - 0.02, 0.36 - top, Math.max(2, Math.round(w / 0.05)), Math.max(3, Math.round((0.36 - top) / 0.045)), () =>
            r() > 0.15 ? "#3d4b5a" : "#8fb3d1",
          );
          x += w;
          i++;
        }
        // shop awnings at street level
        for (let k = -3; k < 9; k++) {
          const ax = k * 0.2 + 0.03;
          poly(c, [ax, 0.4, ax + 0.14, 0.4, ax + 0.155, 0.425, ax - 0.015, 0.425], k % 2 ? "#2f6f4f" : "#9b2f2f");
        }
      },
    },
    {
      name: "trees",
      depth: 0.66,
      draw: (c) => {
        for (let k = -3; k < 8; k++) tree(c, k * 0.26 + 0.02, 0.47, 0.24, "#5f9a4f", "#3f7a3a");
      },
    },
    {
      name: "ground",
      depth: { y0: 0.43, d0: 0.7, y1: 1.12, d1: 0.05 },
      draw: (c) => {
        rect(c, X0, 0.43, X1 - X0, 0.06, "#c9c3b6");
        rect(c, X0, 0.487, X1 - X0, Y1 - 0.487, vgrad(c, 0.487, 1.1, [[0, "#6b6f75"], [1, "#4b4f55"]]));
        rect(c, X0, 0.487, X1 - X0, 0.008, "#d8d3c7");
        for (let k = -6; k < 14; k++) poly(c, [k * 0.14, 0.62, k * 0.14 + 0.07, 0.62, k * 0.14 + 0.075, 0.635, k * 0.14 - 0.005, 0.635], "#f1e7c8");
        rect(c, X0, 0.9, X1 - X0, Y1 - 0.9, vgrad(c, 0.9, 1.1, [[0, "#b9b2a4"], [1, "#a39b8c"]]));
        const r = rng(3);
        for (let k = 0; k < 40; k++) rect(c, X0 + r() * (X1 - X0), 0.92 + r() * 0.25, 0.08, 0.003, "rgba(0,0,0,0.15)");
      },
    },
    {
      name: "planter",
      depth: 0.1,
      draw: (c) => {
        poly(c, [-0.02, 0.66, 0.2, 0.66, 0.18, 0.8, 0.0, 0.8], "#7b4b2a");
        rect(c, -0.03, 0.645, 0.24, 0.022, "#8d5a35");
        const r = rng(11);
        for (let k = 0; k < 26; k++) {
          const fx = -0.01 + r() * 0.2;
          const fy = 0.5 + r() * 0.14;
          line(c, [fx, fy, fx + (r() - 0.5) * 0.02, 0.65], "#3f7a3a", 0.004);
          const col = ["#e03131", "#f59f00", "#f06595", "#eeeeee"][k % 4];
          circle(c, fx, fy, 0.012 + r() * 0.006, col);
          circle(c, fx, fy, 0.004, "#ffd43b");
        }
      },
    },
  ],
};

const night: SceneDef = {
  id: "night",
  title: "Street at night",
  alt: "Drawn street at night with lamps, lit windows and a person walking",
  light: { t0: 1 / 2, lightK: 3400, motion: 0.09 },
  subject: {
    depth: 0.45,
    label: "person walking",
    draw: (c) => person(c, 0.52, 0.63, 0.27, { skin: "#c68863", hair: "#2b1d14", top: "#8a2d3b", legs: "#2a2f3a", stride: 0.8, bag: "#d6b37a" }),
  },
  near: { depth: 0.12, label: "railing" },
  center: [0.52, 0.5],
  far: { depth: 0.9, label: "sky and rooftops" },
  layers: [
    {
      name: "sky",
      depth: 1,
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, 0.9, vgrad(c, Y0, 0.42, [[0, "#070b1a"], [0.7, "#1b2340"], [1, "#3a3150"]]));
        const r = rng(5);
        for (let k = 0; k < 60; k++) circle(c, X0 + r() * (X1 - X0), Y0 + r() * 0.5, 0.0015 + r() * 0.0015, "#c9d1e6");
        circle(c, 1.1, -0.16, 0.035, "#e9e4d0");
      },
    },
    {
      name: "buildings",
      depth: 0.88,
      draw: (c) => {
        const r = rng(9);
        let x = X0;
        while (x < X1) {
          const w = 0.13 + r() * 0.14;
          const top = 0.04 + r() * 0.16;
          rect(c, x, top, w + 0.002, 0.5 - top, r() > 0.5 ? "#1c1e29" : "#23202a");
          x += w;
        }
      },
    },
    {
      name: "lit windows",
      depth: 0.88,
      draw: (c) => {
        const r = rng(9);
        let x = X0;
        while (x < X1) {
          const w = 0.13 + r() * 0.14;
          const top = 0.04 + r() * 0.16;
          r();
          const rr = rng(Math.floor(x * 1000) + 50);
          windows(c, x + 0.01, top + 0.03, w - 0.02, 0.4 - top, Math.max(2, Math.round(w / 0.05)), Math.max(3, Math.round((0.4 - top) / 0.05)), () =>
            rr() > 0.55 ? (rr() > 0.5 ? "#e8b460" : "#efc98a") : null,
          );
          x += w;
        }
      },
    },
    {
      name: "street",
      depth: { y0: 0.48, d0: 0.75, y1: 1.12, d1: 0.05 },
      draw: (c) => {
        rect(c, X0, 0.48, X1 - X0, 0.05, "#2b2b30");
        rect(c, X0, 0.53, X1 - X0, Y1 - 0.53, vgrad(c, 0.53, 1.1, [[0, "#1f2127"], [1, "#121317"]]));
        // wet reflections of lamps and windows
        for (let k = -2; k < 6; k++) {
          const lx = k * 0.36 + 0.1;
          rect(c, lx + 0.02, 0.55, 0.02, 0.3, vgrad(c, 0.55, 0.85, [[0, "rgba(255,200,120,0.35)"], [1, "rgba(255,200,120,0)"]]));
        }
        for (let k = -6; k < 14; k++) poly(c, [k * 0.14, 0.7, k * 0.14 + 0.07, 0.7, k * 0.14 + 0.075, 0.713, k * 0.14 - 0.005, 0.713], "#6d6a5c");
      },
    },
    {
      name: "lamp posts",
      depth: 0.6,
      draw: (c) => {
        for (let k = -2; k < 6; k++) {
          const lx = k * 0.36 + 0.1;
          rect(c, lx - 0.004, 0.2, 0.008, 0.32, "#3a3a40");
          line(c, [lx, 0.2, lx + 0.03, 0.19], "#3a3a40", 0.006);
        }
      },
    },
    {
      name: "lamps",
      depth: 0.6,
      hot: 2.4,
      draw: (c) => {
        for (let k = -2; k < 6; k++) {
          const lx = k * 0.36 + 0.13;
          circle(c, lx, 0.197, 0.05, rgrad(c, lx, 0.197, 0.05, [[0, "rgba(255,236,190,1)"], [0.25, "rgba(255,214,150,0.9)"], [1, "rgba(255,190,110,0)"]]));
          circle(c, lx, 0.197, 0.01, "#fff8e8");
        }
      },
    },
    {
      name: "railing",
      depth: 0.12,
      draw: (c) => {
        rect(c, X0, 0.84, X1 - X0, 0.012, "#50525a");
        for (let k = -40; k < 80; k++) rect(c, k * 0.035, 0.846, 0.006, 0.4, "#3c3e45");
      },
    },
  ],
};

const portrait: SceneDef = {
  id: "portrait",
  title: "Portrait in a park",
  alt: "Drawn head and shoulders portrait of a person in a park with a bright sky behind",
  light: { t0: 1 / 400, lightK: 5600, motion: 0.015 },
  subject: {
    depth: 0.25,
    label: "face",
    draw: (c) => {
      // shoulders and shirt
      poly(c, [0.3, 0.76, 0.34, 0.58, 0.44, 0.53, 0.56, 0.53, 0.66, 0.58, 0.7, 0.76], "#2f5d8a");
      poly(c, [0.46, 0.53, 0.54, 0.53, 0.5, 0.6], "#9b6a4c");
      // neck
      rect(c, 0.47, 0.44, 0.06, 0.1, "#9b6a4c");
      // hair back
      ellipse(c, 0.5, 0.33, 0.1, 0.12, "#1f1510");
      // face
      ellipse(c, 0.5, 0.36, 0.075, 0.1, "#a8704f");
      ellipse(c, 0.47, 0.37, 0.03, 0.05, "rgba(255,210,180,0.15)");
      // hair front
      c.fillStyle = "#1f1510";
      c.beginPath();
      c.ellipse(0.5, 0.29, 0.085, 0.055, 0, Math.PI, 0);
      c.fill();
      ellipse(c, 0.44, 0.31, 0.03, 0.05, "#1f1510", 0.4);
      // features
      ellipse(c, 0.473, 0.355, 0.009, 0.006, "#2b1a12");
      ellipse(c, 0.527, 0.355, 0.009, 0.006, "#2b1a12");
      line(c, [0.463, 0.338, 0.483, 0.335], "#2b1a12", 0.004);
      line(c, [0.517, 0.335, 0.537, 0.338], "#2b1a12", 0.004);
      line(c, [0.5, 0.36, 0.495, 0.395, 0.505, 0.398], "#7d4f37", 0.004);
      c.strokeStyle = "#6b2f2a";
      c.lineWidth = 0.005;
      c.beginPath();
      c.arc(0.5, 0.405, 0.02, 0.2, Math.PI - 0.2);
      c.stroke();
      ellipse(c, 0.425, 0.37, 0.01, 0.022, "#9b6a4c");
      ellipse(c, 0.575, 0.37, 0.01, 0.022, "#9b6a4c");
    },
  },
  near: { depth: 0.08, label: "leaves in front" },
  far: { depth: 0.85, label: "trees behind" },
  layers: [
    {
      name: "sky",
      depth: 1,
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, 0.9, vgrad(c, Y0, 0.4, [[0, "#a3c2de"], [0.7, "#cbdbe6"], [1, "#d8d8cc"]]));
        cloud(c, 0.2, 0.05, 1, "#e9eef2");
        cloud(c, 0.9, 0.0, 1.3, "#e9eef2");
      },
    },
    {
      name: "far trees",
      depth: 0.9,
      draw: (c) => {
        const r = rng(21);
        for (let k = 0; k < 30; k++) {
          const x = X0 + r() * (X1 - X0);
          circle(c, x, 0.3 + r() * 0.06, 0.05 + r() * 0.05, r() > 0.5 ? "#6a9a5b" : "#7fae66");
        }
        rect(c, X0, 0.34, X1 - X0, 0.1, "#6a9a5b");
      },
    },
    {
      name: "mid trees",
      depth: 0.72,
      draw: (c) => {
        for (let k = -2; k < 5; k++) tree(c, k * 0.38 + 0.08, 0.55, 0.38, "#4f8a45", "#35683a");
      },
    },
    {
      name: "lawn",
      depth: { y0: 0.45, d0: 0.8, y1: 1.12, d1: 0.2 },
      draw: (c) => {
        rect(c, X0, 0.45, X1 - X0, Y1 - 0.45, vgrad(c, 0.45, 1.1, [[0, "#8dbb6a"], [1, "#5f8f45"]]));
        rect(c, X0, 0.5, X1 - X0, 0.02, "#c9b98f");
      },
    },
    {
      name: "foreground leaves",
      depth: 0.08,
      draw: (c) => {
        const r = rng(4);
        for (let k = 0; k < 16; k++) {
          const x = 0.85 + r() * 0.35;
          const y = -0.05 + r() * 0.3;
          ellipse(c, x, y, 0.05, 0.02, k % 2 ? "#2f6b34" : "#3f7f3a", r() * 3);
        }
      },
    },
  ],
};

const food: SceneDef = {
  id: "food",
  title: "Dinner table",
  alt: "Drawn overhead view of a plate of pasta, a cup and cutlery on a wooden table under warm light",
  light: { t0: 1 / 25, lightK: 3000, motion: 0 },
  subject: {
    depth: 0.3,
    label: "plate",
    draw: (c) => {
      ellipse(c, 0.5, 0.39, 0.2, 0.19, "rgba(0,0,0,0.18)");
      circle(c, 0.49, 0.38, 0.19, "#f4f1ea");
      circle(c, 0.49, 0.38, 0.14, "#e6e1d5");
      // pasta
      const r = rng(14);
      for (let k = 0; k < 70; k++) {
        const a = r() * Math.PI * 2;
        const d = r() * 0.1;
        const x = 0.49 + Math.cos(a) * d;
        const y = 0.38 + Math.sin(a) * d;
        c.strokeStyle = k % 3 ? "#e8b44d" : "#d99a2b";
        c.lineWidth = 0.006;
        c.beginPath();
        c.arc(x, y, 0.02 + r() * 0.02, r() * 6, r() * 6 + 2);
        c.stroke();
      }
      // sauce and basil
      for (let k = 0; k < 9; k++) circle(c, 0.44 + r() * 0.1, 0.33 + r() * 0.1, 0.012 + r() * 0.01, "#b8321f");
      for (let k = 0; k < 4; k++) ellipse(c, 0.46 + r() * 0.07, 0.35 + r() * 0.06, 0.018, 0.009, "#2f8a3a", r() * 3);
      for (let k = 0; k < 14; k++) circle(c, 0.43 + r() * 0.12, 0.33 + r() * 0.1, 0.003, "#f6f0dc");
    },
  },
  near: { depth: 0.18, label: "cutlery" },
  far: { depth: 0.55, label: "back of the table" },
  layers: [
    {
      name: "table",
      depth: { y0: -0.4, d0: 0.6, y1: 1.1, d1: 0.15 },
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, Y1 - Y0, vgrad(c, Y0, Y1, [[0, "#6a4228"], [1, "#8a5a37"]]));
        for (let k = -20; k < 40; k++) {
          rect(c, X0, k * 0.05, X1 - X0, 0.0025, "rgba(40,20,10,0.35)");
        }
        const r = rng(8);
        for (let k = 0; k < 120; k++) rect(c, X0 + r() * (X1 - X0), Y0 + r() * (Y1 - Y0), 0.06 + r() * 0.12, 0.0015, "rgba(255,220,180,0.1)");
      },
    },
    {
      name: "napkin and cutlery",
      depth: 0.2,
      draw: (c) => {
        poly(c, [0.12, 0.2, 0.25, 0.18, 0.28, 0.6, 0.15, 0.62], "#c9d6c3");
        line(c, [0.18, 0.24, 0.2, 0.58], "#c7c9cc", 0.012);
        line(c, [0.23, 0.23, 0.24, 0.57], "#c7c9cc", 0.01);
        line(c, [0.72, 0.2, 0.74, 0.6], "#c7c9cc", 0.012);
      },
    },
    {
      name: "cup",
      depth: 0.3,
      draw: (c) => {
        circle(c, 0.86, 0.18, 0.09, "#ece8df");
        circle(c, 0.86, 0.18, 0.068, "#5a3620");
        circle(c, 0.86, 0.18, 0.05, "#7a4c2c");
        ellipse(c, 0.86, 0.18, 0.03, 0.02, "#c89b6d");
        rect(c, 0.94, 0.165, 0.04, 0.03, "#ece8df");
        circle(c, 0.86, 0.46, 0.06, "#e9dfc9");
        circle(c, 0.86, 0.46, 0.045, "#caa46a");
      },
    },
    {
      name: "candle glow",
      depth: 0.4,
      hot: 2.2,
      draw: (c) => {
        circle(c, 0.1, 0.02, 0.05, rgrad(c, 0.1, 0.02, 0.05, [[0, "#fffaf0"], [0.3, "#ffe3b0"], [1, "rgba(255,200,120,0)"]]));
      },
    },
  ],
};

const landscape: SceneDef = {
  id: "landscape",
  title: "Mountain lake at golden hour",
  alt: "Drawn mountain lake at golden hour with a hiker on a rock and a bright sky",
  light: { t0: 1 / 800, lightK: 4800, motion: 0.02 },
  subject: {
    depth: 0.35,
    label: "hiker",
    draw: (c) => person(c, 0.62, 0.62, 0.12, { skin: "#b07a58", hair: "#3a2a1c", top: "#c2410c", legs: "#374151", stride: 0.2, bag: "#1f3a2c" }),
  },
  near: { depth: 0.08, label: "grass" },
  center: [0.6, 0.5],
  far: { depth: 0.95, label: "mountains" },
  layers: [
    {
      name: "sky",
      depth: 1,
      hot: 0.3,
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, 0.8, vgrad(c, Y0, 0.3, [[0, "#6f8fbf"], [0.55, "#f2c48d"], [1, "#fbe3b9"]]));
        cloud(c, 0.1, 0.02, 1.2, "#f7d7b0");
        cloud(c, 0.8, -0.05, 1.4, "#f5cfa6");
      },
    },
    {
      name: "sun",
      depth: 1,
      hot: 3,
      draw: (c) => {
        circle(c, 0.3, 0.17, 0.09, rgrad(c, 0.3, 0.17, 0.09, [[0, "#ffffff"], [0.3, "#fff6e0"], [1, "rgba(255,230,190,0)"]]));
      },
    },
    {
      name: "mountains",
      depth: 0.95,
      draw: (c) => {
        poly(c, [X0, 0.34, -0.3, 0.12, -0.05, 0.28, 0.2, 0.06, 0.45, 0.25, 0.7, 0.03, 0.95, 0.22, 1.2, 0.1, X1, 0.3, X1, 0.4, X0, 0.4], "#6b6f8f");
        poly(c, [0.2, 0.06, 0.26, 0.11, 0.22, 0.12, 0.17, 0.1], "#f1f1f5");
        poly(c, [0.7, 0.03, 0.77, 0.09, 0.72, 0.1, 0.66, 0.08], "#f1f1f5");
        poly(c, [X0, 0.38, -0.1, 0.25, 0.35, 0.33, 0.8, 0.24, 1.3, 0.34, X1, 0.3, X1, 0.42, X0, 0.42], "#4f5f6f");
      },
    },
    {
      name: "forest",
      depth: 0.8,
      draw: (c) => {
        const r = rng(31);
        for (let k = 0; k < 90; k++) {
          const x = X0 + (k / 90) * (X1 - X0);
          const h = 0.05 + r() * 0.04;
          poly(c, [x - 0.018, 0.42, x, 0.42 - h, x + 0.018, 0.42], "#1f4030");
        }
      },
    },
    {
      name: "lake",
      depth: { y0: 0.42, d0: 0.8, y1: 0.62, d1: 0.45 },
      hot: 0.3,
      draw: (c) => {
        rect(c, X0, 0.42, X1 - X0, 0.22, vgrad(c, 0.42, 0.64, [[0, "#e8c9a0"], [0.4, "#8fa1b8"], [1, "#4f6378"]]));
        for (let k = 0; k < 30; k++) rect(c, X0 + (k * 0.37) % (X1 - X0), 0.44 + (k % 7) * 0.025, 0.1, 0.002, "rgba(255,240,210,0.5)");
        ellipse(c, 0.3, 0.47, 0.012, 0.045, "rgba(255,245,220,0.45)");
      },
    },
    {
      name: "rocks",
      depth: { y0: 0.55, d0: 0.4, y1: 1.1, d1: 0.08 },
      draw: (c) => {
        poly(c, [X0, 0.66, 0.2, 0.6, 0.5, 0.63, 0.8, 0.6, X1, 0.64, X1, Y1, X0, Y1], "#5a5047");
        poly(c, [0.52, 0.64, 0.58, 0.61, 0.7, 0.6, 0.76, 0.64], "#6e6257");
        rect(c, X0, 0.72, X1 - X0, Y1 - 0.72, vgrad(c, 0.72, 1.1, [[0, "#617a3c"], [1, "#3d5226"]]));
        const r = rng(2);
        for (let k = 0; k < 160; k++) {
          const x = X0 + r() * (X1 - X0);
          const y = 0.72 + r() * 0.45;
          line(c, [x, y, x + (r() - 0.5) * 0.02, y - 0.02 - r() * 0.03], r() > 0.5 ? "#8aa052" : "#4f6a2c", 0.003);
        }
      },
    },
  ],
};

const indoor: SceneDef = {
  id: "indoor",
  title: "Living room in the evening",
  alt: "Drawn living room lit by a warm lamp with a dog running across a rug",
  light: { t0: 1 / 10, lightK: 2900, motion: 0.4 },
  subject: {
    depth: 0.4,
    label: "dog",
    draw: (c) => dog(c, 0.5, 0.64, 0.22),
  },
  near: { depth: 0.1, label: "cushion" },
  far: { depth: 0.8, label: "window" },
  layers: [
    {
      name: "walls",
      depth: 0.85,
      draw: (c) => {
        rect(c, X0, Y0, X1 - X0, 0.95, vgrad(c, Y0, 0.5, [[0, "#b8a88f"], [1, "#d9c9ad"]]));
        // frames
        rect(c, 0.12, 0.05, 0.16, 0.12, "#3b3a36");
        rect(c, 0.13, 0.06, 0.14, 0.1, "#6f8f9f");
        rect(c, 0.32, 0.08, 0.08, 0.1, "#3b3a36");
        rect(c, 0.33, 0.09, 0.06, 0.08, "#c2855d");
      },
    },
    {
      name: "window",
      depth: 0.8,
      hot: 0.6,
      draw: (c) => {
        rect(c, 0.62, -0.05, 0.34, 0.36, "#2d3d5c");
        rect(c, 0.63, -0.04, 0.32, 0.34, vgrad(c, -0.04, 0.3, [[0, "#35507a"], [1, "#7a7fa0"]]));
        rect(c, 0.785, -0.04, 0.01, 0.34, "#2d3d5c");
        rect(c, 0.63, 0.12, 0.32, 0.01, "#2d3d5c");
      },
    },
    {
      name: "floor",
      depth: { y0: 0.5, d0: 0.75, y1: 1.12, d1: 0.08 },
      draw: (c) => {
        rect(c, X0, 0.5, X1 - X0, Y1 - 0.5, vgrad(c, 0.5, 1.1, [[0, "#8a6242"], [1, "#6a472e"]]));
        for (let k = -20; k < 40; k++) rect(c, k * 0.09, 0.5, 0.002, Y1, "rgba(40,20,10,0.3)");
        ellipse(c, 0.5, 0.68, 0.5, 0.12, "#8b3a3a");
        ellipse(c, 0.5, 0.68, 0.44, 0.095, "#a0513d");
        ellipse(c, 0.5, 0.68, 0.3, 0.06, "#b86a4a");
      },
    },
    {
      name: "sofa",
      depth: 0.7,
      draw: (c) => {
        rect(c, -0.35, 0.3, 0.72, 0.18, "#3f5b6b");
        rect(c, -0.38, 0.4, 0.78, 0.16, "#4a6a7c");
        rect(c, -0.4, 0.36, 0.06, 0.2, "#3a5566");
        rect(c, 0.34, 0.36, 0.06, 0.2, "#3a5566");
        rect(c, 1.05, 0.3, 0.5, 0.26, "#6b4f3a");
        rect(c, 1.07, 0.32, 0.46, 0.08, "#7d5d45");
      },
    },
    {
      name: "lamp",
      depth: 0.68,
      draw: (c) => {
        rect(c, 0.465, 0.2, 0.01, 0.35, "#2a2a2a");
        ellipse(c, 0.47, 0.55, 0.05, 0.012, "#2a2a2a");
      },
    },
    {
      name: "lamp shade",
      depth: 0.68,
      hot: 1.3,
      draw: (c) => {
        circle(c, 0.47, 0.17, 0.11, rgrad(c, 0.47, 0.17, 0.11, [[0, "rgba(255,226,170,0.9)"], [1, "rgba(255,210,150,0)"]]));
        poly(c, [0.42, 0.12, 0.52, 0.12, 0.55, 0.21, 0.39, 0.21], "#fff1d6");
      },
    },
    {
      name: "cushion",
      depth: 0.1,
      draw: (c) => {
        ellipse(c, 0.05, 0.88, 0.16, 0.08, "#c9a23f", -0.2);
        ellipse(c, 0.05, 0.88, 0.12, 0.05, "#dbb95a", -0.2);
      },
    },
  ],
};

export const SCENES: Record<SceneId, SceneDef> = { street, night, portrait, food, landscape, indoor };
