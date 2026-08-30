import type { Metadata } from "next";
import { HistoryView } from "@/components/views/HistoryView";

export const metadata: Metadata = {
  title: "Lịch sử hoạt động",
  description: "Nhật ký đơn hàng, thanh toán, bảo mật và đăng nhập.",
};

export default function Page() {
  return <HistoryView />;
}
