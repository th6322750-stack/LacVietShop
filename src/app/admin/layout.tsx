import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSessionProvider } from "@/lib/admin/session";
import { AdminStoreProvider } from "@/lib/admin/store";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s · Lạc Việt Admin" },
  robots: { index: false, follow: false },
};

/** Khung quản trị — tách hoàn toàn khỏi AppShell của khách hàng. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminStoreProvider>
        <AdminShell>{children}</AdminShell>
      </AdminStoreProvider>
    </AdminSessionProvider>
  );
}
