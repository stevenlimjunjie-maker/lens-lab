import type { Metadata } from "next";
import { Masthead } from "@/components/ui/Masthead";
import { Callout, Section } from "@/components/ui/Section";
import { ExposureLab } from "@/components/modules/ExposureLab";
import { PlatformGuide } from "@/components/modules/PlatformGuide";
import { TriangleDiagram } from "@/components/modules/TriangleDiagram";
import { NextModule } from "@/components/modules/NextModule";
import { CONTROL_LOCATIONS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Exposure triangle simulator",
  description:
    "Drag ISO, shutter speed and EV on a live photo to see noise, motion blur and clipped highlights, with a histogram and a plain-English verdict.",
  alternates: { canonical: "/lab/exposure" },
};

const pick = (names: string[]) => CONTROL_LOCATIONS.filter((c) => names.includes(c.control));

export default function ExposurePage() {
  const rows = pick(["ISO and shutter speed", "Exposure compensation (EV)"]);
  return (
    <>
      <Masthead
        label="Module 01 · Exposure"
        title="The exposure triangle, live"
        dek="Brightness comes from three things: how sensitive the sensor is (ISO), how long it collects light (shutter speed) and how wide the lens opens (aperture). Change them below and watch the photo react."
      />

      <ExposureLab />

      <Section id="how" label="Explainer" title="What each control really does">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <TriangleDiagram />
          <dl className="grid gap-3 text-[15px]">
            <div>
              <dt className="font-semibold">ISO</dt>
              <dd className="text-ink-2">
                Amplifies the signal from the sensor. Doubling ISO doubles brightness, but also lifts noise: grain and colour
                speckles, worst in the shadows.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Shutter speed</dt>
              <dd className="text-ink-2">
                How long the sensor collects light. 1/60s gathers twice the light of 1/125s. Too slow and moving subjects smear,
                or the whole frame blurs from hand shake.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">EV (exposure compensation)</dt>
              <dd className="text-ink-2">
                Tells the automatic exposure to go brighter or darker. +1 EV is twice as bright. It is the most useful single
                control on both platforms.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Aperture</dt>
              <dd className="text-ink-2">
                On a physical camera, the size of the lens opening sets brightness and background blur. Most phone lenses have
                a fixed aperture, so phones fake shallow depth of field with Portrait mode instead.
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section id="where" label="On your phone" title="Where to find these controls">
        <PlatformGuide
          samsungSpot="pro-bar"
          iphoneSpot="ev"
          samsung={rows.map((r) => ({ title: r.control, text: r.samsung }))}
          iphone={rows.map((r) => ({ title: r.control, text: r.iphone }))}
        />
        <div className="mt-3">
          <Callout tone="caution" title="Rule of thumb">
            For handheld shots keep the shutter at 1/60s or faster for still subjects, 1/250s for people moving and 1/1000s for
            sport. Raise ISO to stay there.
          </Callout>
        </div>
      </Section>

      <NextModule current="/lab/exposure" />
    </>
  );
}
