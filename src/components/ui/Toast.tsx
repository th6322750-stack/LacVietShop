"use client";

import * as React from "react";
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải nằm trong <ToastProvider>");
  return ctx;
}

let seq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((toast: Omit<ToastItem, "id">) => {
    seq += 1;
    const id = seq;
    setItems((prev) => [...prev, { ...toast, id }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = React.useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
      >
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => setItems((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toneStyles: Record<ToastTone, { border: string; icon: React.ReactNode }> = {
  success: { border: "border-l-lv-success", icon: <IconCircleCheck size={18} className="text-lv-success" /> },
  error: { border: "border-l-lv-danger", icon: <IconAlertTriangle size={18} className="text-lv-danger" /> },
  warning: { border: "border-l-lv-warning", icon: <IconAlertTriangle size={18} className="text-lv-warning" /> },
  info: { border: "border-l-lv-info", icon: <IconInfoCircle size={18} className="text-lv-info" /> },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const tone = toneStyles[item.tone];
  return (
    <div
      className={cn(
        "pointer-events-auto flex animate-fade-in items-start gap-3 rounded-card border border-l-4 border-lv-border bg-lv-surface p-3 shadow-pop",
        tone.border,
      )}
      role="status"
    >
      <span className="mt-0.5 shrink-0">{tone.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-body-strong text-lv-text">{item.title}</p>
        {item.description ? <p className="mt-0.5 text-small text-lv-muted">{item.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="shrink-0 rounded p-0.5 text-lv-muted hover:text-lv-text"
      >
        <IconX size={16} />
      </button>
    </div>
  );
}
