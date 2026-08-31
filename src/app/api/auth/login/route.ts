import { NextResponse } from "next/server";
import { loginAccount, SESSION_COOKIE, sessionMaxAge } from "@/lib/server/auth";
import { loginSchema } from "../_schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Thiếu tên đăng nhập hoặc mật khẩu." }, { status: 400 });
  }

  const res = await loginAccount(parsed.data.identifier, parsed.data.password);
  if (!res.ok) return NextResponse.json(res, { status: 401 });

  const out = NextResponse.json({ ok: true, account: res.account });
  out.cookies.set(SESSION_COOKIE, res.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
  return out;
}
