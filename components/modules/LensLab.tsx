"use client";

import { useMemo, useState } from "react";
import { SimCanvas } from "@/components/sim/SimCanvas";
import { CompactStatus, StickyPreview } from "@/components/sim/StickyPreview";
import { RangeSlider, Segmented, Toggle } from "@/components/ui/Controls";
import { Callout } from "@/components/ui/Section";
import { LENSES, type LensId } from "@/lib/content";
import type { SceneId } from "@/lib/scenes";

const OPTICAL: Record<LensId, { zoom: number; headroom: number }> = {
  ultra: { zoom: 0.5, headroom: 1 },
  // High resolution main sensors allow a near-optical 2x crop on supported models.
  main: { zoom: 1, headroom: 2 },
  tele: { zoom: 3, headroom: 1.25 },
};

/** Slider position (0..100) mapped to zoom on a log scale, 0.5x to 10x. */
const toZoom = (p: number) => 0.5 * Math.pow(20, p / 100);
const toPos = (z: number) => (Math.log(z / 0.5) / Math.log(20)) * 100;

function lensFor(zoom: number): LensId {
  if (zoom >= 3) return "tele";
  if (zoom >= 1) return "main";
  return "ultra";
}

export function FovDiagram({ zoom }: { zoom: number }) {
  const deg = (2 * Math.atan(18 / (24 * zoom)) * 180) / Math.PI;
  const half = ((deg / 2) * Math.PI) / 180;
  const len = 120;
  const x = Math.sin(half) * len;
  const y = Math.cos(half) * len;
  return (
    <svg viewBox="0 0 260 150" className="block h-auto w-full" role="img" aria-label={`Field of view about ${Math.round(deg)} degrees wide`}>
      <rect width="260" height="150" fill="#fafafa" />
      <path d={`M130 140 L${130 - x} ${140 - y} A ${len} ${len} 0 0 1 ${130 + x} ${140 - y} Z`} fill="#1d4ed8" fillOpacity="0.15" stroke="#1d4ed8" />
      <rect x="120" y="132" width="20" height="12" rx="2" fill="#111" />
      <text x="130" y="16" textAnchor="middle" fontSize="12" fill="#111" fontWeight="600">
        approx. {Math.round(deg)}° wide
      </text>
    </svg>
  );
}

export function LensLab() {
  const [zoom, setZoom] = useState(1);
  const [scene, setScene] = useState<SceneId>("street");
  const [compress, setCompress] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const lensId = lensFor(zoom);
  const lens = LENSES.find((l) => l.id === lensId)!;
  const o = OPTICAL[lensId];
  const crop = zoom / o.zoom;
  const detail = Math.min(1, o.headroom / crop);
  const nearOptical = crop < 1.02;
  const sensorCrop = !nearOptical && crop <= o.headroom + 0.01;

  const params = useMemo(
    () => ({
      stops: 0,
      noise: 0.006 + (1 - detail) * 0.01,
      motion: 0,
      shake: 0,
      dof: 0.0015 * zoom,
      distort: lensId === "ultra" ? (corrected ? 0.02 : 0.11) * (1 - (zoom - 0.5) * 1.6) : 0,
      vignette: lensId === "ultra" ? 0.3 : 0.08,
    }),
    [detail, zoom, lensId, corrected],
  );

  let status: { tone: "good" | "caution" | "bad"; title: string; text: string };
  if (nearOptical) {
    status = { tone: "good", title: `Optical: ${lens.name} lens`, text: "Full detail from this camera's own lens and sensor." };
  } else if (sensorCrop) {
    status = {
      tone: "good",
      title: "Sensor crop, close to optical quality",
      text: "On supported models the phone crops its high resolution main sensor for about 2x with little loss.",
    };
  } else if (detail > 0.5) {
    status = {
      tone: "caution",
      title: `Digital zoom: ${crop.toFixed(1)}x crop of the ${lens.name.toLowerCase()}`,
      text: "Beyond the optical range the phone enlarges pixels and sharpens. Fine detail starts to smear.",
    };
  } else {
    status = {
      tone: "bad",
      title: `Heavy digital zoom: only about ${Math.round(detail * detail * 100)}% of the pixels are real`,
      text: "Detail is invented by upscaling. Walk closer, or use the telephoto lens on supported models.",
    };
  }

  const label = `${scene} scene seen through the ${lens.name} lens at ${zoom.toFixed(1)}x. ${status.title}.`;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <StickyPreview footer={<CompactStatus verdicts={[{ tone: status.tone, text: status.title }]} />}>
        <SimCanvas scene={scene} params={params} view={{ zoom, compress, detail }} label={label}>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-2 text-[12px] font-semibold text-white">
            <span className="rounded bg-black/60 px-1.5 py-0.5 tabular-nums">{zoom.toFixed(1)}x</span>
            <span className="rounded bg-black/60 px-1.5 py-0.5">{lens.name}</span>
          </div>
          {!nearOptical && !sensorCrop && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-bad/90 px-2 py-1 text-center text-[12px] font-semibold text-white">
              Digital zoom
            </div>
          )}
        </SimCanvas>
        <div className="mt-2 hidden md:block">
          <Callout tone={status.tone} title={status.title}>
            {status.text}
          </Callout>
        </div>
      </StickyPreview>

      <div className="grid content-start gap-3">
        <div className="md:hidden">
          <Callout tone={status.tone} title={status.title}>
            {status.text}
          </Callout>
        </div>
        <Segmented
          label="Lens"
          options={LENSES.map((l) => ({ value: l.id, label: l.button, sub: l.name }))}
          value={nearOptical ? lensId : ("none" as LensId)}
          onChange={(v) => setZoom(OPTICAL[v].zoom)}
        />
        <div className="rounded-lg border border-rule bg-white p-3">
          <RangeSlider
            label="Zoom"
            min={0}
            max={100}
            step={0.5}
            value={toPos(zoom)}
            onChange={(p) => {
              const z = toZoom(p);
              // Snap to the optical lenses so they are easy to hit with a thumb.
              const snap = [0.5, 1, 2, 3].find((s) => Math.abs(Math.log(z / s)) < 0.05);
              setZoom(snap ?? z);
            }}
            format={() => `${zoom.toFixed(1)}x`}
            hint="0.5x to 10x. Optical lenses at 0.5x, 1x and 3x in this demo; your phone's telephoto may be 2x to 5x."
          />
          <Segmented
            label="Scene"
            size="sm"
            options={[
              { value: "street", label: "Street" },
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
            value={scene}
            onChange={setScene}
          />
        </div>
        <div className="rounded-lg border border-rule bg-white px-3 py-1">
          <Toggle
            label="Keep the subject the same size"
            description="Walk back for tele or closer for ultra-wide, and watch the background change"
            checked={compress}
            onChange={setCompress}
          />
          <Toggle
            label="Lens correction"
            description="Phones straighten most ultra-wide distortion automatically"
            checked={corrected}
            onChange={setCorrected}
          />
        </div>

        <div className="rounded-lg border border-rule bg-white p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{lens.name}</h2>
            <span className="text-[13px] text-muted">{lens.focal}</span>
          </div>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_110px] gap-3">
            <div>
              <p className="text-[13px] font-semibold text-good">Best for</p>
              <ul className="mt-1 grid gap-1 text-[14px]">
                {lens.bestFor.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span aria-hidden="true" className="text-good">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <FovDiagram zoom={zoom} />
          </div>
          <p className="mt-2 text-[14px] text-ink-2">
            <span className="font-semibold text-caution-ink">Watch out: </span>
            {lens.watchOut}
          </p>
        </div>
      </div>
    </div>
  );
}
