"use client";

import * as React from "react";
import {
  IconClipboardList,
  IconClockHour4,
  IconExternalLink,
  IconHeadset,
  IconRefresh,
  IconRotateClockwise,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { OrderSummaryRow, ProgressBar } from "@/components/blocks/Commerce";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { orders as demoOrders, orderStatusLabels } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

export function ProgressView() {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "">("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [selected, setSelected] = React.useState<Order | null>(demoOrders[0] ?? null);
  const [state, setState] = React.useState<"ready" | "loading">("ready");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return demoOrders.filter((o) => {
      if (status && o.status !== status) return false;
      const day = o.createdAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !`${o.id} ${o.code} ${o.serviceName} ${o.platformName} ${o.target}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [search, status, from, to]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 8);

  const metrics = React.useMemo(() => {
    const by = (s: OrderStatus) => demoOrders.filter((o) => o.status === s).length;
    return [
      { label: "Đang chạy", value: by("running"), tone: "info" as const },
      { label: "Đang chờ / xử lý", value: by("pending") + by("processing"), tone: "gold" as const },
      { label: "Hoàn thành", value: by("completed"), tone: "success" as const },
      { label: "Hoàn tiền / huỷ", value: by("refunded") + by("canceled"), tone: "danger" as const },
    ];
  }, []);

  function refresh() {
    setState("loading");
    window.setTimeout(() => {
      setState("ready");
      toast.push({ tone: "info", title: "Đã làm mới danh sách đơn" });
    }, 700);
  }

  const columns: Column<Order>[] = [
    {
      key: "order",
      header: "Đơn hàng",
      cell: (o) => (
        <div className="min-w-0">
          <p className="text-body-strong text-lv-text">#{o.id}</p>
          <p className="text-small text-lv-muted">{o.code}</p>
          <p className="text-small text-lv-muted">{formatDateTime(o.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Dịch vụ",
      cell: (o) => (
        <div className="min-w-0 max-w-[260px]">
          <p className="truncate text-body-strong text-lv-text">{o.serviceName}</p>
          <p className="truncate text-small text-lv-muted">{o.platformName}</p>
          <p className="truncate text-small text-lv-muted" title={o.target}>
            {o.target}
          </p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Tiến độ",
      align: "right",
      cell: (o) => (
        <div className="min-w-[140px]">
          <ProgressBar value={o.delivered} max={o.quantity} showValue tone={o.status === "completed" ? "success" : "gold"} />
        </div>
      ),
    },
    {
      key: "amount",
      header: "Thanh toán",
      align: "right",
      cell: (o) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(o.amount)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (o) => <StatusBadge status={o.status} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tiến độ đơn hàng"
        description="Theo dõi trạng thái xử lý của từng đơn theo thời gian thực."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tiến độ đơn hàng" }]}
        action={
          <Button variant="secondary" onClick={refresh} icon={<IconRefresh size={16} />}>
            Làm mới
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={formatNumber(m.value)} suffix="đơn" tone={m.tone} icon={<IconClipboardList size={20} />} />
        ))}
      </div>

      <SectionCard title="Bộ lọc" padded>
        <FilterBar search={search} onSearch={setSearch} placeholder="Mã đơn, dịch vụ, liên kết…">
          <div>
            <Select aria-label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
              <option value="">Tất cả trạng thái</option>
              {Object.entries(orderStatusLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Input type="date" aria-label="Từ ngày" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Input type="date" aria-label="Đến ngày" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setFrom("");
              setTo("");
            }}
          >
            Xoá lọc
          </Button>
        </FilterBar>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard
          title="Danh sách đơn"
          description={`${filtered.length} đơn khớp bộ lọc`}
          className="min-w-0 xl:col-span-8"
          padded={false}
        >
          <DataTable
            caption="Danh sách đơn hàng đã tạo"
            columns={columns}
            rows={slice}
            state={state}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
            emptyTitle="Không có đơn nào khớp bộ lọc"
            emptyDescription="Thử bỏ bớt điều kiện lọc hoặc chọn khoảng ngày rộng hơn."
          />
          <div className="border-t border-lv-border px-5 py-3">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        </SectionCard>

        <div className="min-w-0 space-y-4 xl:col-span-4">
          <SectionCard title="Chi tiết đơn">
            {selected ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body-strong text-lv-text">#{selected.id}</p>
                    <p className="text-small text-lv-muted">{selected.code}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="mt-3 divide-y divide-lv-border">
                  <OrderSummaryRow label="Nền tảng" value={selected.platformName} />
                  <OrderSummaryRow label="Dịch vụ" value={selected.serviceName} />
                  <OrderSummaryRow label="Số lượng" value={formatNumber(selected.quantity)} />
                  <OrderSummaryRow label="Bắt đầu" value={formatNumber(selected.startCount)} />
                  <OrderSummaryRow label="Đã tăng" value={formatNumber(selected.delivered)} />
                  <OrderSummaryRow label="Thanh toán" value={formatMoney(selected.amount)} strong tone="gold" />
                  <OrderSummaryRow label="Tạo lúc" value={formatDateTime(selected.createdAt)} />
                </div>

                <div className="mt-3">
                  <ProgressBar
                    label="Tiến độ giao"
                    value={selected.delivered}
                    max={selected.quantity}
                    tone={selected.status === "completed" ? "success" : "gold"}
                  />
                </div>

                {selected.note ? (
                  <p className="mt-3 rounded-control border border-lv-border bg-lv-bg px-3 py-2 text-small text-lv-muted">
                    Ghi chú: {selected.note}
                  </p>
                ) : null}

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    icon={<IconRotateClockwise size={16} />}
                    onClick={() =>
                      toast.push({
                        tone: "info",
                        title: "Đã gửi yêu cầu bảo hành",
                        description: "Yêu cầu mô phỏng, chưa gửi tới hệ thống xử lý thật.",
                      })
                    }
                  >
                    Yêu cầu bù hụt
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<IconExternalLink size={16} />}
                    onClick={() =>
                      toast.push({ tone: "info", title: "Liên kết mục tiêu", description: selected.target })
                    }
                  >
                    Xem mục tiêu
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-small text-lv-muted">Chọn một đơn trong danh sách để xem chi tiết.</p>
            )}
          </SectionCard>

          <SupportCard
            channels={demoBrand.supportChannels.map((c) => ({ label: c.label, value: c.value }))}
            action={
              <Button variant="secondary" block icon={<IconHeadset size={16} />}>
                Mở yêu cầu hỗ trợ
              </Button>
            }
          />

          <div className="rounded-card border border-lv-border bg-lv-surface p-4">
            <p className="flex items-center gap-2 text-card-title text-lv-text">
              <IconClockHour4 size={17} className="text-lv-gold-600" />
              Thời gian xử lý
            </p>
            <p className="mt-1 text-small text-lv-muted">
              Đơn thường bắt đầu chạy trong 0–30 phút. Đơn số lượng lớn có thể chia nhiều đợt trong ngày.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
