/**
 * Hàng đợi đơn dịch vụ ở trang quản trị.
 *
 * Đơn nào chưa đẩy được sang nhà cung cấp thì nằm đây chờ. Quản trị có ba lựa chọn:
 *   - "push"     : đẩy lại (dùng sau khi nạp tiền vào ví nhà cung cấp),
 *   - "complete" : tự chạy tay xong rồi, đánh dấu hoàn thành,
 *   - "refund"   : huỷ và hoàn đủ tiền cho khách.
 * Ngoài ra "sync" để hỏi lại tiến độ mọi đơn đang chạy.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { findAccount, listServiceOrders, updateServiceOrder } from "@/lib/server/db";
import { pushServiceOrder, refundServiceOrder, syncServiceOrders } from "@/lib/server/service-orders";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["push", "complete", "refund", "sync"]),
  id: z.string().min(1).max(60).optional(),
  note: z.string().max(300).optional(),
});

async function admin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

/** Đơn kèm tên khách để người trực biết đang xử lý cho ai. */
async function withCustomer() {
  const orders = await listServiceOrders();
  const names = new Map<string, string>();
  for (const o of orders) {
    if (names.has(o.accountId)) continue;
    const acc = await findAccount({ id: o.accountId });
    names.set(o.accountId, acc ? `${acc.name} (@${acc.username})` : "—");
  }
  return orders.map((o) => ({ ...o, customer: names.get(o.accountId) ?? "—" }));
}

export async function GET() {
  if (!(await admin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, orders: await withCustomer() });
}

export async function POST(request: Request) {
  const who = await admin();
  if (!who) return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const { action, id, note } = parsed.data;

  if (action === "sync") {
    const changed = await syncServiceOrders();
    return NextResponse.json({ ok: true, changed, orders: await withCustomer() });
  }

  if (!id) return NextResponse.json({ ok: false, error: "Thiếu mã đơn." }, { status: 400 });

  if (action === "push") {
    const res = await pushServiceOrder(id);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error, orders: await withCustomer() }, { status: 502 });
    }
    return NextResponse.json({ ok: true, orders: await withCustomer() });
  }

  if (action === "complete") {
    const next = await updateServiceOrder(id, {
      status: "completed",
      remains: 0,
      note: note?.trim() || `Chạy tay, đánh dấu hoàn thành bởi ${who}.`,
    });
    if (!next) return NextResponse.json({ ok: false, error: "Không tìm thấy đơn." }, { status: 404 });
    return NextResponse.json({ ok: true, orders: await withCustomer() });
  }

  const next = await refundServiceOrder(id, note?.trim() || `Huỷ và hoàn tiền bởi ${who}.`);
  if (!next) return NextResponse.json({ ok: false, error: "Không tìm thấy đơn." }, { status: 404 });
  return NextResponse.json({ ok: true, orders: await withCustomer() });
}
