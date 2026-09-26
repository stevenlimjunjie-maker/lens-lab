"use client";

import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { NAV } from "@/lib/site";

const THUMBS: Record<string, string> = {
  "/lab/exposure": "street",
  "/lab/lenses": "landscape",
  "/lab/pro-controls": "food",
  "/lab/scenarios": "portrait",
  "/quiz": "night",
  "/cheat-sheet": "indoor",
};

export function ModuleCards() {
  // MotionConfig handles prefers-reduced-motion without a server/client render difference.
  return (
    <MotionConfig reducedMotion="user">
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {NAV.map((n, i) => (
        <motion.li
          key={n.href}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 + i * 0.08 }}
        >
          <Link
            href={n.href}
            className="group grid h-full grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-lg border border-rule bg-white p-2.5 hover:border-blue sm:grid-cols-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/samples/${THUMBS[n.href]}-480.webp`}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              className="aspect-[4/3] h-auto w-full rounded object-cover"
            />
            <span className="min-w-0 self-center sm:self-start">
              <span className="smallcaps block text-[12px] text-muted">Module {n.number}</span>
              <span className="serif block text-[18px] leading-snug font-bold text-ink group-hover:text-blue">{n.label}</span>
              <span className="mt-0.5 block text-[14px] text-ink-2">{n.blurb}</span>
            </span>
          </Link>
        </motion.li>
      ))}
    </ul>
    </MotionConfig>
  );
}
