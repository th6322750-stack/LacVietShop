import * as React from "react";
import { getAsset } from "@/lib/assets";
import { cn, initialsOf } from "@/lib/utils";

/**
 * Ô ảnh thương hiệu duy nhất của app.
 *
 * Asset đã giao  -> render ảnh thật.
 * Asset còn thiếu -> render ô trung tính giữ đúng layout, gắn `data-todo-asset`
 *                    để dò lại được và KHÔNG mạo danh asset thật
 *                    (.webby/asset-manifest.json → placeholderPolicy).
 */
export function AssetImage({
  assetKey,
  className,
  rounded = "card",
  ratio,
  label,
  showLabel = false,
  decorative = false,
}: {
  assetKey: string;
  className?: string;
  rounded?: "card" | "full" | "control" | "panel" | "none";
  ratio?: string;
  label?: string;
  showLabel?: boolean;
  decorative?: boolean;
}) {
  const asset = getAsset(assetKey);
  const text = label ?? asset?.label ?? assetKey;
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "control"
        ? "rounded-control"
        : rounded === "panel"
          ? "rounded-panel"
          : rounded === "none"
            ? ""
            : "rounded-card";

  if (asset?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.src}
        alt={decorative ? "" : text}
        aria-hidden={decorative || undefined}
        className={cn("object-contain", radius, className)}
        style={ratio ? { aspectRatio: ratio } : undefined}
      />
    );
  }

  return (
    <span
      data-todo-asset={assetKey}
      role={decorative ? "presentation" : "img"}
      aria-label={decorative ? undefined : `${text} (ảnh chưa có)`}
      title={`TODO_ASSET:${assetKey}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
      className={cn(
        "flex select-none items-center justify-center overflow-hidden border border-dashed border-lv-border-gold bg-lv-gold-50 text-lv-gold-700",
        radius,
        className,
      )}
    >
      {showLabel ? (
        <span className="px-2 text-center text-small-strong leading-tight">{text}</span>
      ) : (
        <span className="text-small-strong tracking-wide">{initialsOf(text)}</span>
      )}
    </span>
  );
}
