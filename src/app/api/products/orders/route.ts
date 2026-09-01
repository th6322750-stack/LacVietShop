/**
 * Khách mua tài khoản premium.
 *
 * POST: trừ số dư, trừ tồn kho, tạo đơn ở trạng thái chờ giao.
 * GET : danh sách đơn premium của chính mình, kèm thông tin tài khoản khi đã giao.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "node:crypto";
import { accountForToken, SESSION_COOKIE } from "@/lib/server/auth";
import {
  addBalance,
  cancelProductOrder,
  claimStockItem,
  decrementStock,
  deliverProductOrder,
  insertProductOrder,
  listProductOrders,
} from "@/lib/server/db";
import { findPackage, settingKey } from "@/lib/server/products";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1).max(40),
  packageId: z.string().min(1).max(40),
  note: z.string().max(300).optional(),
});

async function me() {
  const jar = await cookies();
  return accountForToken(jar.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  const account = await me();
  if (!account) return NextResponse.json({ ok: false, error: "Chưa đăng nhập." }, { status: 401 });
  return NextResponse.json({ ok: true, orders: await listProductOrders(account.id), balance: account.balance });
}

export async function POST(request: Request) {
  const account = await me();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Đăng nhập trước khi đặt mua." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dữ liệu đơn không hợp lệ." }, { status: 400 });
  }

  const pkg = await findPackage(parsed.data.slug, parsed.data.packageId);
  if (!pkg) return NextResponse.json({ ok: false, error: "Không tìm thấy gói này." }, { status: 404 });
  if (!pkg.active) return NextResponse.json({ ok: false, error: "Gói này đang tạm ngừng bán." }, { status: 409 });

  // Gói đã đặt định dạng nghĩa là bán theo kho: hết kho thì KHÔNG bán nữa.
  // Không nhận tiền của khách khi trong tay không có hàng để giao.
  const pileBased = pkg.format.length > 0;
  if (pileBased && pkg.available <= 0) {
    return NextResponse.json({ ok: false, error: "Gói này đã hết hàng." }, { status: 409 });
  }

  if (account.balance < pkg.price) {
    return NextResponse.json({ ok: false, error: "Số dư không đủ. Vui lòng nạp thêm." }, { status: 402 });
  }

  // Gói giao tay thì vẫn theo giới hạn bán thủ công.
  if (!pileBased && !(await decrementStock(settingKey(pkg.slug, pkg.packageId)))) {
    return NextResponse.json({ ok: false, error: "Gói này vừa hết hàng." }, { status: 409 });
  }

  const balance = await addBalance(account.id, -pkg.price);
  if (balance === null) {
    return NextResponse.json({ ok: false, error: "Không trừ được số dư." }, { status: 500 });
  }

  const order = {
    id: `pm-${crypto.randomBytes(8).toString("hex")}`,
    accountId: account.id,
    productSlug: pkg.slug,
    productName: pkg.productName,
    packageId: pkg.packageId,
    packageName: pkg.packageName,
    amount: pkg.price,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    credentials: [],
    customerNote: parsed.data.note?.trim() || null,
  };
  await insertProductOrder(order);

  // Hàng bán theo kho thì giao NGAY, không có chuyện chờ người duyệt.
  if (pileBased) {
    const item = await claimStockItem(settingKey(pkg.slug, pkg.packageId), order.id);

    // Hai khách bấm cùng lúc thì có người hụt món cuối. Không để đơn treo:
    // hoàn tiền ngay, chứ khách đã trả mà không có hàng là hỏng.
    if (!item) {
      await cancelProductOrder(order.id, "Hết hàng ngay lúc thanh toán, đã hoàn tiền.");
      const refunded = await addBalance(account.id, pkg.price);
      return NextResponse.json(
        { ok: false, error: "Gói này vừa hết hàng, tiền đã được hoàn lại." },
        { status: 409, headers: { "x-balance": String(refunded ?? "") } },
      );
    }

    const delivered = await deliverProductOrder(order.id, item.fields, "Giao tự động từ kho hàng.");
    if (delivered) return NextResponse.json({ ok: true, order: delivered, balance, instant: true });
  }

  // Chỉ tới đây khi gói chưa đặt định dạng — hàng phải giao tay.
  return NextResponse.json({ ok: true, order, balance, instant: false });
}
