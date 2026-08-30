import type { Metadata } from "next";
import { ChildPanelView } from "@/components/views/ChildPanelView";

export const metadata: Metadata = {
  title: "Panel con",
  description: "Tạo và quản lý website bán hàng mang thương hiệu riêng.",
};

export default function Page() {
  return <ChildPanelView />;
}
