"use client";

import * as React from "react";
import {
  IconActivity,
  IconDownload,
  IconLogin,
  IconPackage,
  IconShieldLock,
  IconShoppingCart,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { activity } from "@/lib/demo/data";
import { formatDateTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const kindLabels: Record<ActivityItem["kind"], string> = {
  order: "Đơn hàng",
  payment: "Thanh toán",
  security: "Bảo mật",
  login: "Đăng nhập",
  product: "Sản phẩm",
};

const kindIcons: Record<ActivityItem["kind"], React.ReactNode> = {
  order: <IconShoppingCart size={16} />,
  payment: <IconWallet size={16} />,
  security: <IconShieldLock size={16} />,
  login: <IconLogin size={16} />,
  product: <IconPackage size={16} />,
};

export function HistoryView() {
  const toast = useToast();
  const [kind, setKind] = React.useState<ActivityItem["kind"] | "all">("all");
  const [search, setSearch] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return activity.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      const day = a.createdAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !`${a.title} ${a.detail}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [kind, search, from, to]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 8);

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { all: activity.length };
    for (const a of activity) base[a.kind] = (base[a.kind] ?? 0) + 1;
    return base;
  }, []);

  const columns: Column<ActivityItem>[] = [
    {
      key: "activity",
      header: "Hoạt động",
      cell: (a) => (
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-card border border-lv-border bg-lv-bg text-lv-navy-700">
            {kindIcons[a.kind]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-strong text-lv-text">{a.title}</p>
            <p className="truncate text-small text-lv-muted">{a.detail}</p>
          </div>
        </div>
      ),
    },
    { key: "kind", header: "Nhóm", cell: (a) => <Badge tone="neutral">{kindLabels[a.kind]}</Badge> },
    {
      key: "status",
      header: "Kết quả",
      cell: (a) =>
        a.status === "success" ? (
          <Badge tone="success">Thành công</Badge>
        ) : a.status === "warning" ? (
          <Badge tone="warning">Cần chú ý</Badge>
        ) : a.status === "danger" ? (
          <Badge tone="danger">Thất bại</Badge>
        ) : (
          <Badge tone="info">Thông tin</Badge>
        ),
    },
    { key: "time", header: "Thời gian", align: "right", cell: (a) => formatDateTime(a.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lịch sử hoạt động"
        description="Toàn bộ thao tác trên tài khoản: đơn hàng, thanh toán, bảo mật và đăng nhập."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Lịch sử hoạt động" }]}
        action={
          <Button
            variant="secondary"
            icon={<IconDownload size={16} />}
            onClick={() =>
              toast.push({
                tone: "info",
                title: "Xuất dữ liệu chưa khả dụng",
                description: "Cần backend thật để xuất lịch sử — xem FINAL_GAPS_REPORT (backend.orderApi).",
              })
            }
          >
            Xuất dữ liệu
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng hoạt động" value={counts.all ?? 0} suffix="mục" tone="navy" icon={<IconActivity size={20} />} />
        <StatCard label="Đơn hàng" value={counts.order ?? 0} suffix="mục" tone="gold" icon={<IconShoppingCart size={20} />} />
        <StatCard label="Thanh toán" value={counts.payment ?? 0} suffix="mục" tone="success" icon={<IconWallet size={20} />} />
        <StatCard label="Bảo mật & đăng nhập" value={(counts.security ?? 0) + (counts.login ?? 0)} suffix="mục" tone="info" icon={<IconShieldLock size={20} />} />
      </div>

      <Tabs
        ariaLabel="Nhóm hoạt động"
        value={kind}
        onChange={(id) => setKind(id as ActivityItem["kind"] | "all")}
        items={[
          { id: "all", label: "Tất cả", count: counts.all },
          ...(Object.keys(kindLabels) as ActivityItem["kind"][]).map((k) => ({
            id: k,
            label: kindLabels[k],
            count: counts[k] ?? 0,
          })),
        ]}
      />

      <SectionCard title="Nhật ký" description={`${filtered.length} hoạt động khớp bộ lọc`} padded={false}>
        <div className="px-5 py-4">
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Tìm theo nội dung hoạt động…"
            right={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setFrom("");
                  setTo("");
                  setKind("all");
                }}
              >
                Xoá lọc
              </Button>
            }
          >
            <Input type="date" aria-label="Từ ngày" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" aria-label="Đến ngày" value={to} onChange={(e) => setTo(e.target.value)} />
          </FilterBar>
        </div>
        <DataTable
          caption="Lịch sử hoạt động tài khoản"
          columns={columns}
          rows={slice}
          emptyTitle="Không có hoạt động nào khớp bộ lọc"
          emptyDescription="Thử mở rộng khoảng ngày hoặc chọn nhóm khác."
        />
        <div className="border-t border-lv-border px-5 py-3">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </SectionCard>
    </div>
  );
}
