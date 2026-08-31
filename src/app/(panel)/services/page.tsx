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

  return (
    <ServicesView
      initialPlatform={platform}
      platforms={catalog.platforms}
      catalogSource={catalog.source}
      catalogError={catalog.error}
    />
  );
}
