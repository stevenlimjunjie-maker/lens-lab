import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print -mx-[14px] mb-[57px] border-t border-rule bg-section md:mb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-[14px] py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Lens Lab is an independent learning project. Camera features vary by model and software version.</p>
        <p className="flex gap-4">
          <Link className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-blue" href="/about">
            About and sources
          </Link>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-blue" href="/cheat-sheet">
            Cheat sheet
          </Link>
        </p>
      </div>
    </footer>
  );
}
