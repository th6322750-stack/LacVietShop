import type { Metadata } from "next";
import { PurchasedView } from "@/components/views/PurchasedView";

export const metadata: Metadata = {
  title: "Sản phẩm đã mua",
  description: "Quản lý tài khoản premium đang dùng và hạn sử dụng.",
};

export default function Page() {
  return <PurchasedView />;
}
