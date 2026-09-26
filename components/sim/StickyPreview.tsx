import type { Stats, Verdict } from "@/lib/exposure";
import { Histogram } from "./Histogram";

const BLEED = {
  // Matches the 14px body padding on pages.
  page: "-mx-[14px] px-[14px] bg-white",
  // Matches the padding of <Section> (p-3.5, sm:p-5).
  section: "-mx-3.5 px-3.5 sm:-mx-5 sm:px-5 bg-section",
};

/**
 * On phones the preview sticks to the top of the screen so every slider
 * change stays visible. From md up it becomes a normal sticky side column.
 */
export function StickyPreview({
  children,
  bleed = "page",
  footer,
}: {
  children: React.ReactNode;
  bleed?: keyof typeof BLEED;
  /** Compact status shown under the image on phones only. */
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={`sticky top-0 z-20 border-b border-rule pt-2 pb-2 shadow-[0_6px_12px_-10px_rgba(0,0,0,0.35)] md:top-4 md:mx-0 md:self-start md:border-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0 md:shadow-none ${BLEED[bleed]}`}
    >
      {/* Cap the height on short phones so the controls keep room below. */}
      <div className="mx-auto w-full max-w-[calc(40svh*4/3)] md:max-w-none">{children}</div>
      {footer && <div className="mx-auto mt-1.5 w-full max-w-[calc(40svh*4/3)] md:hidden">{footer}</div>}
    </div>
  );
}

const RANK: Record<Verdict["tone"], number> = { bad: 0, caution: 1, good: 2 };
const DOT: Record<Verdict["tone"], string> = { good: "bg-good", caution: "bg-caution", bad: "bg-bad" };
const TEXT: Record<Verdict["tone"], string> = { good: "text-good", caution: "text-caution-ink", bad: "text-bad" };

/** One line verdict plus a mini histogram, for the sticky preview on phones. */
export function CompactStatus({ verdicts, stats }: { verdicts: Verdict[]; stats?: Stats | null }) {
  const worst = [...verdicts].sort((a, b) => RANK[a.tone] - RANK[b.tone])[0];
  const more = verdicts.filter((v) => v.tone !== "good").length - (worst?.tone === "good" ? 0 : 1);
  return (
    // Hidden from assistive tech: the full verdict list below is the live region.
    <div aria-hidden="true" className="flex items-center gap-2">
      {worst && (
        <p className={`flex min-w-0 flex-1 items-center gap-1.5 text-[14px] leading-tight font-semibold ${TEXT[worst.tone]}`}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[worst.tone]}`} />
          <span className="truncate">{worst.text}</span>
          {more > 0 && <span className="shrink-0 font-normal text-muted">+{more}</span>}
        </p>
      )}
      {stats !== undefined && (
        <div className="w-24 shrink-0">
          <Histogram stats={stats} compact />
        </div>
      )}
    </div>
  );
}
