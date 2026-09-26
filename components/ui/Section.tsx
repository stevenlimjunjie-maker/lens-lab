export function Section({
  id,
  label,
  title,
  children,
  className = "",
}: {
  id?: string;
  label?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={`mt-5 rounded-lg border border-rule bg-section p-3.5 sm:p-5 ${className}`}
    >
      {label && <p className="smallcaps text-[12px] text-muted">{label}</p>}
      {title && (
        <h2 id={headingId} className="mt-0.5 text-xl leading-snug font-bold sm:text-2xl">
          {title}
        </h2>
      )}
      <div className={title || label ? "mt-3" : ""}>{children}</div>
    </section>
  );
}

export type Tone = "info" | "good" | "caution" | "bad";

const TONES: Record<Tone, string> = {
  info: "border-blue bg-blue-soft",
  good: "border-good bg-good-soft",
  caution: "border-caution bg-caution-soft",
  bad: "border-bad bg-bad-soft",
};

export function Callout({ tone = "info", title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-md border-l-4 px-3 py-2.5 text-[15px] text-ink ${TONES[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-0.5" : ""}>{children}</div>
    </div>
  );
}

export function Badge({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  const map: Record<Tone, string> = {
    info: "bg-blue-soft text-blue",
    good: "bg-good-soft text-good",
    caution: "bg-caution-soft text-caution-ink",
    bad: "bg-bad-soft text-bad",
  };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[12px] font-semibold ${map[tone]}`}>{children}</span>;
}
