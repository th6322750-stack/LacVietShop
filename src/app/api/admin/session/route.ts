/** Đăng nhập quản trị phía máy chủ — cấp cookie để mở khoá các đường ghi. */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken, adminMaxAge, loginAdmin, logoutAdmin } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

const schema = z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) });

export async function GET() {
  const jar = await cookies();
  return NextResponse.json({ ok: true, admin: adminForToken(jar.get(ADMIN_COOKIE)?.value) });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Thiếu tài khoản hoặc mật khẩu." }, { status: 400 });
  }

  const session = loginAdmin(parsed.data.username, parsed.data.password);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Tài khoản hoặc mật khẩu không đúng." }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true, admin: session.username });
  out.cookies.set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: adminMaxAge,
  });
  return out;
}

export async function DELETE() {
  const jar = await cookies();
  logoutAdmin(jar.get(ADMIN_COOKIE)?.value);
  const out = NextResponse.json({ ok: true });
  out.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return out;
}
