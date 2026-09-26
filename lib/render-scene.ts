/**
 * Renders a SceneDef into three canvases the simulator uploads as textures:
 *  - color:   the scene without the subject (opaque)
 *  - data:    R = depth (0 near, 1 far), G = hot / 4 (extra stops above white)
 *  - subject: the subject alone on a transparent background
 */

import type { DepthSpec, SceneDef } from "./scenes";

export const ASPECT = 0.75; // height / width (4:3 sensor)

export type ViewOptions = {
  /** Pixel width of the output. */
  width: number;
  /** Magnification relative to the main (1x) camera. 0.5 = ultra-wide. */
  zoom?: number;
  /**
   * Keep the subject the same size and move the camera instead
   * (shows perspective compression on tele, exaggeration on ultra-wide).
   */
  compress?: boolean;
  /** Resolution factor below 1 simulates digital zoom detail loss. */
  detail?: number;
};

export type RenderedScene = {
  color: HTMLCanvasElement;
  data: HTMLCanvasElement;
  subject: HTMLCanvasElement;
  width: number;
  height: number;
};

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function avgDepth(d: DepthSpec) {
  return typeof d === "number" ? d : (d.d0 + d.d1) / 2;
}

/** Map a 0..1 depth to a distance relative to the subject (subject = 1). */
function distance(depth: number, subjectDepth: number) {
  return Math.pow(2, (depth - subjectDepth) * 5);
}

function layerMagnification(zoom: number, compress: boolean, depth: number, subjectDepth: number) {
  if (!compress) return zoom;
  const d = distance(depth, subjectDepth);
  const shift = zoom - 1; // camera moves back (tele) or forward (ultra-wide)
  const denom = Math.max(d + shift, d * 0.12);
  return Math.min(zoom * 4, (zoom * d) / denom);
}

export function renderScene(scene: SceneDef, opts: ViewOptions): RenderedScene {
  const zoom = opts.zoom ?? 1;
  const detail = Math.max(0.05, Math.min(1, opts.detail ?? 1));
  const W = Math.max(8, Math.round(opts.width * detail));
  const H = Math.max(6, Math.round(W * ASPECT));
  // Zooming in drifts towards the scene's point of interest; 1x stays framed as drawn.
  const [tx, ty] = scene.center ?? [0.5, ASPECT / 2];
  const pull = Math.max(0, 1 - 1 / zoom);
  const cx = 0.5 + (tx - 0.5) * pull;
  const cy = ASPECT / 2 + (ty - ASPECT / 2) * pull;

  const color = makeCanvas(W, H);
  const data = makeCanvas(W, H);
  const subject = makeCanvas(W, H);
  const tmp = makeCanvas(W, H);
  const cc = color.getContext("2d")!;
  const dc = data.getContext("2d")!;
  const sc = subject.getContext("2d")!;
  const tc = tmp.getContext("2d")!;

  dc.fillStyle = "rgb(255,0,0)";
  dc.fillRect(0, 0, W, H);
  cc.fillStyle = "#000";
  cc.fillRect(0, 0, W, H);

  const setView = (ctx: CanvasRenderingContext2D, m: number) => {
    ctx.setTransform(W * m, 0, 0, W * m, W * (0.5 - cx * m), W * (ASPECT / 2 - cy * m));
  };

  for (const layer of scene.layers) {
    const m = layerMagnification(zoom, !!opts.compress, avgDepth(layer.depth), scene.subject.depth);
    // colour
    setView(cc, m);
    layer.draw(cc);
    // depth and hot data: silhouette of the layer filled with its data colour
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.globalCompositeOperation = "source-over";
    tc.clearRect(0, 0, W, H);
    setView(tc, m);
    layer.draw(tc);
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.globalCompositeOperation = "source-in";
    const g = Math.round(((layer.hot ?? 0) / 4) * 255);
    if (typeof layer.depth === "number") {
      tc.fillStyle = `rgb(${Math.round(layer.depth * 255)},${g},0)`;
    } else {
      const { y0, d0, y1, d1 } = layer.depth;
      const py0 = W * ((y0 - cy) * m + ASPECT / 2);
      const py1 = W * ((y1 - cy) * m + ASPECT / 2);
      const grad = tc.createLinearGradient(0, py0, 0, py1);
      grad.addColorStop(0, `rgb(${Math.round(d0 * 255)},${g},0)`);
      grad.addColorStop(1, `rgb(${Math.round(d1 * 255)},${g},0)`);
      tc.fillStyle = grad;
    }
    tc.fillRect(0, 0, W, H);
    tc.globalCompositeOperation = "source-over";
    dc.drawImage(tmp, 0, 0);
  }

  const sm = layerMagnification(zoom, !!opts.compress, scene.subject.depth, scene.subject.depth);
  setView(sc, sm);
  scene.subject.draw(sc);

  return { color, data, subject, width: W, height: H };
}
