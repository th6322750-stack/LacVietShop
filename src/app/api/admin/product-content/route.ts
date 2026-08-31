/**
 * Quản trị sửa chữ nghĩa trên trang sản phẩm.
 *
 * Sửa ngay ngoài trang khách chứ không phải vào bảng — nên route này chỉ nhận
 * đúng những trường hiện trên trang đó.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { putProductContent } from "@/lib/server/db";
import { productPageContent } from "@/lib/server/content";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1).max(40),
  name: z.string().trim().max(80).nullable().default(null),
  tagline: z.string().trim().max(160).nullable().default(null),
  description: z.string().trim().max(600).nullable().default(null),
  badges: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
});

export async function POST(request: Request) {
  const jar = await cookies();
  if (!(await adminForToken(jar.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { slug, name, tagline, description, badges } = parsed.data;
  await putProductContent({
    slug,
    name: name || null,
    tagline: tagline || null,
    description: description || null,
    badges,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, content: await productPageContent(slug) });
}
