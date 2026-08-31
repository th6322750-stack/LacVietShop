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
import fs from "node:fs";
import path from "node:path";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/pricing.ts chỉ được dùng phía server.");
}

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "lacviet-pricing.json");

export type PriceRule =
  | { type: "percent"; value: number }
  | { type: "fixed"; value: number };

export interface PricingRules {
  /** Hệ số bán ra chung. 1 = bán đúng giá vốn, 1.2 = cộng 20%. */
  globalMarkup: number;
  /** Quy tắc riêng, khoá là mã dịch vụ của nhà cung cấp. */
  overrides: Record<string, PriceRule>;
  updatedAt: string;
  updatedBy?: string;
}

export const defaultRules = (): PricingRules => ({
  globalMarkup: Number(process.env.THATIM_MARKUP ?? 1) || 1,
  overrides: {},
  updatedAt: new Date().toISOString(),
});

export function readRules(): PricingRules {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<PricingRules>;
    return { ...defaultRules(), ...raw, overrides: raw.overrides ?? {} };
  } catch {
    return defaultRules();
  }
}

export function writeRules(rules: PricingRules) {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rules, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

/** Làm tròn 5 chữ số thập phân — có dịch vụ giá tới 0,03 đồng/tương tác. */
const round = (v: number) => Math.round(v * 1e5) / 1e5;

/**
 * Giá bán cho một dịch vụ. `cost` là đồng/tương tác lấy từ API.
 * Trả về cả cờ `belowCost` để giao diện cảnh báo khi đang bán dưới vốn.
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
