"use client";

import { useId } from "react";

/**
 * Stepped slider over a list of discrete values (ISO stops, shutter speeds...).
 * The native range input keeps keyboard and screen reader support; the 44px
 * tall hit area and 28px thumb keep it usable with a thumb.
 */
export function StepSlider<T>({
  label,
  values,
  index,
  onChange,
  format,
  disabled,
  hint,
  fill = "#1d4ed8",
  valueTone,
}: {
  label: string;
  values: readonly T[];
  index: number;
  onChange: (index: number) => void;
  format: (v: T) => string;
  disabled?: boolean;
  hint?: React.ReactNode;
  fill?: string;
  valueTone?: "good" | "caution" | "bad";
}) {
  const id = useId();
  const pct = values.length > 1 ? (index / (values.length - 1)) * 100 : 0;
  const text = format(values[index]);
  const tone =
    valueTone === "bad" ? "text-bad" : valueTone === "caution" ? "text-caution-ink" : valueTone === "good" ? "text-good" : "text-ink";
  return (
    <div className={disabled ? "opacity-80" : ""}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-medium text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className={`serif text-[18px] font-bold tabular-nums ${tone}`}>
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="lens-range"
        min={0}
        max={values.length - 1}
        step={1}
        value={index}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--pct" as string]: `${pct}%`, ["--fill" as string]: fill }}
      />
      {hint && <p className="-mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

/** Continuous slider. */
export function RangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
  hint,
  fill = "#1d4ed8",
  track,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint?: React.ReactNode;
  fill?: string;
  /** Optional CSS gradient for the track (e.g. warm to cool for white balance). */
  track?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const text = format(value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-medium text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="serif text-[18px] font-bold text-ink tabular-nums">
          {text}
        </output>
      </div>
      <div className="relative">
        {track && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
            style={{ background: track }}
          />
        )}
        <input
          id={id}
          type="range"
          className="lens-range relative"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={text}
          onChange={(e) => onChange(Number(e.target.value))}
          style={
            track
              ? { ["--pct" as string]: "0%", ["--fill" as string]: fill, background: "transparent" }
              : { ["--pct" as string]: `${pct}%`, ["--fill" as string]: fill }
          }
          data-track={track ? "custom" : undefined}
        />
      </div>
      {hint && <p className="-mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  );
}

/** Segmented control implemented as a radio group. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel,
  size = "md",
}: {
  label: string;
  options: readonly { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
  hideLabel?: boolean;
  size?: "md" | "sm";
}) {
  const name = useId();
  return (
    <fieldset className="min-w-0">
      <legend className={hideLabel ? "sr-only" : "mb-1.5 text-[14px] font-medium text-ink-2"}>{label}</legend>
      <div
        className="grid gap-1 rounded-lg border border-rule bg-white p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className={`relative flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-md px-1 text-center leading-tight has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-blue ${
                checked ? "bg-blue text-white" : "text-ink-2 hover:bg-section"
              } ${size === "sm" ? "text-[13px]" : "text-[14px]"}`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span className="font-semibold">{o.label}</span>
              {o.sub && <span className={`text-[11px] ${checked ? "text-white/90" : "text-muted"}`}>{o.sub}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Accessible switch. */
export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[14px] font-medium text-ink-2">
          {label}
        </label>
        {description && <p className="text-[12px] text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-11 w-[60px] shrink-0 items-center justify-center"
      >
        <span
          aria-hidden="true"
          className={`block h-7 w-12 rounded-full transition-colors ${checked ? "bg-blue" : "bg-zinc-400"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute top-1/2 left-[9px] h-[22px] w-[22px] -translate-y-1/2 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[20px]" : ""
          }`}
        />
      </button>
    </div>
  );
}

/** Tabs with proper ARIA roles and arrow key support. */
export function Tabs<T extends string>({
  label,
  tabs,
  value,
  onChange,
}: {
  label: string;
  tabs: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const base = useId();
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 border-b border-rule"
      onKeyDown={(e) => {
        const i = tabs.findIndex((t) => t.value === value);
        let next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (next >= 0) {
          e.preventDefault();
          onChange(tabs[next].value);
          document.getElementById(`${base}-${tabs[next].value}`)?.focus();
        }
      }}
    >
      {tabs.map((t) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            id={`${base}-${t.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={`-mb-px min-h-11 flex-1 border-b-2 px-2 text-[15px] font-semibold ${
              selected ? "border-blue text-blue" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
