"use client";

import { useEffect, useState } from "react";
import { ExposureLab, type ExposureSettings } from "./ExposureLab";
import { PlatformGuide } from "./PlatformGuide";
import { PRESETS, type Preset } from "@/lib/content";
import { formatEv, formatIso, formatShutter } from "@/lib/exposure";

function toSettings(p: Preset): ExposureSettings {
  return {
    scene: p.scene,
    mode: "manual",
    iso: p.iso,
    shutter: p.shutter,
    ev: p.ev,
    aperture: p.portrait ? "portrait" : "phone",
    fstop: p.portrait ? 2.8 : 1.8,
    handheld: p.handheld,
    wbK: p.wbK,
  };
}

export function ScenarioLab() {
  const [id, setId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === id)!;

  // Allow deep links such as /lab/scenarios#night
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1);
      if (PRESETS.some((p) => p.id === h)) setId(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <div className="grid gap-4">
      <fieldset>
        <legend className="mb-1.5 text-[14px] font-medium text-ink-2">Choose a scenario</legend>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
          {PRESETS.map((p) => {
            const on = p.id === id;
            return (
              <label
                key={p.id}
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-2 text-center text-[14px] font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-blue ${
                  on ? "border-blue bg-blue text-white" : "border-rule bg-white text-ink hover:border-blue"
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={p.id}
                  checked={on}
                  onChange={() => {
                    setId(p.id);
                    history.replaceState(null, "", `#${p.id}`);
                  }}
                  className="sr-only"
                />
                {p.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-lg border border-ink bg-white p-3">
        <h2 className="text-2xl font-bold">{preset.name}</h2>
        <p className="text-[15px] text-ink-2">{preset.summary}</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {[
            ["ISO", formatIso(preset.iso).replace("ISO ", "")],
            ["Shutter", formatShutter(preset.shutter)],
            ["EV", formatEv(preset.ev)],
            ["White balance", `${preset.wbK}K`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md bg-section px-2 py-1.5">
              <dt className="text-[12px] text-muted">{k}</dt>
              <dd className="serif text-lg font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ExposureLab key={preset.id} initial={toSettings(preset)} sceneLocked />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-rule bg-white p-3">
          <h3 className="text-lg font-bold">Why these settings</h3>
          <ul className="mt-2 grid gap-2 text-[15px]">
            {preset.why.map((w) => (
              <li key={w} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <PlatformGuide
          title="Step by step"
          ordered
          samsungSpot={preset.portrait ? "portrait" : preset.id === "night" ? "night" : "pro-bar"}
          iphoneSpot={preset.portrait ? "fstop" : preset.id === "night" ? "night" : "ev"}
          samsung={preset.samsung}
          iphone={preset.iphone}
        />
      </div>
    </div>
  );
}
