import type { Metadata } from "next";
import { Masthead } from "@/components/ui/Masthead";
import { Callout, Section } from "@/components/ui/Section";
import { FocusDemo, MeteringDemo, RawDemo, WhiteBalanceDemo } from "@/components/modules/ProControls";
import { PlatformGuide } from "@/components/modules/PlatformGuide";
import { NextModule } from "@/components/modules/NextModule";
import { CONTROL_LOCATIONS, FEATURES, RAW_PLATFORM, RAW_POINTS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pro controls and RAW",
  description:
    "White balance in Kelvin, manual focus with focus peaking, metering modes and a side by side JPEG versus RAW recovery demo, with where each control lives on Samsung and iPhone.",
  alternates: { canonical: "/lab/pro-controls" },
};

const loc = (name: string) => CONTROL_LOCATIONS.find((c) => c.control === name)!;

export default function ProControlsPage() {
  const wb = loc("White balance");
  const mf = loc("Manual focus");
  const me = loc("Metering");
  const raw = loc("RAW");
  return (
    <>
      <Masthead
        label="Module 03 · Pro controls"
        title="Beyond auto: colour, focus, metering and RAW"
        dek="Samsung puts these in Pro mode and Expert RAW. The stock iPhone Camera app automates most of them, with a few clever overrides. Here is what each one does and where to find it."
      />

      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-2 text-[14px]">
          {[
            ["#wb", "White balance"],
            ["#focus", "Manual focus"],
            ["#metering", "Metering"],
            ["#raw", "RAW"],
            ["#features", "Feature list"],
          ].map(([href, text]) => (
            <li key={href} className="shrink-0">
              <a href={href} className="inline-flex min-h-11 items-center rounded-full border border-rule bg-white px-3 font-medium text-ink-2 hover:border-blue hover:text-blue">
                {text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section id="wb" label="Pro control 1" title="White balance in Kelvin">
        <p className="mb-3 text-[15px] text-ink-2">
          Light has a colour. Candles and bulbs are warm (low Kelvin), shade and overcast sky are cool (high Kelvin). White
          balance tells the camera what the light is, so it can make white look white.
        </p>
        <WhiteBalanceDemo />
        <div className="mt-4">
          <PlatformGuide samsungSpot="wb" iphoneSpot="styles" samsung={[wb.samsung]} iphone={[wb.iphone]} />
        </div>
      </Section>

      <Section id="focus" label="Pro control 2" title="Manual focus and focus peaking">
        <FocusDemo />
        <div className="mt-4">
          <PlatformGuide samsungSpot="focus" iphoneSpot="lock" samsung={[mf.samsung]} iphone={[mf.iphone]} />
        </div>
      </Section>

      <Section id="metering" label="Pro control 3" title="Metering: what the camera measures">
        <MeteringDemo />
        <div className="mt-4">
          <PlatformGuide samsungSpot="metering" iphoneSpot="lock" samsung={[me.samsung]} iphone={[me.iphone]} />
        </div>
      </Section>

      <Section id="raw" label="Pro control 4" title="JPEG versus RAW">
        <ul className="mb-3 grid gap-1.5 text-[15px] text-ink-2">
          {RAW_POINTS.map((p) => (
            <li key={p} className="flex gap-2">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
              {p}
            </li>
          ))}
        </ul>
        <RawDemo />
        <div className="mt-4">
          <PlatformGuide
            samsungSpot="raw"
            iphoneSpot="raw"
            samsung={[raw.samsung, ...RAW_PLATFORM.samsung]}
            iphone={[raw.iphone, ...RAW_PLATFORM.iphone]}
          />
        </div>
      </Section>

      <Section id="features" label="Reference" title="Camera features on each platform">
        <div className="grid gap-4 md:grid-cols-2">
          {(["samsung", "iphone"] as const).map((p) => (
            <div key={p} className="rounded-lg border border-rule bg-white p-3">
              <h3 className="text-lg font-bold">{p === "samsung" ? "Samsung Galaxy" : "iPhone"}</h3>
              <dl className="mt-2 grid gap-2 text-[14px]">
                {FEATURES[p].map((f) => (
                  <div key={f.name} className="border-b border-rule pb-2 last:border-0">
                    <dt className="font-semibold">{f.name}</dt>
                    <dd className="text-ink-2">{f.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Callout tone="caution" title="Features vary">
            Availability depends on model, region and software version. Where we say &quot;on supported models&quot;, check your
            phone&apos;s camera settings. Third-party apps such as Halide or Lightroom Mobile add manual controls to iPhone; we
            mention them as examples, not recommendations.
          </Callout>
        </div>
      </Section>

      <NextModule current="/lab/pro-controls" />
    </>
  );
}
