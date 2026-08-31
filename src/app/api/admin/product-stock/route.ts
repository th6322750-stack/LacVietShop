/**
 * Kho hàng premium — nạp sẵn tài khoản để khách mua là giao ngay.
 *
 * GET    : danh sách món trong kho (lọc theo gói nếu có) kèm số còn lại.
 * POST   : nạp hàng loạt. Mỗi dòng là một món, các cột ngăn nhau bằng "|",
 *          đúng thứ tự định dạng đã đặt cho gói đó.
 * DELETE : bỏ một món chưa dùng. Món đã giao không xoá được — đó là chứng từ.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "node:crypto";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { deleteStockItem, insertStockItems, listStockItems, stockCounts, type StockItem } from "@/lib/server/db";
import { findPackage, settingKey } from "@/lib/server/products";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  const key = new URL(request.url).searchParams.get("key") ?? undefined;
  const [items, counts] = await Promise.all([listStockItems(key), stockCounts()]);
  return NextResponse.json({ ok: true, items, counts });
}

const importSchema = z.object({
  slug: z.string().min(1).max(40),
  packageId: z.string().min(1).max(40),
  /** Mỗi dòng một món, các cột ngăn bằng dấu "|". */
  lines: z.string().min(1).max(200_000),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const parsed = importSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu nạp kho không hợp lệ." }, { status: 400 });
  }

  const pkg = await findPackage(parsed.data.slug, parsed.data.packageId);
  if (!pkg) return NextResponse.json({ ok: false, error: "Không tìm thấy gói này." }, { status: 404 });
  if (pkg.format.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Chưa đặt định dạng hàng cho gói này. Đặt định dạng trước rồi mới nạp kho." },
      { status: 409 },
    );
  }

  const key = settingKey(pkg.slug, pkg.packageId);
  const now = new Date().toISOString();
  const items: StockItem[] = [];
  const skipped: string[] = [];

  for (const raw of parsed.data.lines.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const parts = line.split("|").map((v) => v.trim());
    // Thiếu cột thì bỏ qua và báo lại, không nạp món hỏng vào kho rồi giao cho khách.
    if (parts.length < pkg.format.length || parts.slice(0, pkg.format.length).some((v) => !v)) {
      skipped.push(line.slice(0, 60));
      continue;
    }

    items.push({
      id: `st-${crypto.randomBytes(8).toString("hex")}`,
      key,
      fields: pkg.format.map((label, i) => ({ label, value: parts[i] })),
      status: "available",
      createdAt: now,
    });
  }

  await insertStockItems(items);
  const counts = await stockCounts();

  return NextResponse.json({
    ok: true,
    added: items.length,
    skipped,
    available: counts[key] ?? 0,
  });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Thiếu mã món hàng." }, { status: 400 });

  const removed = await deleteStockItem(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "Món này đã giao cho khách, không xoá được." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
