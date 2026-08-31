/**
 * Bảng giá bán của mình.
 *
 * Giá lấy từ API nhà cung cấp là GIÁ VỐN. Giá bán cho khách = giá vốn áp quy tắc
 * bên dưới. Quy tắc nằm ở máy chủ chứ không phải trình duyệt, vì khách ở máy khác
 * cũng phải thấy đúng giá quản trị viên đặt.
 *
 * Hai mức:
 *   1. Hệ số chung  — áp cho mọi dịch vụ chưa có quy tắc riêng.
 *   2. Quy tắc riêng theo từng mã dịch vụ, hai kiểu:
 *      - "percent": nhân với giá vốn. Nhà cung cấp tăng giá thì giá bán tăng theo,
 *        không bao giờ lỗ. Đây là kiểu nên dùng.
 *      - "fixed": giá bán cố định. Tiện khi muốn một con số tròn, nhưng nhà cung
 *        cấp tăng giá vốn thì có thể thành bán dưới vốn — nơi gọi phải cảnh báo.
 */
import { getPricing, putPricing, type PriceRule, type PricingRules } from "./db";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/pricing.ts chỉ được dùng phía server.");
}

export type { PriceRule, PricingRules };

export const defaultRules = (): PricingRules => ({
  globalMarkup: Number(process.env.THATIM_MARKUP ?? 1) || 1,
  overrides: {},
  updatedAt: new Date().toISOString(),
});

export async function readRules(): Promise<PricingRules> {
  return (await getPricing()) ?? defaultRules();
}

export async function writeRules(rules: PricingRules) {
  await putPricing(rules);
}

/** Làm tròn 5 chữ số thập phân — có dịch vụ giá tới 0,03 đồng/tương tác. */
const round = (v: number) => Math.round(v * 1e5) / 1e5;

/**
 * Giá bán cho một dịch vụ. `cost` là đồng/tương tác lấy từ API.
 * Trả kèm cờ `belowCost` để giao diện cảnh báo khi đang bán dưới vốn.
 */
export function sellingPrice(cost: number, apiServiceId: string | null, rules: PricingRules) {
  const rule = apiServiceId ? rules.overrides[apiServiceId] : undefined;

  if (rule?.type === "fixed") {
    return { price: round(rule.value), source: "fixed" as const, belowCost: rule.value < cost };
  }
  const factor = rule?.type === "percent" ? rule.value : rules.globalMarkup;
  const price = round(cost * factor);
  return { price, source: rule ? ("percent" as const) : ("global" as const), belowCost: price < cost };
}
