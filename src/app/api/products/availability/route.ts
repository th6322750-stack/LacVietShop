/**
 * Giá bán và tồn kho thật của từng gói premium — công khai cho trang sản phẩm.
 *
 * Trang sản phẩm không được lấy giá trong catalog tĩnh để hiển thị, vì quản trị
 * có thể đã đặt giá khác. Khách phải thấy đúng con số sẽ bị trừ.
 */
import { NextResponse } from "next/server";
import { mergedPackages } from "@/lib/server/products";

export const dynamic = "force-dynamic";

export async function GET() {
  const packages = await mergedPackages();
  return NextResponse.json({
    ok: true,
    packages: packages.map((p) => ({
      slug: p.slug,
      packageId: p.packageId,
      price: p.price,
      active: p.active,
      /** Bán theo kho hay giao tay. */
      pileBased: p.format.length > 0,
      available: p.available,
      highlight: p.highlight,
      badge: p.badge,
    })),
  });
}
