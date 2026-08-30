"use client";

import * as React from "react";
import { IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/** Trạng thái form theo PROJECT_HANDOFF §9. */
export type FieldTone = "default" | "success" | "warning" | "invalid";

const toneRing: Record<FieldTone, string> = {
  default: "border-lv-border focus:border-lv-gold-500",
  success: "border-lv-success/60 focus:border-lv-success",
  warning: "border-lv-warning/60 focus:border-lv-warning",
  invalid: "border-lv-danger/70 focus:border-lv-danger",
};

const controlBase =
  "w-full rounded-control border bg-lv-surface px-3 text-body text-lv-text placeholder:text-lv-muted/70 transition-colors duration-button outline-none disabled:cursor-not-allowed disabled:bg-lv-bg disabled:text-lv-muted";

export function Label({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-label text-lv-navy-700">
      {children}
      {required ? (
        <span className="text-lv-danger" aria-hidden>
          *
        </span>
      ) : null}
      {hint ? <span className="ml-1 text-small font-normal text-lv-muted">{hint}</span> : null}
    </label>
  );
}

export function FieldMessage({ tone = "invalid", children }: { tone?: FieldTone; children?: React.ReactNode }) {
  if (!children) return null;
  const color =
    tone === "invalid"
      ? "text-lv-danger"
      : tone === "warning"
        ? "text-lv-warning"
        : tone === "success"
          ? "text-lv-success"
          : "text-lv-muted";
  return (
    <p className={cn("mt-1.5 text-small", color)} role={tone === "invalid" ? "alert" : undefined}>
      {children}
    </p>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> & { tone?: FieldTone; prefix?: React.ReactNode }
>(function Input({ className, tone = "default", prefix, ...props }, ref) {
  if (prefix) {
    return (
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-control border bg-lv-surface px-3 transition-colors duration-button focus-within:border-lv-gold-500",
          toneRing[tone],
          className,
        )}
      >
        <span className="shrink-0 text-lv-muted">{prefix}</span>
        <input
          ref={ref}
          className="h-full w-full bg-transparent text-body text-lv-text outline-none placeholder:text-lv-muted/70"
          {...props}
        />
      </div>
    );
  }
  return <input ref={ref} className={cn(controlBase, "h-10", toneRing[tone], className)} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { tone?: FieldTone }
>(function Textarea({ className, tone = "default", rows = 3, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} className={cn(controlBase, "py-2", toneRing[tone], className)} {...props} />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { tone?: FieldTone }
>(function Select({ className, tone = "default", children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(controlBase, "h-10 pr-8", toneRing[tone], className)} {...props}>
      {children}
    </select>
  );
});

export function Checkbox({
  label,
  description,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; description?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-lv-border text-lv-gold-600 accent-lv-gold-600"
        {...props}
      />
      <span>
        <span className="block text-body text-lv-text">{label}</span>
        {description ? <span className="block text-small text-lv-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      {label ? (
        <span>
          <label htmlFor={id} className="block text-body-strong text-lv-text">
            {label}
          </label>
          {description ? <span className="block text-small text-lv-muted">{description}</span> : null}
        </span>
      ) : null}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === "string" ? label : "Bật tắt"}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-button disabled:opacity-50",
          checked ? "bg-lv-gold-600" : "bg-lv-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-button",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function RadioCard({
  checked,
  onSelect,
  title,
  subtitle,
  right,
  disabled,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full rounded-card border p-3 text-left transition-colors duration-card",
        checked
          ? "border-lv-gold-500 bg-lv-gold-50 ring-1 ring-lv-gold-500/40"
          : "border-lv-border bg-lv-surface hover:border-lv-border-gold",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-body-strong text-lv-text">
            {title}
            {checked ? <IconCheck size={16} className="shrink-0 text-lv-gold-600" /> : null}
          </span>
          {subtitle ? <span className="mt-0.5 block text-small text-lv-muted">{subtitle}</span> : null}
        </span>
        {right ? <span className="shrink-0 text-right">{right}</span> : null}
      </span>
      {children}
    </button>
  );
}
