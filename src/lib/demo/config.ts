/**
 * CẤU HÌNH DEMO — tách biệt hoàn toàn khỏi adapter production.
 *
 * PROJECT_HANDOFF §12: khi chưa có domain/liên hệ/thanh toán/catalog/auth/backend thật,
 * dùng dữ liệu DEMO có kiểu rõ ràng, KHÔNG tạo hiệu ứng phụ thật (không chuyển tiền,
 * không gọi API thật, không tạo tài khoản/DNS thật) và ghi gap vào
 * .webby/FINAL_GAPS_REPORT.md.
 *
 * Mọi giá trị dưới đây là GIẢ ĐỊNH TRÌNH DIỄN, không phải dữ liệu kinh doanh thật.
 */

export const DEMO_MODE = true as const;

/** Khoá gap tương ứng .webby/FINAL_GAPS_REPORT.md — dùng để đánh dấu chỗ cần giá trị thật. */
export type GapKey =
  | "brand.domain"
  | "brand.contact"
  | "payment.receivingAccount"
  | "payment.gateway"
  | "catalog.pricing"
  | "auth.provider"
  | "backend.orderApi"
  | "backend.apiTokens"
  | "affiliate.commissionPolicy"
  | "childPanel.provisioning";

export interface DemoBrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  /** Domain thật chưa được cấp — xem gap brand.domain. */
  domain: string;
  supportHours: string;
  supportChannels: { label: string; value: string; gap: GapKey }[];
}

export const demoBrand: DemoBrandConfig = {
  name: "Lạc Việt Media Agency",
  shortName: "Lạc Việt",
  tagline: "Giải pháp tăng trưởng số toàn diện & bền vững",
  domain: "demo.lacviet.invalid",
  supportHours: "08:00 – 22:00 hằng ngày",
  supportChannels: [
    { label: "Hotline", value: "Chưa cấu hình", gap: "brand.contact" },
    { label: "Zalo OA", value: "Chưa cấu hình", gap: "brand.contact" },
    { label: "Email", value: "Chưa cấu hình", gap: "brand.contact" },
  ],
};

/**
 * Ranh giới adapter: UI chỉ gọi qua đây. Khi có backend thật, thay phần thân
 * bằng adapter production, không phải sửa từng màn hình.
 */
export interface CommerceAdapter {
  readonly mode: "DEMO" | "PRODUCTION";
  /** Đặt đơn: bản DEMO chỉ trả về mã đơn giả lập, không tạo hiệu ứng phụ. */
  submitOrder(input: { serverId: string; quantity: number; target: string }): Promise<
    { ok: true; orderCode: string; demo: true } | { ok: false; error: string }
  >;
  /** Nạp tiền: bản DEMO không bao giờ chạm tới tiền thật. */
  submitDeposit(input: { methodId: string; amount: number }): Promise<
    { ok: true; reference: string; demo: true } | { ok: false; error: string }
  >;
}

let demoSequence = 4820;

export const commerceAdapter: CommerceAdapter = {
  mode: "DEMO",
  async submitOrder(input) {
    if (!input.target.trim()) return { ok: false, error: "Chưa nhập liên kết hoặc ID." };
    if (input.quantity <= 0) return { ok: false, error: "Số lượng phải lớn hơn 0." };
    await wait(450);
    demoSequence += 1;
    return { ok: true, orderCode: `DEMO-${demoSequence}`, demo: true };
  },
  async submitDeposit(input) {
    if (input.amount <= 0) return { ok: false, error: "Số tiền phải lớn hơn 0." };
    await wait(450);
    demoSequence += 1;
    // Không gọi cổng thanh toán nào. Xem gap payment.gateway / payment.receivingAccount.
    return { ok: true, reference: `DEMO-NAP-${demoSequence}`, demo: true };
  },
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Thông tin chuyển khoản hiển thị trong màn Nạp tiền — CHƯA phải tài khoản thật. */
export const demoPaymentNotice = {
  headline: "Bảng thanh toán DEMO — chưa kết nối cổng thật",
  detail:
    "Chưa có tài khoản nhận tiền và cổng thanh toán được duyệt, nên khối này chỉ mô phỏng giao diện. Không chuyển tiền theo bất kỳ thông tin nào hiển thị ở đây.",
  gaps: ["payment.receivingAccount", "payment.gateway"] satisfies GapKey[],
};
