/**
 * Đổi mật khẩu khi đang đăng nhập.
 *
 * Khác với luồng quên mật khẩu (gửi mã về email), ở đây khách đã đăng nhập nên
 * chỉ cần xác nhận lại mật khẩu hiện tại.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { accountForToken, changePassword, SESSION_COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  current: z.string().min(1, "Nhập mật khẩu hiện tại."),
  next: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự.").max(128),
});

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = await accountForToken(token);
  if (!account || !token) return NextResponse.json({ ok: false, error: "Chưa đăng nhập." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: issue?.message ?? "Dữ liệu không hợp lệ.", field: issue?.path[0] },
      { status: 400 },
    );
  }

  const res = await changePassword(account.id, parsed.data.current, parsed.data.next, token);
  if (!res.ok) return NextResponse.json(res, { status: 400 });
  return NextResponse.json({ ok: true });
}
