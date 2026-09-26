import type { Metadata } from "next";
import { Masthead } from "@/components/ui/Masthead";
import { Callout, Section } from "@/components/ui/Section";
import { LensLab } from "@/components/modules/LensLab";
import { PlatformGuide } from "@/components/modules/PlatformGuide";
import { NextModule } from "@/components/modules/NextModule";
import { LENSES, LENS_NOTES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lens and zoom comparison",
  description:
    "Switch between ultra-wide, main and telephoto on the same scene. See field of view, perspective compression, edge distortion and where digital zoom starts to lose detail.",
  alternates: { canonical: "/lab/lenses" },
};

export default function LensesPage() {
  return (
    <>
      <Masthead
        label="Module 02 · Lenses and zoom"
        title="Three lenses, one scene"
        dek="Most recent phones carry an ultra-wide and a main camera, and many add a telephoto. Each is a separate lens and sensor. Zooming between them is free; zooming past them is not."
      />

      <LensLab />

      <Section id="compare" label="At a glance" title="Which lens when">
        <div className="grid gap-3 md:grid-cols-3">
          {LENSES.map((l) => (
            <article key={l.id} className="rounded-lg border border-rule bg-white p-3">
              <p className="serif text-2xl font-bold text-blue">{l.button}</p>
              <h3 className="font-semibold">{l.name}</h3>
              <p className="text-[13px] text-muted">{l.focal}</p>
              <p className="mt-2 text-[14px]">
                <span className="font-semibold text-good">Best for: </span>
                {l.bestFor.join(", ").toLowerCase()}.
              </p>
            </article>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          <Callout tone="info" title="Perspective is about where you stand">
            A telephoto does not flatten faces by itself. Standing further back does, and the telephoto lets you keep the same
            framing from there. Turn on &quot;Keep the subject the same size&quot; above to see the background grow.
          </Callout>
          <Callout tone="caution" title="Focal lengths are approximate">
            Equivalent focal lengths are given as rough ranges. Exact values and telephoto reach (about 2x to 5x) depend on the
            model.
          </Callout>
        </div>
      </Section>

      <Section id="where" label="On your phone" title="Switching lenses">
        <PlatformGuide samsungSpot="lenses" iphoneSpot="lenses" samsung={[LENS_NOTES.samsung]} iphone={[LENS_NOTES.iphone]} />
      </Section>

      <NextModule current="/lab/lenses" />
    </>
  );
}
