import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPremiumOrdersView } from "@/components/admin/PremiumOrdersView";

export const metadata: Metadata = {
  title: "Giao hàng premium",
  description: "Đơn mua tài khoản premium chờ giao và đã giao.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminPremiumOrdersView />
    </Suspense>
  );
}
