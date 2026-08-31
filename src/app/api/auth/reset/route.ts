import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/server/auth";
import { resetSchema } from "../_schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Mã gồm 6 số và mật khẩu tối thiểu 8 ký tự." }, { status: 400 });
  }

  const res = await resetPassword(parsed.data.email, parsed.data.code, parsed.data.password);
  if (!res.ok) return NextResponse.json(res, { status: 400 });
  return NextResponse.json({ ok: true });
}
