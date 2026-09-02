/**
 * Danh sách máy chủ của MỘT dịch vụ — cho trang Dịch vụ tải khi khách chọn dịch
 * vụ, thay vì nhồi cả 429 máy chủ vào trang ngay từ đầu (HTML nặng, hydrate chậm).
 *
 * Công khai như /api/thatim/catalog và đã lột giá vốn/mã nguồn. Máy chủ khi đặt
 * đơn vẫn tự tra danh mục đầy đủ phía server, không tin số của trình duyệt.
 */
import { NextResponse } from "next/server";
import { getLiveCatalog } from "@/lib/thatim/catalog";
import { stripServer } from "@/lib/thatim/strip";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const platformId = url.searchParams.get("platform")?.trim();
  const serviceId = url.searchParams.get("service")?.trim();
  if (!platformId || !serviceId) {
    return NextResponse.json({ ok: false, error: "Thiếu platform hoặc service." }, { status: 400 });
  }

  const catalog = await getLiveCatalog();
  const platform = catalog.platforms.find((p) => p.id === platformId);
  const service = platform?.services.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json({ ok: false, error: "Không tìm thấy dịch vụ." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, servers: service.servers.map(stripServer) });
}
