/**
 * Kênh liên hệ hiện cho khách — ai cũng đọc được, chỉ quản trị mới sửa
 * (sửa ở /api/admin/ops).
 *
 * Tách riêng khỏi /api/admin/ops vì đường kia đòi cookie quản trị, mà thanh bên
 * thì khách chưa đăng nhập cũng phải thấy được nút liên hệ.
 */
import { NextResponse } from "next/server";
import { readOps } from "@/lib/server/ops";

export const dynamic = "force-dynamic";

export async function GET() {
  const ops = await readOps();
  // Chỉ trả phần liên hệ; công tắc vận hành không phải việc của khách.
  return NextResponse.json(
    { ok: true, contact: ops.contact ?? {} },
    {
      // Kênh liên hệ hoạ hoằn mới đổi. Cho CDN giữ 60 giây để khách sau không
      // phải đánh thức hàm nguội — đổi link thì chậm nhất một phút là hiện.
      headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" },
    },
  );
}
