/**
 * Quản trị: giá và tồn kho hàng premium.
 *
 * Lưu ở máy chủ chứ không phải localStorage — giá phải giống nhau với mọi khách.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { putProductSetting } from "@/lib/server/db";
import { mergedPackages, settingKey } from "@/lib/server/products";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, packages: await mergedPackages() });
}

const schema = z.object({
  slug: z.string().min(1).max(40),
  packageId: z.string().min(1).max(40),
  price: z.number().int().min(0).max(1_000_000_000),
  /** null = không giới hạn tồn kho thủ công. */
  stock: z.number().int().min(0).max(100_000).nullable(),
  active: z.boolean(),
  /** Các cột của một món hàng, ví dụ ["Email", "Mật khẩu"]. */
  format: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  /** Gói phổ biến — trang khách làm nổi lên. */
  highlight: z.boolean().default(false),
  /** Nhãn nhỏ trên thẻ gói, để trống là không hiện. */
  badge: z.string().trim().max(30).nullable().default(null),
  /** Tên gói hiển thị; để trống là dùng tên trong catalog. */
  name: z.string().trim().max(80).nullable().default(null),
  /** Thời hạn hiển thị; để trống là dùng catalog. */
  duration: z.string().trim().max(40).nullable().default(null),
  /** Các dòng mô tả trong thẻ gói. */
  bullets: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const { slug, packageId, price, stock, active, format, highlight, badge, name, duration, bullets } = parsed.data;
  await putProductSetting({
    key: settingKey(slug, packageId),
    price,
    stock,
    active,
    format,
    highlight,
    badge: badge || null,
    name: name || null,
    duration: duration || null,
    bullets,
  });
  return NextResponse.json({ ok: true, packages: await mergedPackages() });
}
