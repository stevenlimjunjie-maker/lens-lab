"use client";

import { useMemo, useState } from "react";
import { SimCanvas, type SimParams } from "@/components/sim/SimCanvas";
import { Histogram } from "@/components/sim/Histogram";
import { Verdicts } from "@/components/sim/Verdicts";
import { CompactStatus, StickyPreview } from "@/components/sim/StickyPreview";
import { Segmented, StepSlider, Toggle } from "@/components/ui/Controls";
import { SCENES, type SceneId } from "@/lib/scenes";
import {
  APERTURE_VALUES,
  EV_VALUES,
  ISO_VALUES,
  PHONE_APERTURE,
  SHUTTER_VALUES,
  autoExposure,
  dofForAperture,
  exposureStops,
  formatAperture,
  formatEv,
  formatIso,
  formatShutter,
  motionBlur,
  nearestEvIndex,
  nearestIndex,
  noiseForIso,
  shakeBlur,
  verdictFor,
  type Stats,
} from "@/lib/exposure";

export type ExposureSettings = {
  scene: SceneId;
  mode: "auto" | "manual";
  iso: number;
  shutter: number;
  ev: number;
  aperture: "phone" | "concept" | "portrait";
  fstop: number;
  handheld: boolean;
  wbK?: number;
};

export const DEFAULT_EXPOSURE: ExposureSettings = {
  scene: "street",
  mode: "manual",
  iso: 100,
  shutter: 1 / 640,
  ev: 0,
  aperture: "phone",
  fstop: PHONE_APERTURE,
  handheld: true,
};

const SCENE_OPTIONS: { value: SceneId; label: string }[] = [
  { value: "street", label: "Day street" },
  { value: "night", label: "Night" },
  { value: "indoor", label: "Indoors" },
];

/** Compute everything the simulator and verdict need from the settings. */
export function useExposureModel(s: ExposureSettings) {
  return useMemo(() => {
    const light = SCENES[s.scene].light;
    const physicalF = s.aperture === "concept" ? s.fstop : PHONE_APERTURE;
    let iso = s.iso;
    let t = s.shutter;
    let stops: number;
    if (s.mode === "auto") {
      const a = autoExposure(light, s.ev, physicalF);
      iso = a.iso;
      t = a.t;
      // The program targets the EV; rounding to real steps leaves a tiny residual.
      stops = exposureStops(light, a.iso, a.t, physicalF);
    } else {
      stops = exposureStops(light, iso, t, physicalF);
    }
    const dof =
      s.aperture === "phone" ? 0.0012 : s.aperture === "portrait" ? dofForAperture(s.fstop, true) : dofForAperture(s.fstop);
    const motion = motionBlur(light, t);
    const shake = shakeBlur(t, s.handheld);
    const noise = noiseForIso(iso);
    const params: SimParams = { stops, noise, motion, shake, dof, wbK: s.wbK };
    return { light, iso, t, stops, motion, shake, noise, params };
  }, [s]);
}

