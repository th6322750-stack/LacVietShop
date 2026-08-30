import type { Metadata } from "next";
import { CashflowsView } from "@/components/views/CashflowsView";

export const metadata: Metadata = {
  title: "Dòng tiền & Giao dịch",
  description: "Biến động số dư, cơ cấu chi tiêu và lịch sử giao dịch.",
};

export default function Page() {
  return <CashflowsView />;
}
