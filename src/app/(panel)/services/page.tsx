import type { Metadata } from "next";
import { ServicesView } from "@/components/views/ServicesView";
import { getLiveCatalog } from "@/lib/thatim/catalog";

export const metadata: Metadata = {
  title: "Dịch vụ / Tạo đơn",
  description: "Chọn nền tảng, dịch vụ và máy chủ để tạo đơn tăng tương tác.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const { platform } = await searchParams;
  // Lấy danh mục phía server để khoá API không lộ ra trình duyệt.
  const catalog = await getLiveCatalog();

  // Chỉ gửi danh sách nền tảng + dịch vụ (kèm SỐ máy chủ), KHÔNG kèm mảng máy
  // chủ. Trước đây nhồi cả 429 máy chủ vào trang → HTML ~305KB, hydrate chậm.
  // Trình duyệt tải máy chủ của một dịch vụ qua /api/thatim/servers khi khách chọn.
  const platforms = catalog.platforms.map((p) => ({
    ...p,
    services: p.services.map(({ servers, ...s }) => ({ ...s, serverCount: servers.length })),
  }));

  return (
    <ServicesView
      initialPlatform={platform}
      platforms={platforms}
      totalServerCount={catalog.serverCount}
      catalogSource={catalog.source}
      catalogError={catalog.error}
    />
  );
}
