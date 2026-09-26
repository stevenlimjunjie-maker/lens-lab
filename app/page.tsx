import Link from "next/link";
import { ViewfinderIntro } from "@/components/intro/ViewfinderIntro";
import { ExplainerVideo } from "@/components/ui/ExplainerVideo";
import { ModuleCards } from "@/components/ui/ModuleCards";
import { Section } from "@/components/ui/Section";

export default function Home() {
  return (
    <>
      <ViewfinderIntro />

      <section aria-labelledby="modules-title" className="mt-6">
        <div className="border-t border-ink pt-2">
          <p className="smallcaps text-[13px] text-muted">The lab</p>
        </div>
        <h2 id="modules-title" className="mt-1 mb-3 text-2xl font-bold">
          Six hands-on modules
        </h2>
        <ModuleCards />
      </section>

      <Section id="video" label="Explainer" title="The whole course in 80 seconds">
        <ExplainerVideo />
      </Section>

      <Section label="Before you start" title="Three honest truths about phone cameras">
        <ol className="grid gap-3 text-[15px] md:grid-cols-3">
          <li className="rounded-md border border-rule bg-white p-3">
            <p className="serif text-3xl font-bold text-blue">1</p>
            <p className="font-semibold">The aperture is fixed</p>
            <p className="text-ink-2">Most phone lenses cannot change their opening. Background blur in Portrait mode is simulated.</p>
          </li>
          <li className="rounded-md border border-rule bg-white p-3">
            <p className="serif text-3xl font-bold text-blue">2</p>
            <p className="font-semibold">Controls differ</p>
            <p className="text-ink-2">
              Samsung offers full manual control in Pro mode. The stock iPhone app automates ISO and shutter but gives you
              exposure, focus and style overrides.
            </p>
          </li>
          <li className="rounded-md border border-rule bg-white p-3">
            <p className="serif text-3xl font-bold text-blue">3</p>
            <p className="font-semibold">Light beats settings</p>
            <p className="text-ink-2">
              Every control here is a trade-off. More light means lower ISO, faster shutter and cleaner photos.{" "}
              <Link className="text-blue underline" href="/lab/exposure">
                See it in action
              </Link>
              .
            </p>
          </li>
        </ol>
      </Section>
    </>
  );
}
