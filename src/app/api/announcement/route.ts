/**
 * Thông báo hiện cho khách — ai cũng đọc được, chỉ quản trị mới ghi.
 *
 * Trước đây popup đọc thẳng localStorage của máy quản trị nên khách ở máy khác
 * không bao giờ thấy: quản trị soạn xong tưởng đã phát, thực ra chỉ mình mình
 * thấy. Nay nội dung nằm ở máy chủ nên phát là khách thấy thật.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminForToken } from "@/lib/server/admin";
import { getAnnouncement, putAnnouncement, type Announcement } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  enabled: z.boolean(),
  title: z.string().trim().max(120),
  body: z.string().trim().max(1200),
  tone: z.enum(["info", "success", "warning", "danger"]),
  // Ảnh là data URL đã thu nhỏ phía trình duyệt; chặn trần để không ai nhét
  // được tệp lớn vào cơ sở dữ liệu.
  imageSrc: z.string().max(400_000).optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(200).optional(),
  frequency: z.enum(["once", "daily", "always"]),
  version: z.number().int().min(1).max(100000),
  snoozeHours: z.number().int().min(1).max(72),
  startAt: z.string().trim().max(10).nullable().optional(),
  endAt: z.string().trim().max(10).nullable().optional(),
});

/** Chưa quản trị nào đặt thông báo thì không hiện gì cả. */
const TAT: Announcement = {
  enabled: false,
  title: "",
  body: "",
  tone: "info",
  ctaLabel: "",
  ctaHref: "",
  frequency: "daily",
  version: 1,
  snoozeHours: 1,
};

export async function GET() {
  const a = await getAnnouncement();
  return NextResponse.json(
    { ok: true, announcement: a ?? TAT },
    // Như /api/contact: giữ 60 giây ở CDN. Bấm "Phát lại cho tất cả" thì chậm
    // nhất một phút là khách thấy.
    { headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } },
  );
}

export async function POST(request: Request) {
  const jar = await cookies();
  const admin = await adminForToken(jar.get(ADMIN_COOKIE)?.value);
  if (!admin) return NextResponse.json({ ok: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." },
      { status: 400 },
    );
  }
  if (parsed.data.enabled && !parsed.data.title.trim()) {
    return NextResponse.json({ ok: false, error: "Bật thông báo thì phải có tiêu đề." }, { status: 400 });
  }

  const next: Announcement = {
    ...parsed.data,
    startAt: parsed.data.startAt || null,
    endAt: parsed.data.endAt || null,
    updatedAt: new Date().toISOString(),
    updatedBy: admin,
  };
  await putAnnouncement(next);
  return NextResponse.json({ ok: true, announcement: next });
}
