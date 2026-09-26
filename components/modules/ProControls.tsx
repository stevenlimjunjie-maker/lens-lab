"use client";

import { useEffect, useMemo, useState } from "react";
import { SimCanvas } from "@/components/sim/SimCanvas";
import { RangeSlider, Segmented, Toggle } from "@/components/ui/Controls";
import { Callout } from "@/components/ui/Section";
import { METERING, WB_PRESETS } from "@/lib/content";
import { kelvinCss } from "@/lib/color";
import { formatEv } from "@/lib/exposure";
import { SCENES, type SceneId } from "@/lib/scenes";
import { ASPECT, renderScene } from "@/lib/render-scene";

// ------------------------------------------------------------ white balance

const WB_TRACK = `linear-gradient(to right, ${[2500, 3500, 4500, 5500, 6500, 8000, 10000].map((k) => kelvinCss(k)).join(", ")})`;

export function WhiteBalanceDemo() {
  const [scene, setScene] = useState<SceneId>("food");
  const [k, setK] = useState(5500);
  const light = SCENES[scene].light.lightK;
  const diff = k - light;
  const params = useMemo(() => ({ stops: 0.1, noise: 0.005, motion: 0, shake: 0, dof: 0.0015, wbK: k }), [k]);
  const cast = Math.abs(diff) < 350 ? "neutral" : diff > 0 ? "too warm (orange)" : "too cool (blue)";
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <SimCanvas scene={scene} params={params} label={`${SCENES[scene].alt}, white balance set to ${k}K, colours look ${cast}.`} />
      <div className="grid content-start gap-3">
        <Segmented
          label="Light in the scene"
          size="sm"
          options={[
            { value: "food", label: "Warm bulbs", sub: "about 3000K" },
            { value: "street", label: "Daylight", sub: "about 5500K" },
            { value: "night", label: "Street lamps", sub: "about 3400K" },
          ]}
          value={scene}
          onChange={setScene}
        />
        <div className="rounded-lg border border-rule bg-white p-3">
          <RangeSlider
            label="White balance"
            min={2500}
            max={10000}
            step={100}
            value={k}
            onChange={setK}
            format={(v) => `${v}K`}
            track={WB_TRACK}
            hint="Left tells the camera the light is warm, so it cools the photo. Right warms it."
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setK(light)}
              className="min-h-11 rounded-md bg-blue px-3 text-[14px] font-semibold text-white"
            >
              Match the light (like Auto)
            </button>
            {WB_PRESETS.map((p) => (
              <button
                key={p.k}
                type="button"
                onClick={() => setK(p.k)}
                aria-pressed={k === p.k}
                className={`min-h-11 rounded-md border px-2.5 text-left text-[13px] leading-tight ${
                  k === p.k ? "border-blue bg-blue-soft text-blue" : "border-rule bg-white text-ink-2"
                }`}
              >
                <span className="block font-semibold">{p.k}K</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <Callout tone={cast === "neutral" ? "good" : "caution"} title={cast === "neutral" ? "Neutral: whites look white" : `Colour cast: ${cast}`}>
          The light here is about {light}K. {cast === "neutral" ? "Your setting matches it." : `You set ${k}K. Move towards ${light}K to neutralise it, or keep a little warmth on purpose for mood.`}
        </Callout>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ manual focus

export function FocusDemo() {
  const [focus, setFocus] = useState(0.42);
  const [peaking, setPeaking] = useState(true);
  const scene = SCENES.street;
  const targets = [scene.near!, { depth: scene.subject.depth, label: scene.subject.label }, scene.far!];
  const nearest = targets.reduce((a, b) => (Math.abs(b.depth - focus) < Math.abs(a.depth - focus) ? b : a));
  const onTarget = Math.abs(nearest.depth - focus) < 0.06;
  const params = useMemo(() => ({ stops: 0, noise: 0.004, motion: 0, shake: 0, dof: 0.014, focus, peaking }), [focus, peaking]);
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <SimCanvas
        scene="street"
        params={params}
        label={`Street scene with manual focus ${onTarget ? `on the ${nearest.label}` : "between subjects"}. ${peaking ? "Focus peaking outlines sharp edges in green." : ""}`}
      />
      <div className="grid content-start gap-3">
        <div className="rounded-lg border border-rule bg-white p-3">
          <RangeSlider
            label="Focus distance"
            min={0}
            max={1}
            step={0.01}
            value={focus}
            onChange={setFocus}
            format={(v) => (v < 0.2 ? "Near" : v > 0.75 ? "Far" : "Middle")}
            hint="Drag slowly and watch the green outline move."
          />
          <Toggle label="Focus peaking" description="Outlines the sharpest edges in green" checked={peaking} onChange={setPeaking} />
        </div>
        <Callout tone={onTarget ? "good" : "caution"} title={onTarget ? `Sharp: the ${nearest.label}` : "Nothing is quite sharp"}>
          {onTarget
            ? "Peaking edges sit on your subject. That is the moment to shoot."
            : `Closest is the ${nearest.label}. Nudge the slider until its edges light up.`}
        </Callout>
        <p className="text-[14px] text-ink-2">
          The blur here is exaggerated so it is easy to see. Phone sensors keep a lot in focus, which is why manual focus matters
          most for close-ups, through glass, in the dark, or when autofocus keeps picking the wrong thing.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ metering

type Metering = (typeof METERING)[number]["id"];

type LumMap = { w: number; h: number; l: Float32Array };

function useLuminanceMap(sceneId: SceneId): LumMap | null {
  const [map, setMap] = useState<LumMap | null>(null);
  useEffect(() => {
    const r = renderScene(SCENES[sceneId], { width: 96 });
    const w = r.width;
    const h = r.height;
    const comp = document.createElement("canvas");
    comp.width = w;
    comp.height = h;
    const ctx = comp.getContext("2d")!;
    ctx.drawImage(r.color, 0, 0);
    ctx.drawImage(r.subject, 0, 0);
    const c = ctx.getImageData(0, 0, w, h).data;
    const d = r.data.getContext("2d")!.getImageData(0, 0, w, h).data;
    const s = r.subject.getContext("2d")!.getImageData(0, 0, w, h).data;
    const l = new Float32Array(w * h);
    const lin = (v: number) => Math.pow(v / 255, 2.2);
    for (let i = 0; i < w * h; i++) {
      const hot = (d[i * 4 + 1] / 255) * 4 * (1 - s[i * 4 + 3] / 255);
      l[i] = (0.2126 * lin(c[i * 4]) + 0.7152 * lin(c[i * 4 + 1]) + 0.0722 * lin(c[i * 4 + 2])) * Math.pow(2, hot);
    }
    // Loading the map is an external computation on a canvas; set once per scene.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMap({ w, h, l });
  }, [sceneId]);
  return map;
}

function meter(map: LumMap, mode: Metering, spot: [number, number]) {
  let sum = 0;
  let wsum = 0;
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      const u = (x + 0.5) / map.w;
      const v = (y + 0.5) / map.h;
      let wgt = 1;
      if (mode === "center") wgt = Math.exp(-((u - 0.5) ** 2 + ((v - 0.5) * ASPECT) ** 2) / 0.03) + 0.15;
      if (mode === "spot") wgt = (u - spot[0]) ** 2 + ((v - spot[1]) * ASPECT) ** 2 < 0.035 ** 2 ? 1 : 0;
      const l = Math.max(1e-4, map.l[y * map.w + x]);
      sum += Math.log2(l) * wgt;
      wsum += wgt;
    }
  }
  return wsum > 0 ? sum / wsum : 0;
}

export function MeteringDemo() {
  const [mode, setMode] = useState<Metering>("matrix");
  const [spot, setSpot] = useState<[number, number]>([0.5, 0.48]);
  const map = useLuminanceMap("portrait");
  const stops = useMemo(() => {
    if (!map) return 0;
    const face = meter(map, "spot", [0.5, 0.48]);
    // Middle grey sits a little below a well exposed face; calibrate so spot on the face is correct.
    return face - meter(map, mode, spot);
  }, [map, mode, spot]);
  const params = useMemo(() => ({ stops, noise: 0.004, motion: 0, shake: 0, dof: 0.004, zebra: true }), [stops]);
  const info = METERING.find((m) => m.id === mode)!;
  const tone = Math.abs(stops) < 0.35 ? "good" : Math.abs(stops) < 1 ? "caution" : "bad";
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <SimCanvas
        scene="portrait"
        params={params}
        label={`Portrait metered with ${info.name} metering. The face is ${stops < -0.35 ? "too dark" : stops > 0.35 ? "too bright" : "well exposed"}.`}
      >
        <button
          type="button"
          aria-label="Move the spot meter: tap a point on the photo"
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setSpot([(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]);
            setMode("spot");
          }}
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" aria-hidden="true">
          {mode === "matrix" &&
            [1, 2, 3, 4].map((i) => (
              <g key={i} stroke="rgba(255,255,255,0.75)" strokeWidth="1">
                <line x1={i * 80} y1="0" x2={i * 80} y2="300" />
                {i < 4 && <line x1="0" y1={i * 75} x2="400" y2={i * 75} />}
              </g>
            ))}
          {mode === "center" && <circle cx="200" cy="150" r="95" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="2" strokeDasharray="6 5" />}
          {mode === "spot" && (
            <g>
              <circle cx={spot[0] * 400} cy={spot[1] * 300} r="14" fill="none" stroke="#fff" strokeWidth="2.5" />
              <circle cx={spot[0] * 400} cy={spot[1] * 300} r="2.5" fill="#fff" />
            </g>
          )}
        </svg>
      </SimCanvas>
      <div className="grid content-start gap-3">
        <Segmented label="Metering mode" options={METERING.map((m) => ({ value: m.id, label: m.name }))} value={mode} onChange={setMode} />
        <div className="rounded-lg border border-rule bg-white p-3">
          <p className="font-semibold">
            {info.name}
            {info.alt && <span className="font-normal text-muted"> ({info.alt})</span>}
          </p>
          <p className="text-[15px] text-ink-2">{info.text}</p>
          <p className="mt-2 text-[14px]">
            Exposure chosen for the face:{" "}
            <span className={`serif font-bold ${tone === "good" ? "text-good" : tone === "caution" ? "text-caution-ink" : "text-bad"}`}>
              {formatEv(stops)} stops
            </span>
          </p>
        </div>
        <Callout tone="info" title="Try this">
          Switch to Spot and tap the sky, then the face, then the grass. The whole photo follows whatever the spot sees.
        </Callout>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ RAW vs JPEG

export function RawDemo() {
  const [situation, setSituation] = useState<"bright" | "dark">("bright");
  const [hl, setHl] = useState(0);
  const [sh, setSh] = useState(0);
  const base = situation === "bright" ? 1.5 : -2.2;
  const scene: SceneId = situation === "bright" ? "street" : "indoor";
  const common = { stops: base, noise: 0.012, motion: 0, shake: 0, dof: 0.0015, highlights: hl, shadows: sh, zebra: true, seed: 3 };
  const jpeg = useMemo(() => ({ ...common, raw: false }), [base, hl, sh]); // eslint-disable-line react-hooks/exhaustive-deps
  const raw = useMemo(() => ({ ...common, raw: true }), [base, hl, sh]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-3">
      <Segmented
        label="Starting photo"
        options={[
          { value: "bright", label: "Sky blown out", sub: "overexposed +1.5" },
          { value: "dark", label: "Too dark", sub: "underexposed -2.2" },
        ]}
        value={situation}
        onChange={(v) => {
          setSituation(v);
          setHl(0);
          setSh(0);
        }}
      />
      <div className="grid grid-cols-2 gap-2">
        <figure>
          <SimCanvas scene={scene} params={jpeg} label={`JPEG version after editing. ${situation === "bright" ? "Clipped sky stays flat" : "Lifted shadows show banding and noise"}.`} maxWidth={900} />
          <figcaption className="mt-1 text-center text-[14px] font-semibold">JPEG / HEIF</figcaption>
        </figure>
        <figure>
          <SimCanvas scene={scene} params={raw} label="RAW version after the same edit, with more detail recovered." maxWidth={900} />
          <figcaption className="mt-1 text-center text-[14px] font-semibold">RAW</figcaption>
        </figure>
      </div>
      <div className="grid gap-1 rounded-lg border border-rule bg-white p-3 md:grid-cols-2 md:gap-6">
        <RangeSlider
          label="Recover highlights"
          min={-2.5}
          max={0}
          step={0.1}
          value={hl}
          onChange={setHl}
          format={(v) => formatEv(v)}
          hint="Pull the sky back. Crimson stripes mark detail that is still lost."
        />
        <RangeSlider label="Lift shadows" min={0} max={2.5} step={0.1} value={sh} onChange={setSh} format={(v) => formatEv(v)} hint="Open up dark areas." />
      </div>
      <Callout tone="good" title="What to notice">
        Drag Recover highlights all the way left. The JPEG sky turns flat grey because the detail was never saved. The RAW sky
        brings back clouds. Lifting shadows in the JPEG brings banding and more noise.
      </Callout>
    </div>
  );
}
