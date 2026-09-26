"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Tab = { href: string; label: string; icon: React.ReactNode };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path {...stroke} d="M3 11 12 4l9 7v9h-6v-6H9v6H3z" />
      </svg>
    ),
  },
  {
    href: "/lab/exposure",
    label: "Exposure",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle {...stroke} cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/lab/lenses",
    label: "Lenses",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle {...stroke} cx="7" cy="8" r="3.2" />
        <circle {...stroke} cx="17" cy="8" r="3.2" />
        <circle {...stroke} cx="12" cy="17" r="3.2" />
      </svg>
    ),
  },
  {
    href: "/lab/pro-controls",
    label: "Pro",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path {...stroke} d="M4 7h10M18 7h2M4 17h4M12 17h8" />
        <circle {...stroke} cx="16" cy="7" r="2" />
        <circle {...stroke} cx="10" cy="17" r="2" />
      </svg>
    ),
  },
];

const MORE = [
  { href: "/lab/scenarios", label: "Scenarios" },
  { href: "/quiz", label: "Quiz" },
  { href: "/cheat-sheet", label: "Cheat sheet" },
  { href: "/about", label: "About and sources" },
];

export function TabBar() {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const moreActive = MORE.some((m) => m.href === pathname);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenAt(null);
        buttonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    menuRef.current?.querySelector("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <nav aria-label="Sections" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-white md:hidden">
      {open && (
        <div
          ref={menuRef}
          id="more-menu"
          className="absolute right-2 bottom-full mb-2 w-56 rounded-lg border border-rule bg-white p-1 shadow-lg"
        >
          <ul>
            {MORE.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  onClick={() => setOpenAt(null)}
                  aria-current={pathname === m.href ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded px-3 text-[15px] ${
                    pathname === m.href ? "bg-blue-soft font-semibold text-blue" : "text-ink hover:bg-section"
                  }`}
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="mx-auto grid max-w-md grid-cols-5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? "text-blue" : "text-muted"
                }`}
              >
                {t.icon}
                {t.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            aria-controls="more-menu"
            onClick={() => setOpenAt(open ? null : pathname)}
            className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              moreActive || open ? "text-blue" : "text-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" fill="currentColor" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <circle cx="19" cy="12" r="1.8" fill="currentColor" />
            </svg>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
