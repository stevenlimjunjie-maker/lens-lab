"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { SimCanvas, type SimParams } from "@/components/sim/SimCanvas";
import { QUIZ, type QuizItem } from "@/lib/content";
import { SCENES } from "@/lib/scenes";
import { noiseForIso, shakeBlur } from "@/lib/exposure";

export function quizParams(q: QuizItem): SimParams {
  const def = SCENES[q.scene];
  const t = q.params.shutter ?? 1 / 1000;
  const focus = q.params.focus === "far" ? def.far?.depth : q.params.focus === "near" ? def.near?.depth : undefined;
  return {
    stops: q.params.stops,
    noise: noiseForIso(q.params.iso ?? 100),
    motion: def.light.motion * t,
    shake: shakeBlur(t, !!q.params.handheld) * 1.6,
    dof: q.params.portrait ? 0.012 : 0.0015,
    focus,
    wbK: q.params.wbK,
    seed: 5,
  };
}

export function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const q = QUIZ[i];
  const params = useMemo(() => quizParams(q), [q]);

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (i + 1 >= QUIZ.length) {
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
    requestAnimationFrame(() => headRef.current?.focus());
  };

  const restart = () => {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    requestAnimationFrame(() => headRef.current?.focus());
  };

  if (done) {
    const pct = score / QUIZ.length;
    return (
      <div className="rounded-lg border border-ink bg-white p-5 text-center">
        <h2 ref={headRef} tabIndex={-1} className="text-2xl font-bold outline-none">
          You scored
        </h2>
        <p className="serif mt-1 text-6xl font-bold text-blue">
          {score}
          <span className="text-3xl text-muted">/{QUIZ.length}</span>
        </p>
        <p className="mt-3 text-[16px] text-ink-2">
          {pct === 1
            ? "Perfect. You can diagnose a photo like a pro."
            : pct >= 0.6
              ? "Solid. Review the ones you missed in the simulator."
              : "Good start. The Exposure and Pro modules will make these click."}
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={restart} className="min-h-12 rounded-md bg-blue px-5 font-semibold text-white">
            Try again
          </button>
          <Link href="/cheat-sheet" className="inline-flex min-h-12 items-center justify-center rounded-md border border-rule px-5 font-semibold text-blue">
            Open the cheat sheet
          </Link>
        </div>
      </div>
    );
  }

  const correct = picked === q.answer;
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-[14px]">
          <span className="font-semibold text-ink-2">
            Question {i + 1} of {QUIZ.length}
          </span>
          <span className="text-muted" aria-live="polite">
            Score: <span className="font-semibold text-ink">{score}</span>
          </span>
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
          <div className="h-full bg-blue transition-all" style={{ width: `${(i / QUIZ.length) * 100}%` }} />
        </div>
        <SimCanvas scene={q.scene} params={params} label={`Problem photo: ${SCENES[q.scene].alt}. ${q.problem}`} />
      </div>
      <div>
        <h2 ref={headRef} tabIndex={-1} className="text-xl leading-snug font-bold outline-none">
          {q.problem}
        </h2>
        <p className="mt-1 text-[15px] text-ink-2">Which change fixes it?</p>
        <ul className="mt-3 grid gap-2">
          {q.options.map((o, n) => {
            const isAnswer = n === q.answer;
            const isPicked = n === picked;
            let cls = "border-rule bg-white text-ink hover:border-blue";
            if (picked !== null) {
              if (isAnswer) cls = "border-good bg-good-soft text-ink";
              else if (isPicked) cls = "border-bad bg-bad-soft text-ink";
              else cls = "border-rule bg-white text-muted";
            }
            return (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => choose(n)}
                  aria-disabled={picked !== null}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-md border-2 px-3 py-2 text-left text-[15px] font-medium ${cls}`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-[13px] font-bold"
                  >
                    {picked !== null && isAnswer ? "✓" : picked !== null && isPicked ? "✕" : String.fromCharCode(65 + n)}
                  </span>
                  <span>{o}</span>
                  {picked !== null && isAnswer && <span className="sr-only">(correct answer)</span>}
                  {picked !== null && isPicked && !isAnswer && <span className="sr-only">(your answer, incorrect)</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <div aria-live="assertive">
          {picked !== null && (
            <div className={`mt-3 rounded-md border-l-4 p-3 ${correct ? "border-good bg-good-soft" : "border-bad bg-bad-soft"}`}>
              <p className={`font-semibold ${correct ? "text-good" : "text-bad"}`}>{correct ? "Correct" : "Not quite"}</p>
              <p className="text-[15px] text-ink">{q.explain}</p>
            </div>
          )}
        </div>
        {picked !== null && (
          <button type="button" onClick={next} className="mt-3 min-h-12 w-full rounded-md bg-blue px-5 font-semibold text-white">
            {i + 1 >= QUIZ.length ? "See your score" : "Next photo"}
          </button>
        )}
      </div>
    </div>
  );
}
