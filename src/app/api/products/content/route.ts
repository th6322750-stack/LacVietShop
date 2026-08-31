/** Nội dung trang sản phẩm cho khách — đã trộn phần quản trị sửa. */
import { NextResponse } from "next/server";
import { productPageContent } from "@/lib/server/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false, error: "Thiếu mã sản phẩm." }, { status: 400 });

  const content = await productPageContent(slug);
  if (!content) return NextResponse.json({ ok: false, error: "Không tìm thấy sản phẩm." }, { status: 404 });
  return NextResponse.json({ ok: true, content });
}
