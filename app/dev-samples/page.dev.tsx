"use client";

// Dev-only page (excluded from production builds by pageExtensions).
// scripts/gen-samples.mjs opens it and exports each canvas to /public/samples.

import { SimCanvas } from "@/components/sim/SimCanvas";
import { SCENES, type SceneId } from "@/lib/scenes";

const ids = Object.keys(SCENES) as SceneId[];

export default function DevSamples() {
  return (
    <div className="grid gap-4 py-4" style={{ width: 1280 }}>
      {ids.map((id) => (
        <div key={id} data-scene={id} style={{ width: 1280 }}>
          <SimCanvas scene={id} label={id} maxWidth={1280} params={{ stops: 0, noise: 0.003, motion: 0, shake: 0, dof: 0.0015 }} />
        </div>
      ))}
    </div>
  );
}
