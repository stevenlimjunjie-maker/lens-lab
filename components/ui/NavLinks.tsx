"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ABOUT, NAV } from "@/lib/site";

/** Tablet and desktop top navigation (phones use the bottom tab bar). */
export function NavLinks() {
  const pathname = usePathname();
  const items = [...NAV, ABOUT];
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex flex-wrap items-center justify-end gap-x-0.5 text-sm">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded px-2.5 ${
                  active ? "font-semibold text-blue underline underline-offset-4" : "text-ink-2 hover:text-blue"
                }`}
              >
                {item.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
