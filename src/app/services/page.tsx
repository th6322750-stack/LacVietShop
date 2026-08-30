import type { Metadata } from "next";
import { ServicesView } from "@/components/views/ServicesView";

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
  return <ServicesView initialPlatform={platform} />;
}
