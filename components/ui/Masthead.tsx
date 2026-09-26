export function Masthead({
  label,
  title,
  dek,
  children,
}: {
  label: string;
  title: string;
  dek?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-6 pb-2">
      <div className="border-t border-ink pt-2">
        <p className="smallcaps text-[13px] text-muted">{label}</p>
      </div>
      <h1 className="mt-2 text-[28px] leading-tight font-bold text-ink sm:text-4xl">{title}</h1>
      {dek && <p className="mt-3 max-w-2xl text-[16px] text-ink-2">{dek}</p>}
      {children}
    </header>
  );
}
