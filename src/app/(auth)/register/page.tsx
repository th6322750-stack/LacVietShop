import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterView } from "@/components/views/auth/RegisterView";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản Lạc Việt để đặt dịch vụ tăng tương tác.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterView />
    </Suspense>
  );
}
