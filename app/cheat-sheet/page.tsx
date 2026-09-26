import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/ui/Masthead";
import { Callout } from "@/components/ui/Section";
import { PrintButton } from "@/components/ui/PrintButton";
import { PRESETS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cheat sheet",
  description: "A printable summary of phone camera settings per scenario, with the quickest route on Samsung Galaxy and iPhone.",
  alternates: { canonical: "/cheat-sheet" },
};

const COLS = ["Scenario", "ISO", "Shutter", "EV", "White balance", "On Samsung", "On iPhone"] as const;

export default function CheatSheetPage() {
  return (
    <>
      <Masthead
        label="Module 06 · Cheat sheet"
        title="Settings at a glance"
        dek="Starting points, not rules. Values are for manual control (Samsung Pro mode or a manual app); on the stock iPhone app use the tips in the last column."
      >
        <div className="no-print mt-3">
          <PrintButton />
        </div>
      </Masthead>

      {/* Table: 480px and up */}
      <div className="hidden xs:block print:block">
        <table className="w-full table-fixed border-collapse border border-rule text-left text-[13px] leading-snug md:text-[14px]">
          <caption className="sr-only">Recommended settings per scenario for Samsung and iPhone</caption>
          <colgroup>
            <col className="w-[13%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
            <col className="w-[12%]" />
            <col className="w-[21%]" />
            <col className="w-[21%]" />
          </colgroup>
          <thead className="bg-section">
            <tr>
              {COLS.map((c) => (
                <th key={c} scope="col" className="border border-rule px-2 py-2 align-bottom font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRESETS.map((p) => (
              <tr key={p.id} className="align-top even:bg-section/60">
                <th scope="row" className="serif border border-rule px-2 py-2 font-bold">
                  <Link href={`/lab/scenarios#${p.id}`} className="text-ink hover:text-blue">
                    {p.name}
                  </Link>
                </th>
                <td className="border border-rule px-2 py-2">{p.cheat.iso}</td>
                <td className="border border-rule px-2 py-2">{p.cheat.shutter}</td>
                <td className="border border-rule px-2 py-2">{p.cheat.ev}</td>
                <td className="border border-rule px-2 py-2">{p.cheat.wb}</td>
                <td className="border border-rule px-2 py-2">{p.cheat.samsung}</td>
                <td className="border border-rule px-2 py-2">{p.cheat.iphone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards: under 480px */}
      <ul className="grid gap-3 xs:hidden print:hidden">
        {PRESETS.map((p) => (
          <li key={p.id} className="rounded-lg border border-rule bg-white">
            <h2 className="border-b border-rule bg-section px-3 py-2 text-lg font-bold">
              <Link href={`/lab/scenarios#${p.id}`} className="text-ink hover:text-blue">
                {p.name}
              </Link>
            </h2>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 text-[14px]">
              {[
                ["ISO", p.cheat.iso],
                ["Shutter", p.cheat.shutter],
                ["EV", p.cheat.ev],
                ["White balance", p.cheat.wb],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              <div className="col-span-2 border-t border-rule pt-2">
                <dt className="text-[12px] text-muted">On Samsung</dt>
                <dd>{p.cheat.samsung}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[12px] text-muted">On iPhone</dt>
                <dd>{p.cheat.iphone}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid gap-2 md:grid-cols-3">
        <Callout tone="info" title="Handheld shutter floor">
          1/60s for still subjects, 1/250s for people moving, 1/1000s for sport.
        </Callout>
        <Callout tone="caution" title="Protect highlights">
          In doubt, go -0.3 EV. Shadows can be lifted later; blown skies cannot.
        </Callout>
        <Callout tone="good" title="Stay on 1x in low light">
          The main camera usually has the biggest sensor and brightest lens.
        </Callout>
      </div>
      <p className="mt-4 text-[13px] text-muted">
        Features and menu names vary by model and software version. Telephoto, Expert RAW, ProRAW and high resolution modes are
        available on supported models only.
      </p>
    </>
  );
}
