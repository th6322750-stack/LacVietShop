import type { Metadata } from "next";
import { AffiliateView } from "@/components/views/AffiliateView";

export const metadata: Metadata = {
  title: "Affiliate / Đại lý",
  description: "Liên kết giới thiệu, hoa hồng và danh sách khách hàng.",
};

export default function Page() {
  return <AffiliateView />;
}
