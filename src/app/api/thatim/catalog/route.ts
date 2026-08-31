/**
 * Danh mục dịch vụ cho giao diện. Trả cây nền tảng → dịch vụ → máy chủ đã quy
 * đổi sang đồng; khoá API nằm lại phía server.
 */
import { NextResponse } from "next/server";
import { getLiveCatalog } from "@/lib/thatim/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  const catalog = await getLiveCatalog(force);
  return NextResponse.json(catalog);
}
