import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/views/auth/ForgotPasswordView";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Khôi phục mật khẩu tài khoản Lạc Việt.",
};

export default function Page() {
  return <ForgotPasswordView />;
}
