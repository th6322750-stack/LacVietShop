import * as React from "react";
import Link from "next/link";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import { AssetImage } from "./AssetImage";
import { Badge } from "@/components/ui/Badge";
import type { ProductPackage, ProductVariant } from "@/types";

export function PlatformTile({
  name,
  assetKey,
  selected,
  onClick,
  href,
  count,
}: {
  name: string;
  assetKey: string;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  count?: number;
}) {
  const inner = (
    <>
      <AssetImage assetKey={assetKey} className="h-9 w-9" rounded="control" />
      <span className="mt-2 line-clamp-1 text-small-strong text-lv-navy-700">{name}</span>
      {typeof count === "number" ? (
        <span className="text-small text-lv-muted">{count} dịch vụ</span>
      ) : null}
    </>
  );

  const cls = cn(
    "flex w-full flex-col items-center justify-center rounded-card border p-3 text-center transition-all duration-card hover:-translate-y-0.5 hover:shadow-card-hover",
    selected
      ? "border-lv-gold-500 bg-lv-gold-50 ring-1 ring-lv-gold-500/40"
      : "border-lv-border bg-lv-surface hover:border-lv-border-gold",
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={cls}>
      {inner}
    </button>
  );
}

export function ProductCard({ product }: { product: ProductVariant }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col rounded-card border border-lv-border bg-lv-surface p-4 transition-all duration-card hover:-translate-y-0.5 hover:border-lv-border-gold hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <AssetImage assetKey={product.assetKey} className="h-11 w-11 shrink-0" rounded="control" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-card-title text-lv-text">{product.name}</h3>
          <p className="mt-0.5 text-small text-lv-muted">{product.category}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-small text-lv-muted">{product.tagline}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {product.badges.slice(0, 2).map((b) => (
          <Badge key={b} tone="gold">
            {b}
          </Badge>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-small text-lv-muted">Chỉ từ</p>
            <p className="lv-price text-h3 text-lv-gold-700">{formatMoney(product.fromPrice)}</p>
          </div>
        </div>
        <span className="mt-3 block rounded-control border border-lv-border-gold bg-lv-gold-50 py-2 text-center text-button text-lv-gold-700 transition-colors duration-button group-hover:bg-lv-gold-600 group-hover:text-white">
          Xem chi tiết
        </span>
      </div>
    </Link>
  );
}

export function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: ProductPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const discount =
    pkg.originalPrice && pkg.originalPrice > pkg.price
      ? Math.round((1 - pkg.price / pkg.originalPrice) * 100)
      : null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!pkg.inStock}
      onClick={onSelect}
      className={cn(
        "relative flex h-full flex-col rounded-card border p-4 text-left transition-all duration-card",
        selected
          ? "border-lv-gold-500 bg-lv-gold-50 ring-1 ring-lv-gold-500/40"
          : "border-lv-border bg-lv-surface hover:-translate-y-0.5 hover:border-lv-border-gold hover:shadow-card-hover",
        !pkg.inStock && "cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none",
      )}
    >
      {pkg.badge ? (
        <span className="absolute -top-2.5 left-4">
          <Badge tone={pkg.highlight ? "gold" : "neutral"}>{pkg.badge}</Badge>
        </span>
      ) : null}

      <p className="text-card-title text-lv-text">{pkg.name}</p>
      <p className="text-small text-lv-muted">{pkg.duration}</p>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="lv-price text-h2 text-lv-gold-700">{formatMoney(pkg.price)}</span>
        {pkg.originalPrice ? (
          <span className="lv-price text-small text-lv-muted line-through">{formatMoney(pkg.originalPrice)}</span>
        ) : null}
      </p>
      {discount ? <p className="mt-1 text-small-strong text-lv-success">Tiết kiệm {discount}%</p> : null}

      <ul className="mt-3 space-y-1.5">
        {pkg.bullets.map((b) => (
          <li key={b} className="flex gap-2 text-small text-lv-navy-700">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lv-gold-500" />
            {b}
          </li>
        ))}
      </ul>

      {!pkg.inStock ? (
        <p className="mt-3 text-small-strong text-lv-danger">Tạm hết hàng</p>
      ) : null}
    </button>
  );
}

export function OrderSummaryRow({
  label,
  value,
  strong,
  tone,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  tone?: "muted" | "gold" | "danger";
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className={cn("text-small", strong ? "text-lv-text" : "text-lv-muted")}>{label}</span>
      <span
        className={cn(
          "lv-price text-right",
          strong ? "text-body-strong text-lv-text" : "text-small text-lv-navy-700",
          tone === "gold" && "text-lv-gold-700",
          tone === "danger" && "text-lv-danger",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "gold",
  showValue = true,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: "gold" | "success" | "info" | "danger";
  showValue?: boolean;
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const barTone = {
    gold: "bg-lv-gold-500",
    success: "bg-lv-success",
    info: "bg-lv-info",
    danger: "bg-lv-danger",
  }[tone];

  return (
    <div>
      {label || showValue ? (
        <div className="mb-1 flex items-center justify-between gap-2 text-small text-lv-muted">
          {label ? <span>{label}</span> : <span />}
          {showValue ? (
            <span className="lv-price text-small-strong text-lv-navy-700">
              {formatNumber(value)} / {formatNumber(max)}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-pill bg-lv-border"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Tiến độ"}
      >
        <div
          className={cn("h-full rounded-pill transition-[width] duration-progress ease-out", barTone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
