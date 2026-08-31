import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerLoginView } from "@/components/views/auth/LoginView";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập tài khoản Lạc Việt.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginView />
    </Suspense>
  );
}
