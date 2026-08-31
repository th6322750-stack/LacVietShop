import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { accountForToken, SESSION_COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const account = accountForToken(jar.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ ok: true, account });
}
