import * as React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn, formatPercent } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  padded = true,
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={cn("lv-card", className)}>
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-lv-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-h3 text-lv-text">{title}</h2>
            {description ? <p className="mt-1 text-small text-lv-muted">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(padded ? "p-5" : "", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  trend,
  tone = "gold",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: number;
  tone?: "gold" | "navy" | "success" | "info" | "danger";
  hint?: string;
}) {
  const toneClass = {
    gold: "bg-lv-gold-50 text-lv-gold-700 border-lv-border-gold",
    navy: "bg-lv-navy-900/5 text-lv-navy-900 border-lv-border",
    success: "bg-lv-success/10 text-lv-success border-lv-success/20",
    info: "bg-lv-info/10 text-lv-info border-lv-info/20",
    danger: "bg-lv-danger/10 text-lv-danger border-lv-danger/20",
  }[tone];

  return (
    <div className="lv-card p-5 transition-shadow duration-card hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-small text-lv-muted">{label}</p>
          <p className="mt-1 flex items-baseline gap-1 text-metric text-lv-text">
            <span className="lv-price">{value}</span>
            {suffix ? <span className="text-body text-lv-muted">{suffix}</span> : null}
          </p>
          {hint ? <p className="mt-1 text-small text-lv-muted">{hint}</p> : null}
        </div>
        {icon ? (
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-card border", toneClass)}>
            {icon}
          </span>
        ) : null}
      </div>
      {typeof trend === "number" ? (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-small-strong",
            trend >= 0 ? "text-lv-success" : "text-lv-danger",
          )}
        >
          {trend >= 0 ? <IconTrendingUp size={15} /> : <IconTrendingDown size={15} />}
          {formatPercent(Math.abs(trend))} so với tháng trước
        </p>
      ) : null}
    </div>
  );
}

export function InfoCard({
  title,
  children,
  tone = "info",
  icon,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "info" | "warning" | "danger" | "success" | "gold";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    info: "border-lv-info/25 bg-lv-info/[0.06]",
    warning: "border-lv-warning/30 bg-lv-warning/[0.07]",
    danger: "border-lv-danger/30 bg-lv-danger/[0.06]",
    success: "border-lv-success/25 bg-lv-success/[0.06]",
    gold: "border-lv-border-gold bg-lv-gold-50",
  }[tone];

  const titleColor = {
    info: "text-lv-info",
    warning: "text-lv-warning",
    danger: "text-lv-danger",
    success: "text-lv-success",
    gold: "text-lv-gold-700",
  }[tone];

  return (
    <div className={cn("rounded-card border p-4", toneClass)}>
      <p className={cn("flex items-center gap-2 text-body-strong", titleColor)}>
        {icon}
        {title}
      </p>
      <div className="mt-1.5 text-small text-lv-navy-700">{children}</div>
    </div>
  );
}

export function SupportCard({
  title = "Cần hỗ trợ?",
  description = "Đội ngũ Lạc Việt trực hỗ trợ trong khung giờ làm việc.",
  channels,
  action,
}: {
  title?: string;
  description?: string;
  channels: { label: string; value: string }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-lv-border-gold bg-lv-surface-soft p-5">
      <p className="text-card-title text-lv-text">{title}</p>
      <p className="mt-1 text-small text-lv-muted">{description}</p>
      <dl className="mt-3 space-y-2">
        {channels.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 text-small">
            <dt className="text-lv-muted">{c.label}</dt>
            <dd className="font-semibold text-lv-navy-700">{c.value}</dd>
          </div>
        ))}
      </dl>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

