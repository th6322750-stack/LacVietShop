import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold-soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-lv-gold-600 text-white hover:bg-lv-gold-700 active:bg-lv-gold-700 disabled:bg-lv-gold-400 shadow-sm",
  secondary:
    "border border-lv-border bg-lv-surface text-lv-text hover:border-lv-border-gold hover:bg-lv-gold-50",
  ghost: "text-lv-navy-700 hover:bg-lv-gold-50 hover:text-lv-gold-700",
  danger: "bg-lv-danger text-white hover:brightness-95",
  "gold-soft": "bg-lv-gold-100 text-lv-gold-700 hover:bg-lv-gold-50 border border-lv-border-gold",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-small-strong rounded-control gap-1.5",
  md: "h-10 px-4 text-button rounded-control gap-2",
  lg: "h-12 px-5 text-button rounded-control gap-2",
};

const base =
  "inline-flex items-center justify-center font-semibold transition-colors duration-button ease-out disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: React.ReactNode;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  block,
  icon,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], block && "w-full", className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
