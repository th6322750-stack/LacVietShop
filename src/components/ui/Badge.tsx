import * as React from "react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type Tone = "neutral" | "gold" | "success" | "warning" | "danger" | "info" | "navy";

const tones: Record<Tone, string> = {
  neutral: "bg-lv-bg text-lv-muted border-lv-border",
  gold: "bg-lv-gold-50 text-lv-gold-700 border-lv-border-gold",
  success: "bg-lv-success/10 text-lv-success border-lv-success/25",
  warning: "bg-lv-warning/10 text-lv-warning border-lv-warning/25",
  danger: "bg-lv-danger/10 text-lv-danger border-lv-danger/25",
  info: "bg-lv-info/10 text-lv-info border-lv-info/25",
  navy: "bg-lv-navy-900 text-white border-lv-navy-900",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  icon,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-small-strong whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Màu trạng thái đơn giữ đúng ngữ nghĩa (PROJECT_HANDOFF §8). */
const statusTone: Record<OrderStatus, Tone> = {
  completed: "success",
  running: "info",
  processing: "gold",
  pending: "warning",
  refunded: "danger",
  canceled: "neutral",
};

const statusText: Record<OrderStatus, string> = {
  completed: "Hoàn thành",
  running: "Đang chạy",
  processing: "Đang xử lý",
  pending: "Đang chờ",
  refunded: "Đã hoàn tiền",
  canceled: "Đã huỷ",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={statusTone[status]}>{statusText[status]}</Badge>;
}

export { statusText, statusTone };
