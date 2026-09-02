import { NextResponse } from "next/server";
import { registerAccount, SESSION_COOKIE, sessionMaxAge, cookieFlags } from "@/lib/server/auth";
import { registerSchema } from "../_schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu đăng ký không hợp lệ." }, { status: 400 });
  }

  const res = await registerAccount(parsed.data);
  if (!res.ok) return NextResponse.json(res, { status: 409 });

  const out = NextResponse.json({ ok: true, account: res.account });
  out.cookies.set(SESSION_COOKIE, res.token, cookieFlags(sessionMaxAge));
  return out;
}
