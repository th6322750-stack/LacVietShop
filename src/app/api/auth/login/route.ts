import { NextResponse } from "next/server";
import { loginAccount, SESSION_COOKIE, sessionMaxAge, cookieFlags } from "@/lib/server/auth";
import { loginSchema } from "../_schema";
import { ipFromRequest, loginBlocked, noteLoginFail, clearLoginFails } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Thiếu tên đăng nhập hoặc mật khẩu." }, { status: 400 });
  }

  const key = `login:${ipFromRequest(request)}:${parsed.data.identifier.toLowerCase()}`;
  const wait = await loginBlocked(key);
  if (wait > 0) {
    return NextResponse.json(
      { ok: false, error: `Sai quá nhiều lần. Thử lại sau ${Math.ceil(wait / 60)} phút.` },
      { status: 429, headers: { "retry-after": String(wait) } },
    );
  }

  const res = await loginAccount(parsed.data.identifier, parsed.data.password);
  if (!res.ok) {
    await noteLoginFail(key);
    return NextResponse.json(res, { status: 401 });
  }
  await clearLoginFails(key);

  const out = NextResponse.json({ ok: true, account: res.account });
  out.cookies.set(SESSION_COOKIE, res.token, cookieFlags(sessionMaxAge));
  return out;
}
