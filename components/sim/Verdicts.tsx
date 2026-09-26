import type { Verdict } from "@/lib/exposure";

const ICON: Record<Verdict["tone"], string> = { good: "✓", caution: "!", bad: "✕" };
const STYLE: Record<Verdict["tone"], string> = {
  good: "border-good bg-good-soft",
  caution: "border-caution bg-caution-soft",
  bad: "border-bad bg-bad-soft",
};
const ICON_STYLE: Record<Verdict["tone"], string> = {
  good: "bg-good text-white",
  caution: "bg-caution text-ink",
  bad: "bg-bad text-white",
};

/** Plain-English verdict lines, announced politely to screen readers. */
export function Verdicts({ items, compact }: { items: Verdict[]; compact?: boolean }) {
  return (
    <ul aria-live="polite" className="grid gap-1.5">
      {items.map((v) => (
        <li key={v.text} className={`flex gap-2.5 rounded-md border-l-4 px-2.5 py-2 ${STYLE[v.tone]}`}>
          <span
            aria-hidden="true"
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${ICON_STYLE[v.tone]}`}
          >
            {ICON[v.tone]}
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">{v.text}</span>
            {!compact && v.detail && <span className="block text-[13px] text-ink-2">{v.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
