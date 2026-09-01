/**
 * Đẩy đơn sang nhà cung cấp và tra trạng thái đơn.
 *
 * Đẩy đơn là TIÊU TIỀN THẬT trong tài khoản nhà cung cấp, nên mặc định bị chặn.
 * Bật bằng THATIM_ALLOW_ORDERS=true trong .env.local khi đã sẵn sàng.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { addOrder, getOrderStatus } from "@/lib/thatim/client";
import { isThatimConfigured } from "@/lib/thatim/config";
import { autoPushEnabled } from "@/lib/server/ops";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  service: z.string().min(1),
  link: z.string().min(4),
  quantity: z.number().int().positive(),
});

export async function POST(request: Request) {
  if (!isThatimConfigured()) {
    return NextResponse.json({ ok: false, error: "Chưa cấu hình khoá API." }, { status: 503 });
  }
  if (!(await autoPushEnabled())) {
    return NextResponse.json(
      {
        ok: false,
        error: "Tự đẩy đơn đang tắt. Bật lại ở trang quản trị › Dịch vụ & bảng giá.",
      },
      { status: 503 },
    );
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu đơn không hợp lệ." }, { status: 400 });
  }

  const res = await addOrder(parsed.data);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 502 });
  return NextResponse.json({ ok: true, order: String(res.data.order) });
}

export async function GET(request: Request) {
  const order = new URL(request.url).searchParams.get("order");
  if (!order) return NextResponse.json({ ok: false, error: "Thiếu mã đơn." }, { status: 400 });

  const res = await getOrderStatus(order);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 502 });
  return NextResponse.json({ ok: true, ...res.data });
}
