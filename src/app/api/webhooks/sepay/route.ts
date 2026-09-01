/**
 * Webhook SePay — tiền về tài khoản ngân hàng thì SePay gọi vào đây.
 *
 * Dán địa chỉ này vào ô "URL nhận webhook" bên SePay:
 *   https://<tên-miền>/api/webhooks/sepay
 * và đặt khoá ở bước Bảo mật đúng bằng SEPAY_WEBHOOK_KEY.
 *
 * Nguyên tắc:
 *   - Không có khoá đúng thì từ chối. Đây là đường cộng tiền, để hở là mất tiền.
 *   - Chỉ nhận giao dịch tiền vào.
 *   - Khớp theo mã trong nội dung chuyển khoản.
 *   - Cùng một mã giao dịch SePay chỉ cộng tiền đúng một lần (sepay_id là khoá duy nhất).
 *   - Cộng đúng số tiền THỰC SỰ nhận được, không phải số khách bấm lúc tạo lệnh.
 */
import { NextResponse } from "next/server";
import { depositBySepayId, findPendingDepositByCode, markPaidAndCredit } from "@/lib/server/db";
import { extractCode, sepayWebhookReady, verifyWebhook, type SepayWebhook } from "@/lib/server/sepay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sepayWebhookReady()) {
    return NextResponse.json({ success: false, message: "Chưa cấu hình SEPAY_WEBHOOK_KEY." }, { status: 503 });
  }
  // Đọc body THÔ: chữ ký HMAC ký trên đúng chuỗi này, parse rồi dựng lại sẽ khác.
  const rawBody = await request.text();
  const auth = verifyWebhook(request.headers, rawBody);
  if (!auth.ok) {
    return NextResponse.json({ success: false, message: auth.reason }, { status: 401 });
  }

  let body: SepayWebhook | null = null;
  try {
    body = JSON.parse(rawBody) as SepayWebhook;
  } catch {
    body = null;
  }
  if (!body?.id) {
    return NextResponse.json({ success: false, message: "Thiếu dữ liệu giao dịch." }, { status: 400 });
  }

  // Trả 200 cho các trường hợp không khớp: đây không phải lỗi của SePay, và
  // trả lỗi chỉ khiến họ gửi lại mãi một giao dịch không bao giờ khớp được.
  if (body.transferType && body.transferType !== "in") {
    return NextResponse.json({ success: true, message: "Bỏ qua giao dịch tiền ra." });
  }

  const sepayId = String(body.id);
  if (await depositBySepayId(sepayId)) {
    return NextResponse.json({ success: true, message: "Giao dịch đã xử lý trước đó." });
  }

  const code = extractCode(`${body.content ?? ""} ${body.description ?? ""}`);
  if (!code) {
    return NextResponse.json({ success: true, message: "Nội dung chuyển khoản không có mã lệnh nạp." });
  }

  const deposit = await findPendingDepositByCode(code);
  if (!deposit) {
    return NextResponse.json({ success: true, message: `Không thấy lệnh nạp đang chờ cho mã ${code}.` });
  }

  const received = Math.round(Number(body.transferAmount ?? 0));
  if (received <= 0) {
    return NextResponse.json({ success: true, message: "Số tiền không hợp lệ." });
  }

  const note =
    received === deposit.amount
      ? `${body.gateway ?? "bank"} · ${body.referenceCode ?? ""}`.trim()
      : `Khách chuyển ${received}đ thay vì ${deposit.amount}đ · ${body.gateway ?? "bank"} ${body.referenceCode ?? ""}`.trim();

  // Đánh dấu đã nhận VÀ cộng tiền trong một thao tác: không còn khe hở nào để
  // lệnh bị đánh dấu xong mà tiền chưa vào.
  const res = await markPaidAndCredit(deposit.id, sepayId, note, received);
  if (!res.credited) {
    return NextResponse.json({ success: true, message: "Lệnh nạp đã được xử lý." });
  }
  return NextResponse.json({ success: true, message: `Đã cộng ${received}đ cho lệnh ${code}.` });
}
