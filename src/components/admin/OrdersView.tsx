"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { IconArrowBackUp, IconCoins, IconEye, IconFileExport, IconRefresh, IconShoppingCart, IconTrash } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { OrderSummaryRow, ProgressBar } from "@/components/blocks/Commerce";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { orderStatusLabels, type AdminOrder } from "@/lib/admin/data";
import { revenueOf, useAdminStore } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export function AdminOrdersView() {
  const params = useSearchParams();
  const toast = useToast();
  const { can } = useAdminSession();
  const { orders, users, services, setOrderStatus, deleteOrder } = useAdminStore();

  const [search, setSearch] = React.useState(params.get("q") ?? "");
  const [status, setStatus] = React.useState<OrderStatus | "">("");
  const [platform, setPlatform] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [detail, setDetail] = React.useState<AdminOrder | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminOrder | null>(null);
  const [confirmRefund, setConfirmRefund] = React.useState<AdminOrder | null>(null);

  const platformNames = React.useMemo(
    () => [...new Set(services.map((s) => s.platformName))].sort(),
    [services],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (platform && o.platformName !== platform) return false;
      const day = o.createdAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !`${o.id} ${o.code} ${o.serviceName} ${o.platformName} ${o.target}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [orders, search, status, platform, from, to]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 15);
  const userOf = (id: number) => users.find((u) => u.id === id);

  const columns: Column<AdminOrder>[] = [
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
      key: "customer",
      header: "Khách hàng",
      cell: (o) => {
        const u = userOf(o.userId);
        return u ? (
          <div className="min-w-0 max-w-[180px]">
            <p className="truncate text-body-strong text-lv-text">{u.name}</p>
            <p className="truncate text-small text-lv-muted">{u.level}</p>
          </div>
        ) : (
          <span className="text-lv-muted">—</span>
        );
      },
    },
    {
      key: "service",
      header: "Dịch vụ",
      cell: (o) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="truncate text-body-strong text-lv-text">{o.serviceName}</p>
          <p className="truncate text-small text-lv-muted">{o.platformName}</p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Tiến độ",
      align: "right",
      cell: (o) => (
        <div className="min-w-[130px]">
          <ProgressBar value={o.delivered} max={o.quantity} tone={o.status === "completed" ? "success" : "gold"} />
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
      cell: (o) =>
        can("orders.status") ? (
          <Select
            aria-label={`Trạng thái đơn ${o.id}`}
            value={o.status}
            onChange={(e) => {
              setOrderStatus(o.id, e.target.value as OrderStatus);
              toast.push({ tone: "success", title: `Đã đổi trạng thái đơn #${o.id}` });
            }}
            className="h-8 min-w-[124px] text-small"
          >
            {(Object.keys(orderStatusLabels) as OrderStatus[]).map((k) => (
              <option key={k} value={k}>
                {orderStatusLabels[k]}
              </option>
            ))}
          </Select>
        ) : (
          <StatusBadge status={o.status} />
        ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (o) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="secondary" size="sm" aria-label={`Chi tiết đơn ${o.id}`} onClick={() => setDetail(o)}>
            <IconEye size={15} />
          </Button>
          {can("orders.refund") ? (
            <Button
              variant="secondary"
              size="sm"
              aria-label={`Hoàn tiền đơn ${o.id}`}
              onClick={() => setConfirmRefund(o)}
              disabled={o.status === "refunded"}
            >
              <IconArrowBackUp size={15} />
            </Button>
          ) : null}
          {can("orders.delete") ? (
            <Button variant="danger" size="sm" aria-label={`Xoá đơn ${o.id}`} onClick={() => setConfirmDelete(o)}>
              <IconTrash size={15} />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  function exportCsv() {
    const rows: unknown[][] = [
      ["ID", "Mã đơn", "Ngày tạo", "Khách hàng", "Cấp bậc", "Nền tảng", "Dịch vụ", "Số lượng", "Đã tăng", "Thanh toán", "Trạng thái"],
    ];
    for (const o of filtered) {
      const u = userOf(o.userId);
      rows.push([o.id, o.code, o.createdAt, u?.name ?? "", u?.level ?? "", o.platformName, o.serviceName, o.quantity, o.delivered, o.amount, orderStatusLabels[o.status]]);
    }
    const file = downloadCsv("don-hang", rows);
    toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng`, description: file });
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Đơn hàng" description="Lọc, đổi trạng thái, hoàn tiền và xuất dữ liệu đơn." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đơn khớp bộ lọc" value={formatNumber(filtered.length)} suffix="đơn" tone="gold" icon={<IconShoppingCart size={20} />} />
        <StatCard label="Doanh thu" value={formatMoney(revenueOf(filtered))} tone="success" icon={<IconCoins size={20} />} />
        <StatCard label="Đang chạy" value={formatNumber(filtered.filter((o) => o.status === "running").length)} suffix="đơn" tone="info" icon={<IconRefresh size={20} />} />
        <StatCard label="Hoàn tiền" value={formatNumber(filtered.filter((o) => o.status === "refunded").length)} suffix="đơn" tone="danger" icon={<IconArrowBackUp size={20} />} />
      </div>

      <SectionCard title="Bộ lọc">
        <FilterBar search={search} onSearch={setSearch} placeholder="ID, mã đơn, dịch vụ, liên kết…">
          <Select aria-label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
            <option value="">Tất cả trạng thái</option>
            {(Object.keys(orderStatusLabels) as OrderStatus[]).map((k) => (
              <option key={k} value={k}>
                {orderStatusLabels[k]}
              </option>
            ))}
          </Select>
          <Select aria-label="Nền tảng" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="">Tất cả nền tảng</option>
            {platformNames.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Input type="date" aria-label="Từ ngày" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" aria-label="Đến ngày" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPlatform("");
              setFrom("");
              setTo("");
            }}
          >
            Xoá lọc
          </Button>
        </FilterBar>
      </SectionCard>

      <SectionCard
        title="Danh sách đơn"
        description={`${formatNumber(filtered.length)} đơn`}
        action={
          can("export.csv") ? (
            <Button variant="secondary" size="sm" icon={<IconFileExport size={16} />} onClick={exportCsv}>
              Xuất CSV
            </Button>
          ) : null
        }
        padded={false}
      >
        <DataTable
          caption="Danh sách đơn hàng toàn hệ thống"
          columns={columns}
          rows={slice}
          rowKey={(o) => String(o.id)}
          emptyTitle="Không có đơn nào khớp bộ lọc"
          emptyDescription="Thử bỏ bớt điều kiện lọc hoặc mở rộng khoảng ngày."
        />
        <div className="border-t border-lv-border px-5 py-3">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </SectionCard>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `Chi tiết đơn #${detail.id}` : ""}>
        {detail ? (
          <div className="divide-y divide-lv-border">
            <OrderSummaryRow label="Mã đơn" value={detail.code} />
            <OrderSummaryRow label="Khách hàng" value={userOf(detail.userId)?.name ?? "—"} />
            <OrderSummaryRow label="Nền tảng" value={detail.platformName} />
            <OrderSummaryRow label="Dịch vụ" value={detail.serviceName} />
            <OrderSummaryRow label="Mục tiêu" value={detail.target} />
            <OrderSummaryRow label="Số lượng" value={formatNumber(detail.quantity)} />
            <OrderSummaryRow label="Đã tăng" value={formatNumber(detail.delivered)} />
            <OrderSummaryRow label="Thanh toán" value={formatMoney(detail.amount)} strong tone="gold" />
            <OrderSummaryRow label="Trạng thái" value={orderStatusLabels[detail.status]} />
            <OrderSummaryRow label="Ngày tạo" value={formatDateTime(detail.createdAt)} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!confirmRefund}
        onClose={() => setConfirmRefund(null)}
        onConfirm={() => {
          if (!confirmRefund) return;
          setOrderStatus(confirmRefund.id, "refunded");
          toast.push({
            tone: "success",
            title: `Đã hoàn ${formatMoney(confirmRefund.amount)}`,
            description: `Cộng lại số dư cho ${userOf(confirmRefund.userId)?.name ?? "khách hàng"}.`,
          });
          setConfirmRefund(null);
        }}
        title={confirmRefund ? `Hoàn tiền đơn #${confirmRefund.id}?` : ""}
        message={
          confirmRefund
            ? `Cộng lại ${formatMoney(confirmRefund.amount)} vào số dư của khách và ghi một giao dịch hoàn tiền.`
            : ""
        }
        confirmLabel="Hoàn tiền"
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteOrder(confirmDelete.id);
          toast.push({ tone: "success", title: `Đã xoá đơn #${confirmDelete.id}` });
          setConfirmDelete(null);
        }}
        title={confirmDelete ? `Xoá đơn #${confirmDelete.id}?` : ""}
        message="Đơn sẽ biến mất khỏi danh sách. Nạp lại dữ liệu gốc mới khôi phục được."
        confirmLabel="Xoá"
        tone="danger"
      />
    </div>
  );
}
