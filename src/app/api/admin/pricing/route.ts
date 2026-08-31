/**
 * Bảng giá bán. Đọc và ghi đều cần phiên quản trị phía máy chủ — đây là dữ liệu
 * chung của cả hệ thống, không thể để trình duyệt nào cũng sửa được.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { readRules, writeRules, type PriceRule } from "@/lib/server/pricing";
import { clearCatalogCache } from "@/lib/thatim/catalog";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, rules: readRules() });
}

const ruleSchema = z.union([
  z.object({ type: z.literal("percent"), value: z.number().min(0.01).max(100) }),
  z.object({ type: z.literal("fixed"), value: z.number().min(0).max(100_000_000) }),
]);

const bodySchema = z.object({
  globalMarkup: z.number().min(0.01).max(100).optional(),
  /** null = xoá quy tắc riêng, quay về hệ số chung. */
  overrides: z.record(z.string(), ruleSchema.nullable()).optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu bảng giá không hợp lệ." }, { status: 400 });
  }

  const rules = readRules();
  if (parsed.data.globalMarkup !== undefined) rules.globalMarkup = parsed.data.globalMarkup;

  for (const [id, rule] of Object.entries(parsed.data.overrides ?? {})) {
    if (rule === null) delete rules.overrides[id];
    else rules.overrides[id] = rule as PriceRule;
  }

  rules.updatedAt = new Date().toISOString();
  rules.updatedBy = admin;
  writeRules(rules);

  // Danh mục đang nhớ tạm giá cũ; xoá để lần lấy sau ra giá mới ngay.
  clearCatalogCache();
  return NextResponse.json({ ok: true, rules });
}
