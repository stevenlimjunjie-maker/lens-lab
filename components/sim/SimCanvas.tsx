"use client";

import { useEffect, useRef, useState } from "react";
import { SCENES, type SceneId } from "@/lib/scenes";
import { ASPECT, renderScene, type RenderedScene } from "@/lib/render-scene";
import { whiteBalanceGains } from "@/lib/color";
import type { Stats } from "@/lib/exposure";
import { FRAG, VERT } from "./shader";

export type SimParams = {
  stops: number;
  /** Camera white balance in Kelvin; defaults to the scene light (neutral). */
  wbK?: number;
  noise: number;
  chroma?: number;
  motion: number;
  shake: number;
  dof: number;
  /** Focus depth; defaults to the subject depth. */
  focus?: number;
  zebra?: boolean;
  peaking?: boolean;
  raw?: boolean;
  highlights?: number;
  shadows?: number;
  distort?: number;
  vignette?: number;
  seed?: number;
};

export type SimView = {
  zoom?: number;
  compress?: boolean;
  detail?: number;
};

type Props = {
  scene: SceneId;
  params: SimParams;
  view?: SimView;
  onStats?: (s: Stats) => void;
  /** Accessible description of what the image currently shows. */
  label: string;
  className?: string;
  /** Maximum device pixel width of the render. */
  maxWidth?: number;
  children?: React.ReactNode;
};

type GLState = {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  tex: WebGLTexture[];
  uni: Record<string, WebGLUniformLocation | null>;
  fbo: WebGLFramebuffer;
  fboTex: WebGLTexture;
};

const STATS_W = 128;
const STATS_H = 96;

const UNIFORMS = [
  "uColor", "uData", "uSubj", "uAspect", "uStops", "uWB", "uNoise", "uChroma", "uSeed", "uGrain", "uMotion", "uShake",
  "uDof", "uFocus", "uSubjDepth", "uZebra", "uPeak", "uRaw", "uHighlights", "uShadows", "uDistort", "uVignette", "uTexel",
];

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "shader compile failed");
  }
  return s;
}

function initGL(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  try {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link failed");
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = [0, 1, 2].map(() => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    });
    const uni: GLState["uni"] = {};
    UNIFORMS.forEach((u) => (uni[u] = gl.getUniformLocation(prog, u)));
    gl.uniform1i(uni.uColor, 0);
    gl.uniform1i(uni.uData, 1);
    gl.uniform1i(uni.uSubj, 2);
    const fboTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, STATS_W, STATS_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { gl, prog, tex, uni, fbo, fboTex };
  } catch (e) {
    console.error(e);
    return null;
  }
}

function upload(st: GLState, r: RenderedScene) {
  const { gl } = st;
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  [r.color, r.data, r.subject].forEach((c, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, st.tex[i]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, i === 2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  });
}

function computeStats(px: Uint8Array): Stats {
  const bins = new Array(64).fill(0);
  let sum = 0;
  let clipped = 0;
  let crushed = 0;
  const n = px.length / 4;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    bins[Math.min(63, Math.floor(l * 64))]++;
    sum += l;
    if (Math.max(r, g, b) >= 251) clipped++;
    if (l < 0.03) crushed++;
  }
  return { hist: bins.map((b) => b / n), mean: sum / n, clipped: clipped / n, crushed: crushed / n };
}

