import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminServicesView } from "@/components/admin/ServicesView";

export const metadata: Metadata = {
  title: "Dịch vụ & bảng giá",
  description: "Bảng giá dịch vụ theo bốn cấp bậc thành viên.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminServicesView />
    </Suspense>
  );
}
