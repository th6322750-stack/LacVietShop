/** Đăng nhập quản trị phía máy chủ — cấp cookie để mở khoá các đường ghi. */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken, adminMaxAge, adminProfile, loginAdmin, logoutAdmin } from "@/lib/server/admin";
import { cookieFlags } from "@/lib/server/auth";
import { ipFromRequest, loginBlocked, noteLoginFail, clearLoginFails } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) });

export async function GET() {
  const jar = await cookies();
  const who = await adminForToken(jar.get(ADMIN_COOKIE)?.value);
  // Trả kèm bộ quyền để trình duyệt không phải tự tra một danh sách cắm cứng.
  return NextResponse.json({ ok: true, admin: who, profile: who ? adminProfile(who) : null });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Thiếu tài khoản hoặc mật khẩu." }, { status: 400 });
  }

  const key = `admin:${ipFromRequest(request)}:${parsed.data.username.toLowerCase()}`;
  const wait = loginBlocked(key);
  if (wait > 0) {
    return NextResponse.json(
      { ok: false, error: `Sai quá nhiều lần. Thử lại sau ${Math.ceil(wait / 60)} phút.` },
      { status: 429, headers: { "retry-after": String(wait) } },
    );
  }

  const session = await loginAdmin(parsed.data.username, parsed.data.password);
  if (!session) {
    noteLoginFail(key);
    return NextResponse.json({ ok: false, error: "Tài khoản hoặc mật khẩu không đúng." }, { status: 401 });
  }
  clearLoginFails(key);

  const out = NextResponse.json({
    ok: true,
    admin: session.username,
    profile: adminProfile(session.username),
  });
  out.cookies.set(ADMIN_COOKIE, session.token, cookieFlags(adminMaxAge));
  return out;
}

export async function DELETE() {
  const jar = await cookies();
  await logoutAdmin(jar.get(ADMIN_COOKIE)?.value);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(ADMIN_COOKIE, "", cookieFlags(0));
  return out;
}
