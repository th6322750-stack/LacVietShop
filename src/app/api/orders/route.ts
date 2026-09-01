/**
 * Đơn dịch vụ tương tác của khách.
 *
 * POST: tính lại giá ở máy chủ → trừ số dư → ghi đơn → thử đẩy sang nhà cung cấp.
 *       Đẩy không được (ví nguồn hết tiền, khoá chưa bật, nguồn từ chối) thì đơn
 *       KHÔNG mất: nó nằm chờ ở trang quản trị để chạy tay hoặc đẩy lại sau.
 * GET : danh sách đơn của chính mình; thêm ?sync=1 để hỏi lại tiến độ bên nguồn.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "node:crypto";
import { accountForToken, SESSION_COOKIE } from "@/lib/server/auth";
import { addBalance, insertServiceOrder, listServiceOrders, type ServiceOrder } from "@/lib/server/db";
import { findServer } from "@/lib/server/services";
import { pushServiceOrder, syncServiceOrders } from "@/lib/server/service-orders";

export const dynamic = "force-dynamic";

const schema = z.object({
  serverId: z.string().min(1).max(80),
  link: z.string().trim().min(4, "Thiếu liên kết mục tiêu.").max(500),
  quantity: z.coerce.number().int().positive(),
  note: z.string().trim().max(300).optional(),
});

async function me() {
  const jar = await cookies();
  return accountForToken(jar.get(SESSION_COOKIE)?.value);
}

export async function GET(request: Request) {
  const account = await me();
  if (!account) return NextResponse.json({ ok: false, error: "Chưa đăng nhập." }, { status: 401 });

  if (new URL(request.url).searchParams.get("sync") === "1") {
    await syncServiceOrders(account.id);
  }
  const orders = await listServiceOrders(account.id);
  const fresh = await me();
  return NextResponse.json({ ok: true, orders, balance: fresh?.balance ?? account.balance });
}

export async function POST(request: Request) {
  const account = await me();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Đăng nhập trước khi đặt đơn." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu đơn không hợp lệ." },
      { status: 400 },
    );
  }
  const { serverId, link, quantity } = parsed.data;

  const found = await findServer(serverId);
  if (!found) return NextResponse.json({ ok: false, error: "Không tìm thấy máy chủ này." }, { status: 404 });
  const { platform, service, server } = found;

  if (!server.available) {
    return NextResponse.json({ ok: false, error: "Máy chủ này đang tạm ngừng." }, { status: 409 });
  }
  if (quantity < server.min || quantity > server.max) {
    return NextResponse.json(
      { ok: false, error: `Máy chủ này nhận từ ${server.min} đến ${server.max}.` },
      { status: 400 },
    );
  }

  // Giá tính lại từ danh mục sống — không đọc bất kỳ con số nào của trình duyệt.
  const amount = Math.round(quantity * server.pricePerUnit);
  const cost = Math.round(quantity * server.costPerUnit);
  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "Không tính được giá đơn này." }, { status: 409 });
  }
  if (account.balance < amount) {
    return NextResponse.json({ ok: false, error: "Số dư không đủ. Vui lòng nạp thêm." }, { status: 402 });
  }

  // Trừ tiền trước rồi kiểm tra lại: hai tab đặt cùng lúc thì tab thứ hai làm số
  // dư âm, lúc đó hoàn ngay và từ chối, chứ không để khách tiêu quá số dư.
  const after = await addBalance(account.id, -amount);
  if (after === null || after < 0) {
    if (after !== null) await addBalance(account.id, amount);
    return NextResponse.json({ ok: false, error: "Số dư không đủ. Vui lòng nạp thêm." }, { status: 402 });
  }

  const now = new Date().toISOString();
  const order: ServiceOrder = {
    id: `SV-${crypto.randomBytes(5).toString("hex").toUpperCase()}`,
    accountId: account.id,
    platformName: platform.name,
    serviceName: service.name,
    serverName: server.name,
    apiServiceId: server.apiServiceId ?? "",
    link,
    quantity,
    unitPrice: server.pricePerUnit,
    unitCost: server.costPerUnit,
    amount,
    cost,
    status: "pending",
    providerOrderId: null,
    startCount: 0,
    remains: quantity,
    createdAt: now,
    updatedAt: now,
    refunded: 0,
    note: server.apiServiceId ? null : "Máy chủ chưa gắn mã nhà cung cấp — chạy tay.",
    customerNote: parsed.data.note?.trim() || null,
  };
  await insertServiceOrder(order);

  // Máy chủ chưa có mã bên nguồn thì khỏi gọi, để đơn nằm chờ luôn.
  const pushed = server.apiServiceId
    ? await pushServiceOrder(order.id)
    : ({ ok: false as const, error: "chưa gắn mã nhà cung cấp", order });

  return NextResponse.json({
    ok: true,
    order: pushed.order ?? order,
    balance: after,
    // Khách cần biết đơn đang chạy hay đang xếp hàng chờ người xử lý.
    queued: !pushed.ok,
  });
}
