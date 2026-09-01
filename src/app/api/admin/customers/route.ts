/**
 * Danh sách khách hàng cho trang quản trị, và cộng/trừ số dư.
 *
 * Số dư ở đây là tiền thật: mọi thay đổi phải đi qua máy chủ và ghi thành một
 * lệnh nạp "success" để còn tra được ai cộng, cộng bao nhiêu, lúc nào. Màn trước
 * đây sửa số dư trong localStorage của máy quản trị — bấm xong tưởng đã cộng cho
 * khách, thực ra không có gì xảy ra cả.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "node:crypto";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import {
  addBalance,
  findAccount,
  insertDeposit,
  listAccounts,
  listDeposits,
  listProductOrders,
  listServiceOrders,
} from "@/lib/server/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().min(1).max(60),
  /** Dương là cộng, âm là trừ. */
  amount: z.number().int().refine((v) => v !== 0, "Số tiền phải khác 0."),
  note: z.string().max(200).optional(),
});

async function admin() {
  const jar = await cookies();
  return adminForToken(jar.get(ADMIN_COOKIE)?.value);
}

async function danhSach() {
  const [accounts, deposits, products, services] = await Promise.all([
    listAccounts(),
    listDeposits(undefined, 1000),
    listProductOrders(undefined, 1000),
    listServiceOrders(undefined, 1000),
  ]);

  return accounts.map((a) => {
    const daNap = deposits
      .filter((d) => d.accountId === a.id && d.status === "success")
      .reduce((s, d) => s + d.amount, 0);
    const donPremium = products.filter((o) => o.accountId === a.id && o.status !== "canceled");
    const donDichVu = services.filter((o) => o.accountId === a.id && o.refunded === 0);
    return {
      id: a.id,
      name: a.name,
      username: a.username,
      email: a.email,
      phone: a.phone,
      balance: a.balance,
      createdAt: a.createdAt,
      daNap,
      daChi: donPremium.reduce((s, o) => s + o.amount, 0) + donDichVu.reduce((s, o) => s + o.amount, 0),
      soDon: donPremium.length + donDichVu.length,
    };
  });
}

export async function GET() {
  if (!(await admin())) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, customers: await danhSach() });
}

export async function POST(request: Request) {
  const who = await admin();
  if (!who) return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }
  const { id, amount, note } = parsed.data;

  const account = await findAccount({ id });
  if (!account) return NextResponse.json({ ok: false, error: "Không tìm thấy tài khoản." }, { status: 404 });
  if (amount < 0 && account.balance + amount < 0) {
    return NextResponse.json(
      { ok: false, error: `Trừ quá số dư hiện có (${account.balance}đ).` },
      { status: 400 },
    );
  }

  const balance = await addBalance(id, amount);

  // Ghi lại thành một lệnh nạp đã hoàn tất để khách cũng nhìn thấy trong sổ tiền,
  // và để sau này còn truy ra ai đã cộng.
  await insertDeposit({
    id: `dp-${crypto.randomBytes(6).toString("hex")}`,
    accountId: id,
    code: `ADM${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    amount,
    status: "success",
    method: "admin",
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    note: note?.trim() || `${amount > 0 ? "Cộng" : "Trừ"} tay bởi ${who}.`,
  });

  return NextResponse.json({ ok: true, balance, customers: await danhSach() });
}
