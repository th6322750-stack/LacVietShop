import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAnnouncementView } from "@/components/admin/AnnouncementView";

export const metadata: Metadata = {
  title: "Popup thông báo",
  description: "Cấu hình popup thông báo hiện lên khi khách vào web.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminAnnouncementView />
    </Suspense>
  );
}
