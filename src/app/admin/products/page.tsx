import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminProductsView } from "@/components/admin/ProductsView";

export const metadata: Metadata = {
  title: "Sản phẩm premium",
  description: "Giá bán, tồn kho và trạng thái mở bán.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminProductsView />
    </Suspense>
  );
}
