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
import { addBalance, depositBySepayId, findPendingDepositByCode, markDepositPaid } from "@/lib/server/db";
import { extractCode, sepayWebhookReady, verifyWebhookKey, type SepayWebhook } from "@/lib/server/sepay";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sepayWebhookReady()) {
    return NextResponse.json({ success: false, message: "Chưa cấu hình SEPAY_WEBHOOK_KEY." }, { status: 503 });
  }
  if (!verifyWebhookKey(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, message: "Khoá không hợp lệ." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as SepayWebhook | null;
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

  const paid = await markDepositPaid(deposit.id, sepayId, note);
  if (!paid) {
    // Một luồng khác vừa xử lý xong lệnh này.
    return NextResponse.json({ success: true, message: "Lệnh nạp đã được xử lý." });
  }

  if (paid.accountId) await addBalance(paid.accountId, received);

  return NextResponse.json({ success: true, message: `Đã cộng ${received}đ cho lệnh ${code}.` });
}
