import Link from "next/link";
import { NAV } from "@/lib/site";

export function NextModule({ current }: { current: string }) {
  const i = NAV.findIndex((n) => n.href === current);
  const next = NAV[(i + 1) % NAV.length];
  return (
    <nav aria-label="Next module" className="mt-6">
      <Link
        href={next.href}
        className="group flex min-h-16 items-center justify-between gap-3 rounded-lg border border-ink bg-white px-4 py-3 hover:bg-blue-soft"
      >
        <span className="min-w-0">
          <span className="smallcaps block text-[12px] text-muted">Next · {next.number}</span>
          <span className="serif block text-lg font-bold text-ink group-hover:text-blue">{next.label}</span>
        </span>
        <span aria-hidden="true" className="text-2xl text-blue">
          →
        </span>
      </Link>
    </nav>
  );
}
