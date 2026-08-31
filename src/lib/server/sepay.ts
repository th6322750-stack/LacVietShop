/**
 * Nạp tiền qua SePay.
 *
 * Cách hoạt động: khách chọn số tiền → mình tạo một lệnh nạp kèm MÃ riêng →
 * khách chuyển khoản với mã đó trong nội dung → SePay thấy tiền về, bắn webhook
 * sang mình → mình khớp mã, cộng số dư.
 *
 * Cấu hình trong biến môi trường (Vercel: Settings → Environment Variables):
 *   SEPAY_WEBHOOK_KEY     khoá mình tự đặt, dán y hệt vào ô Bảo mật của webhook
 *                         bên SePay. Không có khoá thì mọi request đều bị từ chối.
 *   SEPAY_ACCOUNT_NUMBER  số tài khoản nhận tiền đã liên kết trong SePay
 *   SEPAY_BANK            mã ngân hàng cho ảnh QR, ví dụ VietinBank
 *   SEPAY_ACCOUNT_NAME    tên chủ tài khoản, chỉ để hiển thị
 */
import crypto from "node:crypto";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/sepay.ts chỉ được dùng phía server.");
}

export const sepayConfig = {
  webhookKey: process.env.SEPAY_WEBHOOK_KEY?.trim() ?? "",
  accountNumber: process.env.SEPAY_ACCOUNT_NUMBER?.trim() ?? "",
  bank: process.env.SEPAY_BANK?.trim() || "VietinBank",
  accountName: process.env.SEPAY_ACCOUNT_NAME?.trim() ?? "",
};

export const sepayReady = () => Boolean(sepayConfig.accountNumber);
export const sepayWebhookReady = () => Boolean(sepayConfig.webhookKey);

/**
 * Mã nội dung chuyển khoản. Chỉ chữ hoa và số vì nhiều ngân hàng bỏ dấu và ký tự
 * lạ trong nội dung; bỏ các ký tự dễ đọc nhầm (0/O, 1/I) cho khách gõ tay đỡ sai.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function newDepositCode() {
  const bytes = crypto.randomBytes(8);
  let out = "LV";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/** Tìm mã lệnh nạp trong nội dung chuyển khoản ngân hàng gửi sang. */
export function extractCode(content: string) {
  const cleaned = content.toUpperCase().replace(/[^A-Z0-9]/g, " ");
  const match = cleaned.match(/\bLV[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}\b/);
  return match ? match[0] : null;
}

/** Ảnh QR do SePay dựng sẵn — quét là điền đủ số tài khoản, số tiền, nội dung. */
export function qrImageUrl(amount: number, code: string) {
  if (!sepayReady()) return null;
  const params = new URLSearchParams({
    acc: sepayConfig.accountNumber,
    bank: sepayConfig.bank,
    amount: String(Math.round(amount)),
    des: code,
    template: "compact",
  });
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

/** Payload SePay gửi tới webhook. */
export interface SepayWebhook {
  id: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  content?: string;
  transferType?: "in" | "out";
  transferAmount?: number;
  referenceCode?: string;
  description?: string;
}

/**
 * Kiểm tra khoá trong header. SePay gửi dạng `Authorization: Apikey <khoá>`.
 * So sánh theo thời gian cố định để không lộ dần khoá qua thời gian phản hồi.
 */
export function verifyWebhookKey(header: string | null) {
  if (!sepayWebhookReady()) return false;
  const given = (header ?? "").replace(/^Apikey\s+/i, "").trim();
  const a = Buffer.from(given);
  const b = Buffer.from(sepayConfig.webhookKey);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
