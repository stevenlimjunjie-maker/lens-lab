import type { Stats } from "@/lib/exposure";

/** Luminance histogram drawn as an SVG area. Clipped ends are flagged. */
export function Histogram({ stats, compact }: { stats: Stats | null; compact?: boolean }) {
  const bins = stats?.hist ?? new Array(64).fill(0);
  const max = Math.max(0.02, ...bins.slice(1, 63));
  const W = 256;
  const H = 64;
  const pts = bins.map((b, i) => {
    const x = (i / 63) * W;
    const y = H - Math.min(1, b / max) * (H - 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
  const clipped = (stats?.clipped ?? 0) > 0.02;
  const crushed = (stats?.crushed ?? 0) > 0.08;
  const summary = stats
    ? `Histogram: average brightness ${Math.round(stats.mean * 100)} percent, ${Math.round(stats.clipped * 100)} percent of pixels clipped to white, ${Math.round(stats.crushed * 100)} percent near black.`
    : "Histogram loading";
  if (compact) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-7 w-full rounded border border-rule bg-white" preserveAspectRatio="none">
        <path d={path} fill="#1d4ed8" fillOpacity="0.3" stroke="#1d4ed8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {crushed && <rect x="0" y="0" width="8" height={H} fill="#f59e0b" />}
        {clipped && <rect x={W - 8} y="0" width="8" height={H} fill="#b91c1c" />}
      </svg>
    );
  }
  return (
    <figure className="rounded-md border border-rule bg-white p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-16 w-full" preserveAspectRatio="none" role="img" aria-label={summary}>
        <rect x="0" y="0" width={W} height={H} fill="#fafafa" />
        {[64, 128, 192].map((x) => (
          <line key={x} x1={x} x2={x} y1={0} y2={H} stroke="#e0e0e0" strokeWidth="1" />
        ))}
        <path d={path} fill="#1d4ed8" fillOpacity="0.28" stroke="#1d4ed8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {crushed && <rect x="0" y="0" width="6" height={H} fill="#f59e0b" />}
        {clipped && <rect x={W - 6} y="0" width="6" height={H} fill="#b91c1c" />}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[12px] text-muted">
        <span>Shadows</span>
        <span>Histogram</span>
        <span className={clipped ? "font-semibold text-bad" : ""}>{clipped ? "Clipped" : "Highlights"}</span>
      </figcaption>
    </figure>
  );
}
