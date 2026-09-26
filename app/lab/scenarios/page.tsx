import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/ui/Masthead";
import { ScenarioLab } from "@/components/modules/ScenarioLab";
import { NextModule } from "@/components/modules/NextModule";

export const metadata: Metadata = {
  title: "Scenario presets",
  description:
    "Portrait, night, sports, food, landscape, street and low-light indoor: the settings that suit each one, why they work, and the steps on Samsung and iPhone.",
  alternates: { canonical: "/lab/scenarios" },
};

export default function ScenariosPage() {
  return (
    <>
      <Masthead
        label="Module 04 · Scenarios"
        title="Seven situations, the settings that fit"
        dek={
          <>
            Pick a scenario to load its settings into the simulator. Then break them on purpose to see why they work. When you
            are ready, test yourself in the <Link className="text-blue underline" href="/quiz">quiz</Link>.
          </>
        }
      />
      <ScenarioLab />
      <NextModule current="/lab/scenarios" />
    </>
  );
}
