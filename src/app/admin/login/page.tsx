import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginView } from "@/components/admin/LoginView";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
