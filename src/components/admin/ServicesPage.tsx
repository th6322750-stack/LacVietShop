"use client";

import * as React from "react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { AdminServicesView } from "./ServicesView";
import { AdminOrdersView } from "./OrdersView";

/**
 * Dịch vụ tương tác gom về một trang: bảng giá và đơn hàng của chính mảng đó.
 * Trước đây tách hai mục điều hướng, nhìn rời rạc trong khi hai thứ này luôn
 * phải xem cùng nhau — đổi giá xong là muốn soi ngay đơn chạy thế nào.
 */
export function AdminServicesPage() {
  const [tab, setTab] = React.useState<"pricing" | "orders">("pricing");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dịch vụ & bảng giá"
        description="Giá vốn lấy từ nhà cung cấp, giá bán do bạn đặt. Áp cho toàn hệ thống."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Dịch vụ & bảng giá" }]}
      />

      <Tabs
        ariaLabel="Khu vực dịch vụ"
        value={tab}
        onChange={(id) => setTab(id as "pricing" | "orders")}
        items={[
          { id: "pricing", label: "Bảng giá" },
          { id: "orders", label: "Đơn hàng" },
        ]}
      />

      {tab === "pricing" ? <AdminServicesView embedded /> : <AdminOrdersView embedded />}
    </div>
  );
}
