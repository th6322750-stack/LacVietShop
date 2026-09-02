import { NextResponse, after } from "next/server";
import { createResetCode } from "@/lib/server/auth";
import { sendResetCode, smtpConfigured } from "@/lib/server/mailer";
import { forgotSchema } from "../_schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = forgotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Email không hợp lệ." }, { status: 400 });
  }

  // Tạo mã + gửi mail chạy SAU khi đã trả lời (after). Nếu làm trước rồi mới trả,
  // email tồn tại phải chờ tra DB + băm + gửi SMTP (~1s) còn email lạ trả ngay —
  // thời gian phản hồi tố cáo email nào đã đăng ký, dù nội dung trả về giống hệt.
  // Hoãn lại thì mọi lời gọi trả về tức thì như nhau, không dò được qua thời gian.
  const email = parsed.data.email;
  after(async () => {
    try {
      const created = await createResetCode(email);
      if (created) await sendResetCode(created.account.email, created.account.name, created.code);
    } catch {
      // Nuốt lỗi: người gửi không được biết email có tồn tại hay khâu gửi có lỗi.
    }
  });

  // Trả lời GIỐNG NHAU dù email có tồn tại hay không — chỉ nói kênh gửi ở mức
  // chung của hệ thống, không hé lộ tài khoản nào cả.
  return NextResponse.json({ ok: true, delivery: smtpConfigured() ? "smtp" : "console" });
}
