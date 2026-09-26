import type { Metadata } from "next";
import { Masthead } from "@/components/ui/Masthead";
import { Callout, Section } from "@/components/ui/Section";
import { SOURCES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About, sources and credits",
  description: "How Lens Lab was made, the sources behind it, image and font credits, and the fine print on model differences.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Masthead
        label="About"
        title="About Lens Lab"
        dek="Lens Lab is a free, independent learning tool that explains phone camera settings in plain English, so you can make deliberate choices instead of hoping auto gets it right."
      />

      <Section id="disclaimer" label="Please read" title="Features vary by model and software">
        <div className="grid gap-2 text-[15px] text-ink-2">
          <p>
            Camera apps change with every software update, and features differ between models, regions and price tiers. Lens
            Lab describes settings common to recent Samsung Galaxy and iPhone models in general terms rather than documenting
            one specific phone.
          </p>
          <p>
            Where a feature depends on the phone we say &quot;on supported models&quot;. Focal lengths are approximate
            equivalents. Menu names and positions shown in the drawings are simplified and may not match your phone exactly.
          </p>
          <p>
            The simulator is an educational approximation. It exaggerates some effects (such as depth of field) so they are
            easy to see on a small screen, and does not model any phone&apos;s actual image processing.
          </p>
          <Callout tone="caution">
            Lens Lab is not affiliated with, endorsed by or sponsored by Samsung or Apple. Samsung, Galaxy, Apple, iPhone and
            ProRAW are trademarks of their respective owners and are used only to describe compatibility. Third-party apps are
            named as examples, not recommendations.
          </Callout>
        </div>
      </Section>

      <Section id="sources" label="Further reading" title="Sources">
        <ul className="grid gap-2 text-[15px]">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="inline-flex min-h-11 items-center text-blue underline underline-offset-2" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[14px] text-ink-2">
          Photography principles (the exposure triangle, colour temperature, metering and RAW latitude) are standard and covered
          in any introductory photography text. Platform details were checked against the official user guides above; always
          confirm with the guide for your model and software version.
        </p>
      </Section>

      <Section id="credits" label="Credits" title="Images, fonts and tools">
        <ul className="grid gap-2 text-[15px] text-ink-2">
          <li>
            <span className="font-semibold text-ink">Sample images:</span> every scene in the lab, quiz, video and preview images
            is drawn procedurally in code for this project. No stock photos, screenshots or logos are used.
          </li>
          <li>
            <span className="font-semibold text-ink">Phone drawings:</span> simplified, generic illustrations made for this site.
          </li>
          <li>
            <span className="font-semibold text-ink">Fonts:</span> Libre Baskerville and IBM Plex Sans, via Google Fonts, under
            the SIL Open Font License.
          </li>
          <li>
            <span className="font-semibold text-ink">Built with:</span> Next.js, Tailwind CSS, Framer Motion, WebGL, and Remotion
            for the explainer video.
          </li>
          <li>
            <span className="font-semibold text-ink">Music:</span> the video is silent; no music is included.
          </li>
        </ul>
      </Section>

      <Section id="privacy" label="Privacy" title="No tracking, no accounts">
        <p className="text-[15px] text-ink-2">
          Lens Lab is a static site. It has no accounts and no backend, and the simulator runs entirely in your browser. Nothing
          you do here is sent anywhere.
        </p>
      </Section>
    </>
  );
}
