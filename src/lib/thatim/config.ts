/**
 * Cấu hình kết nối API nhà cung cấp (thatim.vn API v2).
 *
 * CHỈ dùng phía server. Khoá API không bao giờ được đưa xuống trình duyệt:
 * mọi lời gọi đi qua route handler trong src/app/api/thatim/*.
 *
 * Biến môi trường (đặt trong .env.local — tệp này đã nằm trong .gitignore):
 *   THATIM_API_URL       mặc định https://thatim.vn/api/v2
 *   THATIM_API_KEY       khoá API — bắt buộc, không có thì hệ thống chạy dữ liệu DEMO
 *   THATIM_USD_TO_VND    tỷ giá quy đổi, mặc định 26000 (đã đối chiếu khớp bảng giá của họ)
 *   THATIM_MARKUP        hệ số bán ra so với giá gốc, mặc định 1 (bán đúng giá gốc)
 *   THATIM_ALLOW_ORDERS  "true" mới cho phép đẩy đơn thật; mặc định tắt
 */

if (typeof window !== "undefined") {
  throw new Error("src/lib/thatim/config.ts chỉ được dùng phía server.");
}

function numberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const thatimConfig = {
  url: process.env.THATIM_API_URL?.trim() || "https://thatim.vn/api/v2",
  key: process.env.THATIM_API_KEY?.trim() || "",
  /**
   * API trả giá theo USD/1.000 tương tác. Đã kiểm chứng: rate × 26.000 ÷ 1.000
   * khớp đúng từng đồng với bảng giá công bố trên trang của họ (25/25 máy chủ).
   */
  usdToVnd: numberEnv("THATIM_USD_TO_VND", 26_000),
  /** Hệ số bán ra. 1 = bán đúng giá gốc, 1.2 = cộng 20%. */
  markup: numberEnv("THATIM_MARKUP", 1),
  /** Chặn đẩy đơn thật cho tới khi được bật rõ ràng — đơn đã đẩy là tiêu tiền thật. */
  allowOrders: process.env.THATIM_ALLOW_ORDERS === "true",
  /** Thời gian nhớ tạm danh mục dịch vụ (giây). */
  cacheSeconds: numberEnv("THATIM_CACHE_SECONDS", 300),
};

export const isThatimConfigured = () => thatimConfig.key.length > 0;

/**
 * Giá theo bậc thành viên: bậc 1 là giá gốc, các bậc sau giảm dần.
 * Tỷ lệ lấy từ bảng giá công bố của nhà cung cấp (2.3 / 2.28 / 2.26 / 2.24).
 * Đây là chính sách kinh doanh — sửa ở đây khi chốt bảng giá thật.
 */
export const tierMultipliers = [1, 0.9913, 0.9826, 0.9739];

/** Che khoá khi hiển thị ở trang quản trị hoặc ghi log. */
export function maskKey(key: string) {
  if (!key) return "(chưa cấu hình)";
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}${"•".repeat(Math.min(16, key.length - 8))}${key.slice(-4)}`;
}
