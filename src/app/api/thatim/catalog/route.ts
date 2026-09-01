/**
 * Danh mục dịch vụ cho giao diện KHÁCH.
 *
 * Lột sạch dữ liệu nội bộ trước khi trả: mã dịch vụ nhà cung cấp, giá vốn và cờ
 * bán-dưới-vốn không được ra khỏi máy chủ. Khách chỉ cần tên, giá bán, giới hạn.
 * Máy chủ khi đặt đơn đọc danh mục đầy đủ trực tiếp (getLiveCatalog), không qua
 * đường công khai này.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLiveCatalog } from "@/lib/thatim/catalog";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import type { Platform } from "@/types";

export const dynamic = "force-dynamic";

/** Bỏ mọi trường lộ thông tin nhà cung cấp khỏi từng máy chủ. */
function stripCatalog(platforms: Platform[]) {
  return platforms.map((p) => ({
    ...p,
    services: p.services.map((s) => ({
      ...s,
      // Bỏ apiServiceId, code, costPerUnit, belowCost — chỉ giữ cái khách cần.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      servers: s.servers.map(({ apiServiceId, code, costPerUnit, belowCost, ...an }) => an),
    })),
  }));
}

export async function GET(request: Request) {
  // Quản trị thấy danh mục đầy đủ (giá vốn, mã nguồn) để đặt giá; khách thấy
  // bản đã lột. Cũng chỉ quản trị mới được ép làm mới.
  const jar = await cookies();
  const isAdmin = Boolean(await adminForToken(jar.get(ADMIN_COOKIE)?.value));
  const force = isAdmin && new URL(request.url).searchParams.get("refresh") === "1";
  const catalog = await getLiveCatalog(force);
  return NextResponse.json({
    source: catalog.source,
    fetchedAt: catalog.fetchedAt,
    platformCount: catalog.platformCount,
    serviceCount: catalog.serviceCount,
    serverCount: catalog.serverCount,
    platforms: isAdmin ? catalog.platforms : stripCatalog(catalog.platforms),
  });
}
