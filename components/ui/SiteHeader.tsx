import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { NavLinks } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="no-print -mx-[14px] border-b border-rule bg-white">
      <div className="h-[3px] bg-ink" aria-hidden="true" />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-[14px] py-1.5">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2 text-ink">
          <LogoMark size={26} />
          <span className="serif text-lg font-bold">Lens Lab</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
