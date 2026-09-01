/**
 * Quản trị: xem và giao đơn hàng premium.
 *
 * GET  : toàn bộ đơn, kèm tên và email khách để biết giao cho ai.
 * POST : giao hàng (điền thông tin tài khoản) hoặc huỷ đơn và hoàn tiền.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import {
  addBalance,
  cancelProductOrder,
  deliverProductOrder,
  findAccount,
  findProductOrder,
  listProductOrders,
} from "@/lib/server/db";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const orders = await listProductOrders();
  // Gắn kèm thông tin khách để quản trị biết giao cho ai, khỏi phải tra tay.
  const withBuyer = await Promise.all(
    orders.map(async (o) => {
      const a = await findAccount({ id: o.accountId });
      return { ...o, buyer: a ? { name: a.name, email: a.email, username: a.username } : null };
    }),
  );
  return NextResponse.json({ ok: true, orders: withBuyer });
}

const schema = z.object({
  id: z.string().min(1),
  action: z.enum(["deliver", "cancel"]),
  credentials: z
    .array(z.object({ label: z.string().trim().min(1).max(60), value: z.string().trim().min(1).max(400) }))
    .max(10)
    .optional(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const existing = await findProductOrder(parsed.data.id);
  if (!existing) return NextResponse.json({ ok: false, error: "Không tìm thấy đơn." }, { status: 404 });
  if (existing.status !== "pending") {
    return NextResponse.json({ ok: false, error: `Đơn này đã ${existing.status === "delivered" ? "giao" : "huỷ"}.` }, { status: 409 });
  }

  if (parsed.data.action === "cancel") {
    const order = await cancelProductOrder(parsed.data.id, parsed.data.note?.trim() || `Huỷ bởi ${admin}`);
    if (!order) return NextResponse.json({ ok: false, error: "Đơn vừa được xử lý bởi người khác." }, { status: 409 });
    // Huỷ thì phải trả lại tiền, không thì khách mất tiền mà không có hàng.
    await addBalance(order.accountId, order.amount);
    return NextResponse.json({ ok: true, order });
  }

  const credentials = parsed.data.credentials ?? [];
  if (credentials.length === 0) {
    return NextResponse.json({ ok: false, error: "Điền ít nhất một dòng thông tin tài khoản." }, { status: 400 });
  }

  const order = await deliverProductOrder(parsed.data.id, credentials, parsed.data.note?.trim() || "");
  if (!order) return NextResponse.json({ ok: false, error: "Đơn vừa được xử lý bởi người khác." }, { status: 409 });
  return NextResponse.json({ ok: true, order });
}
