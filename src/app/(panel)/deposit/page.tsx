import type { Metadata } from "next";
import { DepositView } from "@/components/views/DepositView";

export const metadata: Metadata = {
  title: "Nạp tiền",
  description: "Nạp số dư để sử dụng dịch vụ và mua tài khoản premium.",
};

export default function Page() {
  return <DepositView />;
}
