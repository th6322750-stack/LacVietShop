import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const vnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const vndPrecise = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

/** 1250000 -> "1.250.000 ₫" */
export function formatMoney(amount: number, withSymbol = true) {
  const value = vnd.format(Math.round(amount));
  return withSymbol ? `${value} ₫` : value;
}

/** Đơn giá lẻ (2,3 ₫/tương tác) */
export function formatUnitPrice(amount: number) {
  return `${vndPrecise.format(amount)} ₫`;
}

export function formatNumber(value: number) {
  return vnd.format(value);
}

export function formatCompact(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `${vndPrecise.format(value / 1_000_000_000)} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${vndPrecise.format(value / 1_000_000)} tr`;
  if (Math.abs(value) >= 1_000) return `${vnd.format(value / 1_000)}k`;
  return vnd.format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

/** ISO -> "30/08/2026 14:05" (ổn định giữa server và client, không phụ thuộc locale máy) */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(
    d.getUTCMinutes(),
  )}`;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
}

/** Khoảng cách ngày, dùng cho hạn dùng sản phẩm. */
export function daysUntil(iso: string, from = "2026-08-30T00:00:00.000Z") {
  const ms = new Date(iso).getTime() - new Date(from).getTime();
  return Math.ceil(ms / 86_400_000);
}

/** Che chuỗi nhạy cảm: "lv_live_abc123def" -> "lv_live_••••••••def" (§13) */
export function maskSecret(value: string, visibleTail = 4) {
  if (value.length <= visibleTail) return "•".repeat(value.length);
  const head = value.slice(0, Math.min(8, Math.max(0, value.length - visibleTail - 4)));
  return `${head}${"•".repeat(8)}${value.slice(-visibleTail)}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
