import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboardView } from "@/components/admin/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Tổng quan doanh thu, đơn hàng và người dùng.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardView />
    </Suspense>
  );
}
