"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-rule bg-white px-4 text-[15px] font-semibold text-blue hover:bg-blue-soft"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z" />
      </svg>
      Print or save as PDF
    </button>
  );
}
