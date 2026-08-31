import { NextResponse } from "next/server";
import { createResetCode } from "@/lib/server/auth";
import { sendResetCode, smtpConfigured } from "@/lib/server/mailer";
import { forgotSchema } from "../_schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = forgotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Email không hợp lệ." }, { status: 400 });
  }

  const created = await createResetCode(parsed.data.email);

  // Trả lời GIỐNG NHAU dù email có tồn tại hay không. Nếu phân biệt, người ngoài
  // dò được danh sách email đã đăng ký trên hệ thống.
  const answer = {
    ok: true,
    // Chỉ nói kênh gửi ở mức chung của hệ thống, không hé lộ tài khoản nào cả.
    delivery: smtpConfigured() ? ("smtp" as const) : ("console" as const),
  };

  if (!created) return NextResponse.json(answer);

  const sent = await sendResetCode(created.account.email, created.account.name, created.code);
  return NextResponse.json({ ...answer, delivery: sent.delivery });
}
