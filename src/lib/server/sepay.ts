/**
 * Nạp tiền qua SePay.
 *
 * Cách hoạt động: khách chọn số tiền → mình tạo một lệnh nạp kèm MÃ riêng →
 * khách chuyển khoản với mã đó trong nội dung → SePay thấy tiền về, bắn webhook
 * sang mình → mình khớp mã, cộng số dư.
 *
 * Cấu hình trong biến môi trường (Vercel: Settings → Environment Variables):
 *   SEPAY_WEBHOOK_KEY     Secret Key của webhook bên SePay (dạng whsec_…).
 *                         Không có khoá thì mọi request đều bị từ chối.
 *   SEPAY_ACCOUNT_NUMBER  số tài khoản nhận tiền đã liên kết trong SePay
 *   SEPAY_BANK            mã ngân hàng cho ảnh QR, ví dụ VietinBank
 *   SEPAY_ACCOUNT_NAME    tên chủ tài khoản, chỉ để hiển thị
 *   SEPAY_CONTENT_PREFIX  tiền tố bắt buộc trong nội dung chuyển khoản, mặc định
 *                         SEVQR (VietinBank yêu cầu). Ngân hàng khác không cần thì để trống.
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
  /**
   * Tiền tố bắt buộc trong nội dung chuyển khoản.
   *
   * VietinBank chỉ đẩy biến động số dư sang SePay khi nội dung BẮT ĐẦU bằng
   * "SEVQR". Thiếu tiền tố này thì tiền vẫn về tài khoản nhưng SePay không hề
   * biết, webhook không bắn, số dư trên web không cộng.
   *
   * Ngân hàng khác không đòi thì để trống bằng SEPAY_CONTENT_PREFIX="".
   */
  contentPrefix: (process.env.SEPAY_CONTENT_PREFIX ?? "SEVQR").trim(),
};

/** Nội dung chuyển khoản đầy đủ mà khách phải giữ nguyên. */
export function transferContent(code: string) {
  return sepayConfig.contentPrefix ? `${sepayConfig.contentPrefix} ${code}` : code;
}

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
    // Phải là nội dung ĐẦY ĐỦ kèm tiền tố, không phải mỗi mã.
    des: transferContent(code),
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

/** So sánh theo thời gian cố định để không lộ dần khoá qua thời gian phản hồi. */
function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

/** Chữ ký cũ hơn ngần này thì từ chối, chống phát lại request đã bắt được. */
const SIGNATURE_MAX_AGE_S = 300;

/**
 * Xác thực webhook. Hỗ trợ cả hai kiểu SePay cho chọn:
 *
 *   HMAC-SHA256 (nên dùng) — header `X-SePay-Signature: sha256=<hex>` và
 *     `X-SePay-Timestamp: <giây>`. Chuỗi ký là `{timestamp}.{body thô}`. Kiểu này
 *     ký cả nội dung nên sửa một byte là phát hiện, lại chống được phát lại.
 *
 *   API Key — header `Authorization: Apikey <khoá>`. Chỉ chứng minh người gửi
 *     biết khoá, không bảo vệ nội dung. Giữ lại phòng khi đổi cấu hình bên SePay.
 *
 * `rawBody` phải là chuỗi gốc chưa qua JSON.parse: ký lại từ object đã parse sẽ
 * ra chữ ký khác vì thứ tự khoá và khoảng trắng không còn như cũ.
 */
export function verifyWebhook(headers: Headers, rawBody: string) {
  if (!sepayWebhookReady()) return { ok: false as const, reason: "Chưa cấu hình SEPAY_WEBHOOK_KEY." };

  const signature = headers.get("x-sepay-signature");
  if (signature) {
    const timestamp = (headers.get("x-sepay-timestamp") ?? "").trim();
    const seconds = Number(timestamp);
    if (!timestamp || !Number.isFinite(seconds)) {
      return { ok: false as const, reason: "Thiếu X-SePay-Timestamp." };
    }
    if (Math.abs(Date.now() / 1000 - seconds) > SIGNATURE_MAX_AGE_S) {
      return { ok: false as const, reason: "Chữ ký đã quá hạn." };
    }
    const expected =
      "sha256=" +
      crypto.createHmac("sha256", sepayConfig.webhookKey).update(`${timestamp}.${rawBody}`).digest("hex");
    return sameSecret(signature.trim(), expected)
      ? { ok: true as const, method: "hmac" as const }
      : { ok: false as const, reason: "Chữ ký không khớp." };
  }

  const apiKey = (headers.get("authorization") ?? "").replace(/^Apikey\s+/i, "").trim();
  if (apiKey && sameSecret(apiKey, sepayConfig.webhookKey)) {
    return { ok: true as const, method: "apikey" as const };
  }
  return { ok: false as const, reason: "Không có chữ ký hoặc khoá hợp lệ." };
}