export function ExposureLab({
  initial = DEFAULT_EXPOSURE,
  sceneLocked,
  heading,
}: {
  initial?: ExposureSettings;
  sceneLocked?: boolean;
  heading?: React.ReactNode;
}) {
  const [s, setS] = useState<ExposureSettings>(initial);
  const [zebra, setZebra] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const m = useExposureModel(s);
  const set = (patch: Partial<ExposureSettings>) => setS((prev) => ({ ...prev, ...patch }));

  const verdicts = verdictFor({
    stops: m.stops,
    stats,
    motion: m.motion,
    motionPerSecond: m.light.motion,
    shake: m.shake,
    noise: m.noise,
  });

  const params = useMemo(() => ({ ...m.params, zebra }), [m.params, zebra]);
  const scene = SCENES[s.scene];
  const isoIdx = nearestIndex(ISO_VALUES, m.iso);
  const tIdx = nearestIndex(SHUTTER_VALUES, m.t);
  const evIdx = nearestEvIndex(s.ev);
  const apIdx = nearestIndex(APERTURE_VALUES, s.fstop);
  const meter = Math.max(-3, Math.min(3, m.stops));

  const label = `${scene.alt}. Simulated at ${formatIso(m.iso)}, ${formatShutter(m.t)}${
    s.mode === "auto" ? `, EV ${formatEv(s.ev)}` : ""
  }. ${verdicts.map((v) => v.text).join(". ")}.`;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <StickyPreview footer={<CompactStatus verdicts={verdicts} stats={stats} />}>
        {heading}
        <SimCanvas scene={s.scene} params={params} onStats={setStats} label={label}>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-2 text-[12px] font-semibold text-white">
            <span className="rounded bg-black/60 px-1.5 py-0.5 tabular-nums">
              {formatIso(m.iso)} · {formatShutter(m.t)}
            </span>
            <span className="rounded bg-black/60 px-1.5 py-0.5">{s.mode === "auto" ? "Auto" : "Pro"}</span>
          </div>
        </SimCanvas>
        <div className="mt-2 hidden gap-2 md:grid">
          <Histogram stats={stats} />
          <Verdicts items={verdicts} />
        </div>
      </StickyPreview>

      <div className="grid content-start gap-3">
        <div className="md:hidden">
          <Verdicts items={verdicts} />
        </div>
        {!sceneLocked && (
          <Segmented label="Scene" options={SCENE_OPTIONS} value={s.scene} onChange={(v) => set({ scene: v })} />
        )}
        <Segmented
          label="Exposure mode"
          options={[
            { value: "auto", label: "Auto + EV", sub: "like Photo mode" },
            { value: "manual", label: "Manual", sub: "like Pro mode" },
          ]}
          value={s.mode}
          onChange={(v) => {
            if (v === "manual") set({ mode: v, iso: m.iso, shutter: m.t });
            else set({ mode: v });
          }}
        />

        <div className="rounded-lg border border-rule bg-white p-3">
          <StepSlider
            label="ISO (sensor sensitivity)"
            values={ISO_VALUES}
            index={isoIdx}
            onChange={(i) => set({ iso: ISO_VALUES[i] })}
            format={(v) => String(v)}
            disabled={s.mode === "auto"}
            valueTone={m.noise > 0.045 ? "caution" : undefined}
            hint={s.mode === "auto" ? "Set automatically. Switch to Manual to change it." : "Higher is brighter but noisier."}
          />
          <StepSlider
            label="Shutter speed"
            values={SHUTTER_VALUES}
            index={tIdx}
            onChange={(i) => set({ shutter: SHUTTER_VALUES[i] })}
            format={formatShutter}
            disabled={s.mode === "auto"}
            valueTone={m.motion > 0.004 || m.shake > 0.004 ? "bad" : undefined}
            hint={s.mode === "auto" ? "Set automatically." : "Slower is brighter but blurs movement."}
          />
          <StepSlider
            label={s.mode === "auto" ? "EV (exposure compensation)" : "Meter reading"}
            values={EV_VALUES}
            index={s.mode === "auto" ? evIdx : nearestEvIndex(meter)}
            onChange={(i) => set({ ev: EV_VALUES[i] })}
            format={formatEv}
            disabled={s.mode === "manual"}
            valueTone={Math.abs(m.stops) > 1 ? "bad" : Math.abs(m.stops) > 0.5 ? "caution" : "good"}
            hint={
              s.mode === "auto"
                ? "Brightens or darkens what the camera picks automatically."
                : "In full manual, EV becomes a meter showing how far you are from a standard exposure."
            }
          />
        </div>

        <div className="rounded-lg border border-rule bg-white p-3">
          <Segmented
            label="Aperture"
            size="sm"
            options={[
              { value: "phone", label: "Phone", sub: "fixed" },
              { value: "concept", label: "Camera", sub: "concept" },
              { value: "portrait", label: "Portrait", sub: "simulated" },
            ]}
            value={s.aperture}
            onChange={(v) => set({ aperture: v, fstop: v === "phone" ? PHONE_APERTURE : v === "portrait" ? 2.8 : s.fstop })}
          />
          <div className="mt-2">
            <StepSlider
              label={s.aperture === "portrait" ? "Simulated f-stop (blur)" : "Aperture (f-stop)"}
              values={APERTURE_VALUES}
              index={apIdx}
              onChange={(i) => set({ fstop: APERTURE_VALUES[i] })}
              format={formatAperture}
              disabled={s.aperture === "phone"}
            />
          </div>
          <p className="text-[13px] text-ink-2">
            {s.aperture === "phone" &&
              "Most phone lenses have a fixed physical aperture, so this does not change. Their small sensors keep most things in focus."}
            {s.aperture === "concept" &&
              "Physical cameras only: a wider opening (smaller number) lets in more light and blurs the background. Phones cannot do this physically."}
            {s.aperture === "portrait" &&
              "Simulated on phones: Portrait mode blurs the background in software. Samsung and iPhone let you adjust this effect while shooting and afterwards."}
          </p>
        </div>

        <div className="rounded-lg border border-rule bg-white px-3 py-1">
          <Toggle
            label="Handheld"
            description="Adds camera shake at slow speeds, even with stabilisation"
            checked={s.handheld}
            onChange={(v) => set({ handheld: v })}
          />
          <Toggle
            label="Show clipping (zebra)"
            description="Crimson stripes mark blown highlights"
            checked={zebra}
            onChange={setZebra}
          />
        </div>
        <button
          type="button"
          onClick={() => setS(initial)}
          className="min-h-11 rounded-md border border-rule bg-white px-4 text-[15px] font-semibold text-blue hover:bg-blue-soft"
        >
          Reset settings
        </button>
      </div>
    </div>
  );
}
