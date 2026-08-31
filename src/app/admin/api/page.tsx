import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminApiView } from "@/components/admin/ApiView";

export const metadata: Metadata = {
  title: "Kết nối API",
  description: "Trạng thái kết nối tới nhà cung cấp và bảng dịch vụ lấy trực tiếp.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminApiView />
    </Suspense>
  );
}
