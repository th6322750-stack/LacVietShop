"use client";

import * as React from "react";
import { IconCheck, IconCopy, IconQrcode } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AssetImage } from "./AssetImage";

export function ChartCard({
  title,
  description,
  action,
  height = 280,
  children,
  footer,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="lv-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-lv-border px-5 py-4">
        <div>
          <h2 className="text-h3 text-lv-text">{title}</h2>
          {description ? <p className="mt-1 text-small text-lv-muted">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-3 sm:p-4" style={{ height }}>
        {children}
      </div>
      {footer ? <div className="border-t border-lv-border px-5 py-3">{footer}</div> : null}
    </section>
  );
}

/** Khối QR: chưa có cấu hình thanh toán thật nên hiển thị ô TODO_ASSET rõ ràng. */
export function QRCard({
  assetKey,
  title,
  lines,
  notice,
}: {
  assetKey: string;
  title: string;
  lines: { label: string; value: string; copyable?: boolean }[];
  notice?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="shrink-0">
        <AssetImage assetKey={assetKey} className="h-40 w-40" rounded="card" showLabel />
        <p className="mt-2 flex items-center justify-center gap-1 text-small text-lv-muted">
          <IconQrcode size={14} />
          {title}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <dl className="divide-y divide-lv-border">
          {lines.map((l) => (
            <div key={l.label} className="flex items-center justify-between gap-3 py-2">
              <dt className="text-small text-lv-muted">{l.label}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate text-body-strong text-lv-text">{l.value}</span>
                {l.copyable ? <CopyButton value={l.value} /> : null}
              </dd>
            </div>
          ))}
        </dl>
        {notice ? <div className="mt-3">{notice}</div> : null}
      </div>
    </div>
  );
}

export function CopyButton({ value, label = "Sao chép" }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label}: ${value}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-control border border-lv-border px-2 py-1 text-small-strong text-lv-navy-700 transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50"
    >
      {copied ? <IconCheck size={14} className="text-lv-success" /> : <IconCopy size={14} />}
      {copied ? "Đã chép" : label}
    </button>
  );
}

export function CodeBlock({
  code,
  language = "bash",
  title,
  masked,
}: {
  code: string;
  language?: string;
  title?: string;
  masked?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-lv-navy-900 bg-lv-navy-950">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-small-strong text-white/80">{title ?? language}</span>
          {masked ? <Badge tone="gold">token đã che</Badge> : null}
        </div>
        <CopyDark value={code} />
      </div>
      <pre className="lv-scroll-x px-4 py-3 text-small leading-relaxed text-white/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyDark({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-control border border-white/15 px-2 py-1 text-small-strong text-white/80 transition-colors duration-button hover:bg-white/10",
      )}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {copied ? "Đã chép" : "Sao chép"}
    </button>
  );
}
