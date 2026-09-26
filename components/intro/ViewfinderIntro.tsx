"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const TOTAL_MS = 7200;
const KEY = "lenslab-intro-played";

type DialSpec = { label: string; values: string[]; angles: number[] };

const DIALS: DialSpec[] = [
  { label: "ISO", values: ["100", "1600", "200"], angles: [0, 120, 30] },
  { label: "Shutter", values: ["1/30", "1/1000", "1/250"], angles: [-40, 110, 50] },
  { label: "Lens", values: ["1x", "0.5x", "3x"], angles: [0, -90, 90] },
];

// Step times (ms) at which the dials move to their next value.
const STEPS = [0, 1700, 3400];

function Dial({ spec, step, still }: { spec: DialSpec; step: number; still: boolean }) {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 80 80" className="h-[58px] w-[58px] sm:h-[76px] sm:w-[76px]" aria-hidden="true">
        <circle cx="40" cy="40" r="36" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.35)" />
        <motion.g
          style={{ originX: "40px", originY: "40px" }}
          initial={false}
          animate={{ rotate: spec.angles[step] }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 12 }}
        >
          {ticks.map((a) => (
            <line
              key={a}
              x1="40"
              y1="7"
              x2="40"
              y2={a % 45 === 0 ? 15 : 11}
              stroke={a === 0 ? "#f59e0b" : "rgba(255,255,255,0.7)"}
              strokeWidth={a === 0 ? 3 : 1.2}
              transform={`rotate(${a} 40 40)`}
            />
          ))}
        </motion.g>
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="var(--font-serif)">
          {spec.values[step]}
        </text>
      </svg>
      <span className="text-[11px] font-semibold tracking-wider text-white/85 uppercase">{spec.label}</span>
    </div>
  );
}

/**
 * Animated viewfinder intro. Under 8 seconds, skippable, plays once per
 * session and shows the final frame immediately for reduced motion users.
 */
export function ViewfinderIntro() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const [step, setStep] = useState(0);

  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem(KEY) === "1";
    } catch {
      played = false;
    }
    if (reduce || played) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      setStep(2);
      return;
    }
    setPhase("playing");
    const timers = [
      ...STEPS.slice(1).map((t, i) => window.setTimeout(() => setStep(i + 1), t)),
      window.setTimeout(() => setPhase("done"), TOTAL_MS),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce]);

  useEffect(() => {
    if (phase !== "done") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable: intro simply plays again next time */
    }
  }, [phase]);

  const skip = () => {
    setStep(2);
    setPhase("done");
  };

  const playing = phase === "playing";
  const still = phase !== "playing";

  return (
    <section aria-labelledby="intro-title" className="relative -mx-[14px] overflow-hidden bg-[#0d0d10] sm:mx-0 sm:mt-4 sm:rounded-xl">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9]">
        {/* scene */}
        <motion.picture
          className="absolute inset-0"
          initial={false}
          animate={playing ? { scale: [1.15, 1.02, 1.08, 1.0], opacity: 1 } : { scale: 1, opacity: 0.8 }}
          transition={playing ? { duration: 6.5, times: [0, 0.3, 0.6, 1], ease: "easeInOut" } : { duration: 0.8 }}
        >
          <source srcSet="/samples/street-800.webp" media="(max-width: 640px)" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/samples/street-1280.webp" alt="" className="h-full w-full object-cover" fetchPriority="high" />
        </motion.picture>

        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/35 to-black/10" aria-hidden="true" />

        {/* grid and brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g stroke="rgba(255,255,255,0.35)" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
            <line x1="33.3" y1="0" x2="33.3" y2="100" vectorEffect="non-scaling-stroke" />
            <line x1="66.6" y1="0" x2="66.6" y2="100" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="33.3" x2="100" y2="33.3" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="66.6" x2="100" y2="66.6" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-3 sm:inset-5" aria-hidden="true">
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "right-0 bottom-0 border-r-2 border-b-2"].map((c) => (
            <motion.span
              key={c}
              className={`absolute h-6 w-6 border-white ${c}`}
              initial={playing ? { opacity: 0, scale: 1.6 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </div>

        {/* focus square */}
        <AnimatePresence>
          {playing && step >= 1 && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-[44%] left-[52%] h-14 w-14 border-2 border-[#f59e0b]"
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: [1.6, 0.9, 1], opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          )}
        </AnimatePresence>

        {/* status pill */}
        <AnimatePresence>
          {playing && step === 2 && (
            <motion.p
              className="absolute top-[58%] left-[46%] rounded-full bg-[#1a6b3a] px-3 py-1 text-[13px] font-semibold text-white"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Well exposed
            </motion.p>
          )}
        </AnimatePresence>

        {/* headline stays visible throughout so it is never hidden from readers */}
        <div className="absolute inset-x-0 top-0 px-5 pt-16 sm:px-10 sm:pt-14">
          <p className="smallcaps text-[13px] text-white/85">An interactive lab for Samsung Galaxy and iPhone</p>
          <h1 id="intro-title" className="mt-2 max-w-xl text-[30px] leading-[1.12] font-bold text-white sm:text-5xl">
            Learn what every camera setting on your phone really does.
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/lab/exposure"
              className="inline-flex min-h-12 items-center rounded-md bg-[#1d4ed8] px-5 text-[16px] font-semibold text-white hover:bg-[#1e40af]"
            >
              Start the lab
            </Link>
            <a
              href="#video"
              className="inline-flex min-h-12 items-center rounded-md border border-white/60 px-5 text-[16px] font-semibold text-white hover:bg-white/10"
            >
              Watch the video
            </a>
          </div>
        </div>

        {/* dials */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-4 bg-linear-to-t from-black/70 to-transparent px-3 pt-10 pb-4 sm:gap-8">
          {DIALS.map((d) => (
            <Dial key={d.label} spec={d} step={step} still={still} />
          ))}
        </div>

        {playing && (
          <button
            type="button"
            onClick={skip}
            className="absolute top-3 right-3 min-h-11 rounded-full bg-black/60 px-4 text-[14px] font-semibold text-white hover:bg-black/80"
          >
            Skip intro
          </button>
        )}
      </div>
    </section>
  );
}
