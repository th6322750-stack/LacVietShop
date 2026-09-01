import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminServicesPage } from "@/components/admin/ServicesPage";

export const metadata: Metadata = {
  title: "Dịch vụ & bảng giá",
  description: "Bảng giá dịch vụ và đơn hàng của mảng dịch vụ tương tác.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminServicesPage />
    </Suspense>
  );
}
