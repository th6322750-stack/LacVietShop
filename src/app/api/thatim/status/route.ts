/**
 * Tình trạng kết nối API nhà cung cấp — dùng cho trang quản trị.
 * Không bao giờ trả về khoá API, chỉ trả bản đã che.
 */
import { NextResponse } from "next/server";
import { getBalance } from "@/lib/thatim/client";
import { getLiveCatalog } from "@/lib/thatim/catalog";
import { isThatimConfigured, maskKey, thatimConfig } from "@/lib/thatim/config";
import { autoPushEnabled } from "@/lib/server/ops";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Chỉ quản trị: đây là số dư ví nguồn, hệ số giá, endpoint — không phải việc
  // của khách.
  const jar = await cookies();
  if (!(await adminForToken(jar.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  const force = new URL(request.url).searchParams.get("refresh") === "1";

  const base = {
    configured: isThatimConfigured(),
    endpoint: thatimConfig.url,
    keyMasked: maskKey(thatimConfig.key),
    usdToVnd: thatimConfig.usdToVnd,
    markup: thatimConfig.markup,
    allowOrders: await autoPushEnabled(),
    cacheSeconds: thatimConfig.cacheSeconds,
  };

  if (!base.configured) {
    return NextResponse.json({ ...base, ok: false, error: "Chưa cấu hình THATIM_API_KEY trong .env.local." });
  }

  const [balance, catalog] = await Promise.all([getBalance(), getLiveCatalog(force)]);

  return NextResponse.json({
    ...base,
    ok: balance.ok,
    balance: balance.ok ? balance.data.balance : null,
    currency: balance.ok ? balance.data.currency : null,
    balanceVnd: balance.ok ? Math.round(balance.data.balance * thatimConfig.usdToVnd) : null,
    error: balance.ok ? (catalog.error ?? null) : balance.error,
    catalog: {
      source: catalog.source,
      fetchedAt: catalog.fetchedAt,
      platformCount: catalog.platformCount,
      serviceCount: catalog.serviceCount,
      serverCount: catalog.serverCount,
    },
  });
}
