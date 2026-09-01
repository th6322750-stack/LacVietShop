/**
 * Công tắc vận hành cho trang quản trị.
 *
 * GET  : trạng thái hiện tại kèm số dư ví nhà cung cấp, để người bấm biết có đủ
 *        tiền mà bật hay không.
 * POST : bật/tắt tự đẩy đơn.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { readOps, writeOps } from "@/lib/server/ops";
import { listServiceOrders } from "@/lib/server/db";
import { getBalance } from "@/lib/thatim/client";
import { isThatimConfigured } from "@/lib/thatim/config";

export const dynamic = "force-dynamic";

/** Link phải là http(s) để bấm vào đi được đúng chỗ, không nhận chuỗi bừa. */
const link = z
  .string()
  .trim()
  .max(300)
  .refine(
    (v) => v === "" || v.toLowerCase().startsWith("http://") || v.toLowerCase().startsWith("https://"),
    "Đường dẫn phải bắt đầu bằng http:// hoặc https://",
  )
  .optional();

const schema = z.object({
  autoPushOrders: z.boolean().optional(),
  contact: z
    .object({
      hours: z.string().trim().max(80).optional(),
      zalo: link,
      facebook: link,
      messenger: link,
      telegram: link,
    })
    .optional(),
});

async function admin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

/** Số đơn đang nằm chờ — con số này quyết định bấm bật xong có việc phải làm không. */
async function dangCho() {
  const orders = await listServiceOrders();
  return orders.filter((o) => o.status === "pending").length;
}

export async function GET() {
  if (!(await admin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const ops = await readOps();
  const balance = isThatimConfigured() ? await getBalance() : null;
  return NextResponse.json({
    ok: true,
    ops,
    pending: await dangCho(),
    supplier: balance?.ok
      ? { balance: Number(balance.data.balance), currency: String(balance.data.currency ?? "USD") }
      : { error: balance?.ok === false ? balance.error : "Chưa cấu hình khoá API." },
  });
}

export async function POST(request: Request) {
  const who = await admin();
  if (!who) return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const ops = await writeOps(parsed.data, who);
  return NextResponse.json({ ok: true, ops, pending: await dangCho() });
}
