"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Tooltip nhẹ: hiện khi hover hoặc focus bàn phím, tự ẩn khi rời. */
export function Tooltip({
  label,
  children,
  side = "right",
}: {
  label: string;
  children: React.ReactNode;
  side?: "right" | "top";
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-40 animate-fade-in whitespace-nowrap rounded-control bg-lv-navy-900 px-2 py-1 text-small text-white shadow-pop",
            side === "right" ? "left-full top-1/2 ml-2 -translate-y-1/2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** Dropdown đóng khi click ra ngoài hoặc nhấn Esc. */
export function Dropdown({
  trigger,
  children,
  align = "end",
  label,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  label: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            "absolute top-[calc(100%+6px)] z-40 min-w-[220px] animate-fade-in rounded-card border border-lv-border bg-lv-surface p-1.5 shadow-pop",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  children,
  onSelect,
  icon,
  tone = "default",
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  icon?: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-body transition-colors duration-button",
        tone === "danger" ? "text-lv-danger hover:bg-lv-danger/10" : "text-lv-navy-700 hover:bg-lv-gold-50",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
