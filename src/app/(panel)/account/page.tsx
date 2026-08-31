import type { Metadata } from "next";
import { AccountView } from "@/components/views/AccountView";

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Hồ sơ, bảo mật hai lớp và tuỳ chọn thông báo.",
};

export default function Page() {
  return <AccountView />;
}
