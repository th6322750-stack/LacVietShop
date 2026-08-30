import type { Metadata } from "next";
import { ProgressView } from "@/components/views/ProgressView";

export const metadata: Metadata = {
  title: "Tiến độ đơn hàng",
  description: "Theo dõi trạng thái xử lý của từng đơn theo thời gian thực.",
};

export default function Page() {
  return <ProgressView />;
}