/** Real time photo simulator canvas. */
export function SimCanvas({ scene, params, view, onStats, label, className = "", maxWidth = 1400, children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GLState | null>(null);
  const renderedRef = useRef<{ key: string; r: RenderedScene } | null>(null);
  const [pxWidth, setPxWidth] = useState(0);
  const [fallback, setFallback] = useState(false);
  const statsRef = useRef(onStats);
  const frame = useRef(0);

  useEffect(() => {
    statsRef.current = onStats;
  }, [onStats]);

  // Track size.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(Math.min(el.clientWidth * dpr, maxWidth));
      setPxWidth((prev) => (Math.abs(prev - w) > 4 ? w : prev));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxWidth]);

  const zoom = view?.zoom ?? 1;
  const compress = !!view?.compress;
  const detail = view?.detail ?? 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pxWidth === 0) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const def = SCENES[scene];
      const w = pxWidth;
      const h = Math.round(w * ASPECT);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (!glRef.current && !fallback) {
        glRef.current = initGL(canvas);
        if (!glRef.current) {
          setFallback(true);
          return;
        }
      }
      const key = `${scene}|${w}|${zoom.toFixed(3)}|${compress}|${detail.toFixed(3)}`;
      if (!renderedRef.current || renderedRef.current.key !== key) {
        const r = renderScene(def, { width: w, zoom, compress, detail });
        renderedRef.current = { key, r };
        if (glRef.current) upload(glRef.current, r);
      }
      const st = glRef.current;
      if (!st) return;
      const { gl, uni } = st;
      const wb = whiteBalanceGains(def.light.lightK, params.wbK ?? def.light.lightK);
      const grain = Math.max(1, Math.round((w / 800) * 1.5));
      gl.uniform1f(uni.uAspect, ASPECT);
      gl.uniform1f(uni.uStops, params.stops);
      gl.uniform3f(uni.uWB, wb[0], wb[1], wb[2]);
      gl.uniform1f(uni.uNoise, params.noise);
      gl.uniform1f(uni.uChroma, params.chroma ?? Math.min(1, params.noise * 10));
      gl.uniform1f(uni.uSeed, params.seed ?? 1);
      gl.uniform1f(uni.uGrain, grain);
      gl.uniform1f(uni.uMotion, params.motion);
      gl.uniform2f(uni.uShake, params.shake * 0.8, params.shake * 0.45);
      gl.uniform1f(uni.uDof, params.dof);
      gl.uniform1f(uni.uFocus, params.focus ?? def.subject.depth);
      gl.uniform1f(uni.uSubjDepth, def.subject.depth);
      gl.uniform1f(uni.uRaw, params.raw ? 1 : 0);
      gl.uniform1f(uni.uHighlights, params.highlights ?? 0);
      gl.uniform1f(uni.uShadows, params.shadows ?? 0);
      gl.uniform1f(uni.uDistort, params.distort ?? 0);
      gl.uniform1f(uni.uVignette, params.vignette ?? 0);
      const r = renderedRef.current!.r;
      gl.uniform2f(uni.uTexel, 1 / r.width, 1 / r.height);

      if (statsRef.current) {
        gl.uniform1f(uni.uZebra, 0);
        gl.uniform1f(uni.uPeak, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, st.fbo);
        gl.viewport(0, 0, STATS_W, STATS_H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        const px = new Uint8Array(STATS_W * STATS_H * 4);
        gl.readPixels(0, 0, STATS_W, STATS_H, gl.RGBA, gl.UNSIGNED_BYTE, px);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        statsRef.current(computeStats(px));
      }
      gl.uniform1f(uni.uZebra, params.zebra ? 1 : 0);
      gl.uniform1f(uni.uPeak, params.peaking ? 1 : 0);
      gl.viewport(0, 0, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }, [scene, pxWidth, zoom, compress, detail, params, fallback]);

  // Canvas 2D fallback when WebGL2 is unavailable: exposure and blur only.
  useEffect(() => {
    if (!fallback) return;
    const canvas = canvasRef.current;
    if (!canvas || pxWidth === 0) return;
    const def = SCENES[scene];
    const w = pxWidth;
    const h = Math.round(w * ASPECT);
    const r = renderScene(def, { width: w, zoom, compress, detail });
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = w;
    canvas.height = h;
    const blurPx = Math.max(params.motion, params.shake) * w * 0.3 + params.dof * w * 0.2;
    ctx.filter = `brightness(${Math.pow(2, params.stops / 2.2).toFixed(3)}) blur(${blurPx.toFixed(1)}px)`;
    ctx.drawImage(r.color, 0, 0, w, h);
    ctx.drawImage(r.subject, 0, 0, w, h);
    ctx.filter = "none";
  }, [fallback, scene, pxWidth, zoom, compress, detail, params]);

  useEffect(() => {
    const f = frame;
    return () => cancelAnimationFrame(f.current);
  }, []);

  return (
    <div ref={wrapRef} className={`relative w-full overflow-hidden rounded-md bg-zinc-900 ${className}`} style={{ aspectRatio: "4 / 3" }}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="block h-full w-full" />
      {children}
    </div>
  );
}
