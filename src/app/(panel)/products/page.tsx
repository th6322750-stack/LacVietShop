import type { Metadata } from "next";
import { ProductsView } from "@/components/views/ProductsView";

export const metadata: Metadata = {
  title: "Sản phẩm Premium",
  description: "Kho tài khoản premium bản quyền: YouTube, CapCut, Canva, Veo 3, Gemini, ChatGPT, Netflix, VPN.",
};

export default function ProductsPage() {
  return <ProductsView />;
}
