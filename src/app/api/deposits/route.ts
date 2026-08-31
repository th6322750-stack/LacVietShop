/**
 * Lệnh nạp tiền của khách.
 *
 * POST: tạo lệnh mới, trả về mã chuyển khoản + ảnh QR.
 * GET : danh sách lệnh nạp của chính mình, để trang Nạp tiền theo dõi trạng thái.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "node:crypto";
import { accountForToken, SESSION_COOKIE } from "@/lib/server/auth";
import { insertDeposit, listDeposits } from "@/lib/server/db";
import { newDepositCode, qrImageUrl, sepayConfig, sepayReady } from "@/lib/server/sepay";

export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.number().int().min(10_000, "Nạp tối thiểu 10.000đ").max(500_000_000),
  method: z.string().min(1).max(32),
});

async function me() {
  const jar = await cookies();
  return accountForToken(jar.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  const account = await me();
  if (!account) return NextResponse.json({ ok: false, error: "Chưa đăng nhập." }, { status: 401 });

  const deposits = await listDeposits(account.id, 30);
  return NextResponse.json({ ok: true, deposits, balance: account.balance });
}

export async function POST(request: Request) {
  const account = await me();
  if (!account) {
    return NextResponse.json({ ok: false, error: "Đăng nhập trước khi tạo lệnh nạp." }, { status: 401 });
  }
  if (!sepayReady()) {
    return NextResponse.json(
      { ok: false, error: "Chưa cấu hình tài khoản nhận tiền (SEPAY_ACCOUNT_NUMBER)." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Số tiền không hợp lệ." },
      { status: 400 },
    );
  }

  const code = newDepositCode();
  const deposit = {
    id: `dp-${crypto.randomBytes(8).toString("hex")}`,
    accountId: account.id,
    code,
    amount: parsed.data.amount,
    status: "pending" as const,
    method: parsed.data.method,
    createdAt: new Date().toISOString(),
  };
  await insertDeposit(deposit);

  return NextResponse.json({
    ok: true,
    deposit,
    transfer: {
      bank: sepayConfig.bank,
      accountNumber: sepayConfig.accountNumber,
      accountName: sepayConfig.accountName,
      content: code,
      amount: parsed.data.amount,
      qrUrl: qrImageUrl(parsed.data.amount, code),
    },
  });
}
