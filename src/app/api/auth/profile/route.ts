/**
 * Đổi tên hiển thị và số điện thoại của tài khoản đang đăng nhập.
 *
 * Không nhận email ở đây: email là nơi nhận mã đặt lại mật khẩu nên đổi phải có
 * bước xác minh riêng, chưa làm thì thà không cho đổi còn hơn cho đổi hớ.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { accountForToken, SESSION_COOKIE } from "@/lib/server/auth";
import { findAccount, updateAccountProfile } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Tên hiển thị tối thiểu 2 ký tự.").max(60, "Tên hiển thị tối đa 60 ký tự."),
  // Để trống được: khách đăng ký không phải nhập số, ai muốn thì bổ sung sau.
  phone: z
    .string()
    .trim()
    .max(15)
    .refine((v) => v === "" || /^0[0-9]{9}$/.test(v), "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0."),
});

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = await accountForToken(token);
  if (!account) return NextResponse.json({ ok: false, error: "Chưa đăng nhập." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: issue?.message ?? "Dữ liệu không hợp lệ.", field: issue?.path[0] },
      { status: 400 },
    );
  }

  await updateAccountProfile(account.id, parsed.data);
  const fresh = await findAccount({ id: account.id });
  return NextResponse.json({
    ok: true,
    account: fresh
      ? {
          id: fresh.id,
          name: fresh.name,
          username: fresh.username,
          email: fresh.email,
          phone: fresh.phone,
          balance: fresh.balance,
          createdAt: fresh.createdAt,
        }
      : null,
  });
}
