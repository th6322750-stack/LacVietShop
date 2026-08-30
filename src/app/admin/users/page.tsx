import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersView } from "@/components/admin/UsersView";

export const metadata: Metadata = {
  title: "Người dùng & giao dịch",
  description: "Số dư, cấp bậc và dòng tiền của khách hàng.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminUsersView />
    </Suspense>
  );
}
