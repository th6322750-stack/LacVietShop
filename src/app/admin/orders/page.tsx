import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOrdersView } from "@/components/admin/OrdersView";

export const metadata: Metadata = {
  title: "Đơn hàng",
  description: "Lọc, đổi trạng thái, hoàn tiền và xuất dữ liệu đơn.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersView />
    </Suspense>
  );
}
