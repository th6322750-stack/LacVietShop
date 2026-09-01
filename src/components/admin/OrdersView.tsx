"use client";

import * as React from "react";
import {
  IconArrowBackUp,
  IconCheck,
  IconClockPause,
  IconCoins,
  IconFileExport,
  IconRefresh,
  IconSend,
  IconShoppingCart,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";

/**
 * Đơn dịch vụ tương tác.
 *
 * Đơn khách đặt được đẩy thẳng sang nhà cung cấp. Đẩy không được — ví nguồn hết
 * tiền, khoá chưa bật, nguồn từ chối — thì đơn nằm chờ ở đây, tiền khách vẫn giữ.
 * Ba việc làm được với đơn chờ: đẩy lại, tự chạy tay rồi đánh dấu xong, hoặc huỷ
 * và hoàn tiền.
 */

interface Order {
  id: string;
  customer: string;
  platformName: string;
  serviceName: string;
  serverName: string;
  link: string;
  quantity: number;
  amount: number;
  cost: number;
  status: "pending" | "processing" | "running" | "completed" | "partial" | "canceled" | "refunded";
  providerOrderId: string | null;
  startCount: number;
  remains: number;
  createdAt: string;
  refunded: number;
  note?: string | null;
}

const statusLabels: Record<Order["status"], string> = {
  pending: "Chờ xử lý",
  processing: "Đã đẩy",
  running: "Đang chạy",
  completed: "Hoàn thành",
  partial: "Chạy một phần",
  canceled: "Đã huỷ",
  refunded: "Đã hoàn tiền",
};

const statusTones: Record<Order["status"], "gold" | "info" | "success" | "warning" | "danger" | "neutral"> = {
  pending: "gold",
  processing: "info",
  running: "info",
  completed: "success",
  partial: "warning",
  canceled: "neutral",
  refunded: "danger",
};

export function AdminOrdersView({ embedded = false }: { embedded?: boolean } = {}) {
  const toast = useToast();
  const { can } = useAdminSession();
  const editable = can("orders.status");
  const canRefund = can("orders.refund");
  const canExport = can("export.csv");

  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<Order["status"] | "">("");
  const [confirmRefund, setConfirmRefund] = React.useState<Order | null>(null);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/admin/service-orders")
      .then((r) => r.json())
      .catch(() => null);
    setOrders(res?.ok ? (res.orders ?? []) : []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function act(action: "push" | "complete" | "refund" | "sync", id?: string, done?: string) {
    setBusy(id ?? action);
    const res = await fetch("/api/admin/service-orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setBusy(null);

    if (res.orders) setOrders(res.orders);
    if (!res.ok) {
      toast.push({ tone: "error", title: "Không thực hiện được", description: String(res.error) });
      return;
    }
    toast.push({ tone: "success", title: done ?? "Đã cập nhật" });
  }

  const all = React.useMemo(() => orders ?? [], [orders]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((o) => {
      if (status && o.status !== status) return false;
      if (q && !`${o.id} ${o.customer} ${o.platformName} ${o.serviceName} ${o.link}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [all, search, status]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 15);

  const waiting = all.filter((o) => o.status === "pending");
  const doanhThu = all.filter((o) => o.refunded === 0).reduce((s, o) => s + o.amount, 0);
  const giaVon = all.filter((o) => o.refunded === 0).reduce((s, o) => s + o.cost, 0);

  /** Xuất đúng những đơn đang lọc, kèm giá vốn để đối chiếu lãi. */
  function xuatCsv() {
    downloadCsv("don-dich-vu", [
      ["Mã đơn", "Khách", "Nền tảng", "Dịch vụ", "Máy chủ", "Liên kết", "Số lượng", "Khách trả", "Giá vốn", "Lãi", "Trạng thái", "Mã bên nguồn", "Đặt lúc"],
      ...filtered.map((o) => [
        o.id,
        o.customer,
        o.platformName,
        o.serviceName,
        o.serverName,
        o.link,
        o.quantity,
        o.amount,
        o.cost,
        o.refunded > 0 ? 0 : o.amount - o.cost,
        statusLabels[o.status],
        o.providerOrderId ?? "",
        formatDateTime(o.createdAt),
      ]),
    ]);
    toast.push({ tone: "success", title: `Đã xuất ${filtered.length} đơn` });
  }

  const columns: Column<Order>[] = [
    {
      key: "order",
      header: "Đơn",
      cell: (o) => (
        <div className="min-w-0">
          <p className="text-body-strong text-lv-text">{o.id}</p>
          <p className="truncate text-small text-lv-muted">{o.customer}</p>
          <p className="text-small text-lv-muted">{formatDateTime(o.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Dịch vụ",
      cell: (o) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate text-body-strong text-lv-text">{o.serviceName}</p>
          <p className="truncate text-small text-lv-muted">
            {o.platformName} · {o.serverName}
          </p>
          <p className="truncate text-small text-lv-muted" title={o.link}>
            {o.link}
          </p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Số lượng",
      align: "right",
      cell: (o) => (
        <div>
          <p className="text-body-strong text-lv-text">{formatNumber(o.quantity)}</p>
          {o.providerOrderId ? (
            <p className="text-small text-lv-muted">còn {formatNumber(o.remains)}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "money",
      header: "Thu / vốn",
      align: "right",
      cell: (o) => (
        <div>
          <p className="lv-price text-body-strong text-lv-text">{formatMoney(o.amount)}</p>
          <p className="lv-price text-small text-lv-muted">vốn {formatMoney(o.cost)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (o) => (
        <div className="min-w-0">
          <Badge tone={statusTones[o.status]}>{statusLabels[o.status]}</Badge>
          {o.providerOrderId ? <p className="mt-1 text-small text-lv-muted">#{o.providerOrderId}</p> : null}
          {o.note ? (
            <p className="mt-1 max-w-[220px] truncate text-small text-lv-muted" title={o.note}>
              {o.note}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (o) =>
        !editable ? (
          <span className="text-small text-lv-muted">chỉ xem</span>
        ) : (
          <div className="flex flex-wrap justify-end gap-1">
            {o.status === "pending" ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<IconSend size={15} />}
                  loading={busy === o.id}
                  onClick={() => void act("push", o.id, "Đã đẩy đơn sang nhà cung cấp")}
                >
                  Đẩy lại
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<IconCheck size={15} />}
                  loading={busy === o.id}
                  onClick={() => void act("complete", o.id, "Đã đánh dấu hoàn thành")}
                >
                  Đã chạy tay
                </Button>
              </>
            ) : null}
            {canRefund && o.refunded === 0 && o.status !== "completed" ? (
              <Button
                size="sm"
                variant="ghost"
                icon={<IconArrowBackUp size={15} />}
                onClick={() => setConfirmRefund(o)}
              >
                Hoàn tiền
              </Button>
            ) : null}
          </div>
        ),
    },
  ];

  const body = (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chờ xử lý"
          value={formatNumber(waiting.length)}
          suffix="đơn"
          tone="gold"
          icon={<IconClockPause size={20} />}
        />
        <StatCard
          label="Tổng đơn"
          value={formatNumber(all.length)}
          suffix="đơn"
          tone="navy"
          icon={<IconShoppingCart size={20} />}
        />
        <StatCard label="Khách đã trả" value={formatMoney(doanhThu)} tone="success" icon={<IconCoins size={20} />} />
        <StatCard label="Lãi gộp" value={formatMoney(doanhThu - giaVon)} tone="gold" icon={<IconCoins size={20} />} />
      </div>

      {waiting.length > 0 ? (
        <InfoCard title={`${waiting.length} đơn đang chờ`} tone="warning" icon={<IconClockPause size={16} />}>
          Khách đã trả tiền nhưng chưa đẩy được sang nhà cung cấp. Nạp tiền vào ví nguồn rồi bấm “Đẩy lại”, hoặc tự
          chạy tay xong thì bấm “Đã chạy tay”. Không xử lý được thì hoàn tiền cho khách.
        </InfoCard>
      ) : null}

      <SectionCard
        title="Đơn dịch vụ"
        description={all.length ? `${filtered.length} đơn khớp bộ lọc` : undefined}
        padded={false}
        action={
          <div className="flex flex-wrap gap-2">
            {canExport ? (
              <Button variant="ghost" size="sm" icon={<IconFileExport size={15} />} onClick={xuatCsv}>
                Xuất CSV
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              icon={<IconRefresh size={15} />}
              loading={busy === "sync"}
              onClick={() => void act("sync", undefined, "Đã hỏi lại tiến độ")}
            >
              Cập nhật tiến độ
            </Button>
          </div>
        }
      >
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Mã đơn, khách, dịch vụ, liên kết…">
            <Select
              aria-label="Trạng thái"
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"] | "")}
            >
              <option value="">Tất cả trạng thái</option>
              {(Object.keys(statusLabels) as Order["status"][]).map((k) => (
                <option key={k} value={k}>
                  {statusLabels[k]}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>
        <DataTable
          caption="Đơn dịch vụ tương tác"
          columns={columns}
          rows={slice}
          state={orders === null ? "loading" : "ready"}
          emptyTitle={all.length === 0 ? "Chưa có đơn dịch vụ nào" : "Không có đơn nào khớp bộ lọc"}
          emptyDescription={all.length === 0 ? "Đơn khách đặt ở trang Dịch vụ sẽ hiện tại đây." : undefined}
        />
        {pageCount > 1 ? (
          <div className="border-t border-lv-border px-5 py-3">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        ) : null}
      </SectionCard>

      <ConfirmDialog
        open={confirmRefund !== null}
        title="Huỷ đơn và hoàn tiền?"
        message={
          confirmRefund
            ? `Hoàn ${formatMoney(confirmRefund.amount)} vào số dư của ${confirmRefund.customer}. Không hoàn lại được lần hai.`
            : ""
        }
        confirmLabel="Hoàn tiền"
        tone="danger"
        onClose={() => setConfirmRefund(null)}
        onConfirm={() => {
          const target = confirmRefund;
          setConfirmRefund(null);
          if (target) void act("refund", target.id, "Đã hoàn tiền cho khách");
        }}
      />
    </>
  );

  if (embedded) return <div className="space-y-5">{body}</div>;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đơn dịch vụ"
        description="Đơn khách đặt, tiến độ bên nhà cung cấp và hàng đợi chờ xử lý tay."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Đơn dịch vụ" }]}
      />
      {body}
    </div>
  );
}
