"use client";

import * as React from "react";
import { IconClipboardList, IconClockHour4, IconRefresh } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard } from "@/components/blocks/Cards";
import { SignInGate } from "@/components/blocks/SignInGate";
import { Column, DataTable, FilterBar } from "@/components/blocks/DataTable";
import { OrderSummaryRow, ProgressBar } from "@/components/blocks/Commerce";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { demoBrand } from "@/lib/demo/config";
import { useLedger, type PurchaseOrder, type ServiceOrder } from "@/lib/customer/ledger";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";

/**
 * Tiến độ đơn hàng.
 *
 * Gộp hai loại đơn của tài khoản đang đăng nhập:
 *   - đơn dịch vụ tương tác (/api/orders), có tiến độ chạy,
 *   - đơn mua tài khoản premium (/api/products/orders), có trạng thái giao hàng.
 * Chỉ dữ liệu thật; trang này từng hiện một danh sách đơn dựng sẵn cho cả khách
 * chưa đăng nhập, đã bỏ hẳn.
 */

type Kind = "service" | "premium";

interface Row {
  kind: Kind;
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  amount: number;
  createdAt: string;
  statusLabel: string;
  tone: "gold" | "info" | "success" | "warning" | "danger" | "neutral";
  /** Chỉ đơn dịch vụ mới có tiến độ chạy. */
  progress?: { done: number; total: number };
  note?: string | null;
  done: boolean;
  waiting: boolean;
  service?: ServiceOrder;
  premium?: PurchaseOrder;
}

const serviceLabels: Record<ServiceOrder["status"], string> = {
  pending: "Chờ xử lý",
  processing: "Đã tiếp nhận",
  running: "Đang chạy",
  completed: "Hoàn thành",
  partial: "Chạy một phần",
  canceled: "Đã huỷ",
  refunded: "Đã hoàn tiền",
};

const serviceTones: Record<ServiceOrder["status"], Row["tone"]> = {
  pending: "gold",
  processing: "info",
  running: "info",
  completed: "success",
  partial: "warning",
  canceled: "neutral",
  refunded: "danger",
};

const premiumLabels: Record<PurchaseOrder["status"], string> = {
  pending: "Chờ giao",
  delivered: "Đã giao",
  canceled: "Đã huỷ",
};

const premiumTones: Record<PurchaseOrder["status"], Row["tone"]> = {
  pending: "gold",
  delivered: "success",
  canceled: "danger",
};

const FILTERS = [
  { id: "waiting", label: "Đang chờ / đang chạy" },
  { id: "done", label: "Hoàn thành" },
  { id: "service", label: "Đơn dịch vụ" },
  { id: "premium", label: "Đơn premium" },
];

export function ProgressView() {
  const { ready, signedIn, loading, orders, services, reload } = useLedger();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const rows = React.useMemo<Row[]>(() => {
    const out: Row[] = [];

    for (const o of services) {
      const done = o.status === "completed" || o.status === "refunded" || o.status === "canceled";
      out.push({
        kind: "service",
        id: o.id,
        title: o.serviceName,
        subtitle: `${o.platformName} · ${o.serverName}`,
        detail: o.link,
        amount: o.amount,
        createdAt: o.createdAt,
        statusLabel: serviceLabels[o.status],
        tone: serviceTones[o.status],
        progress: { done: Math.max(0, o.quantity - o.remains), total: o.quantity },
        note: o.note,
        done,
        waiting: !done,
        service: o,
      });
    }

    for (const o of orders) {
      out.push({
        kind: "premium",
        id: o.id,
        title: o.productName,
        subtitle: o.packageName,
        detail: "Tài khoản premium",
        amount: o.amount,
        createdAt: o.createdAt,
        statusLabel: premiumLabels[o.status],
        tone: premiumTones[o.status],
        note: o.note,
        done: o.status !== "pending",
        waiting: o.status === "pending",
        premium: o,
      });
    }

    return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  }, [orders, services]);

  // Còn đơn đang chờ thì hỏi lại định kỳ, kèm hỏi nhà cung cấp cho tiến độ mới.
  const hasWaiting = rows.some((r) => r.waiting);
  React.useEffect(() => {
    if (!hasWaiting) return;
    const t = window.setInterval(() => void reload(true), 30_000);
    return () => window.clearInterval(t);
  }, [hasWaiting, reload]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "waiting" && !r.waiting) return false;
      if (filter === "done" && !r.done) return false;
      if (filter === "service" && r.kind !== "service") return false;
      if (filter === "premium" && r.kind !== "premium") return false;
      const day = r.createdAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !`${r.id} ${r.title} ${r.subtitle} ${r.detail}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, filter, from, to]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const metrics = React.useMemo(
    () => [
      { label: "Đang chờ / đang chạy", value: rows.filter((r) => r.waiting).length, tone: "gold" as const },
      {
        label: "Hoàn thành",
        value: rows.filter((r) => r.statusLabel === "Hoàn thành" || r.statusLabel === "Đã giao").length,
        tone: "success" as const,
      },
      {
        label: "Hoàn tiền / huỷ",
        value: rows.filter((r) => r.tone === "danger" || r.tone === "neutral").length,
        tone: "danger" as const,
      },
      { label: "Tổng đơn", value: rows.length, tone: "info" as const },
    ],
    [rows],
  );

  const columns: Column<Row>[] = [
    {
      key: "order",
      header: "Đơn hàng",
      cell: (r) => (
        <div className="min-w-0">
          <p className="text-body-strong text-lv-text">{r.id}</p>
          <p className="text-small text-lv-muted">{formatDateTime(r.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "what",
      header: "Nội dung",
      cell: (r) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate text-body-strong text-lv-text">{r.title}</p>
          <p className="truncate text-small text-lv-muted">{r.subtitle}</p>
          <p className="truncate text-small text-lv-muted" title={r.detail}>
            {r.detail}
          </p>
        </div>
      ),
    },
    {
      key: "progress",
      header: "Tiến độ",
      align: "right",
      cell: (r) =>
        r.progress ? (
          <div className="min-w-[140px]">
            <ProgressBar
              value={r.progress.done}
              max={r.progress.total}
              showValue
              tone={r.statusLabel === "Hoàn thành" ? "success" : "gold"}
            />
          </div>
        ) : (
          <span className="text-small text-lv-muted">—</span>
        ),
    },
    {
      key: "amount",
      header: "Thanh toán",
      align: "right",
      cell: (r) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (r) => <Badge tone={r.tone}>{r.statusLabel}</Badge>,
    },
  ];

  if (ready && !signedIn) {
    return (
      <SignInGate
        title="Tiến độ đơn hàng"
        description="Theo dõi trạng thái xử lý của từng đơn."
        next="/progress"
        reason="Đơn hàng gắn với tài khoản của bạn, đăng nhập để xem."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tiến độ đơn hàng"
        description="Theo dõi trạng thái xử lý của từng đơn."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tiến độ đơn hàng" }]}
        action={
          <Button variant="secondary" onClick={() => void reload(true)} icon={<IconRefresh size={16} />}>
            Làm mới
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <StatCard
            key={m.label}
            label={m.label}
            value={formatNumber(m.value)}
            suffix="đơn"
            tone={m.tone}
            icon={<IconClipboardList size={20} />}
          />
        ))}
      </div>

      <SectionCard title="Bộ lọc" padded>
        <FilterBar search={search} onSearch={setSearch} placeholder="Mã đơn, dịch vụ, liên kết…">
          <div>
            <Select aria-label="Lọc đơn" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Tất cả đơn</option>
              {FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
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
              setFilter("");
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
          description={rows.length ? `${filtered.length} đơn khớp bộ lọc` : undefined}
          className="min-w-0 xl:col-span-8"
          padded={false}
        >
          <DataTable
            caption="Đơn hàng của tài khoản"
            columns={columns}
            rows={filtered}
            state={loading && rows.length === 0 ? "loading" : "ready"}
            selectedId={selectedId}
            onSelect={(r) => setSelectedId(r.id)}
            emptyTitle={rows.length === 0 ? "Bạn chưa có đơn hàng nào" : "Không có đơn nào khớp bộ lọc"}
            emptyDescription={
              rows.length === 0
                ? "Đơn sẽ hiện ở đây ngay sau khi bạn đặt dịch vụ hoặc mua hàng."
                : "Thử bỏ bớt điều kiện lọc hoặc chọn khoảng ngày rộng hơn."
            }
          />
        </SectionCard>

        <div className="min-w-0 space-y-4 xl:col-span-4">
          <SectionCard title="Chi tiết đơn">
            {selected ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-body-strong text-lv-text">{selected.id}</p>
                  <Badge tone={selected.tone}>{selected.statusLabel}</Badge>
                </div>

                <div className="mt-3 divide-y divide-lv-border">
                  <OrderSummaryRow label={selected.kind === "service" ? "Dịch vụ" : "Sản phẩm"} value={selected.title} />
                  <OrderSummaryRow label={selected.kind === "service" ? "Máy chủ" : "Gói"} value={selected.subtitle} />
                  {selected.service ? (
                    <>
                      <OrderSummaryRow label="Số lượng" value={formatNumber(selected.service.quantity)} />
                      <OrderSummaryRow label="Bắt đầu" value={formatNumber(selected.service.startCount)} />
                      <OrderSummaryRow label="Còn lại" value={formatNumber(selected.service.remains)} />
                    </>
                  ) : null}
                  <OrderSummaryRow label="Thanh toán" value={formatMoney(selected.amount)} strong tone="gold" />
                  <OrderSummaryRow label="Đặt lúc" value={formatDateTime(selected.createdAt)} />
                </div>

                {selected.progress ? (
                  <div className="mt-3">
                    <ProgressBar
                      label="Tiến độ giao"
                      value={selected.progress.done}
                      max={selected.progress.total}
                      tone={selected.statusLabel === "Hoàn thành" ? "success" : "gold"}
                    />
                  </div>
                ) : null}

                {selected.service?.status === "pending" ? (
                  <p className="mt-3 rounded-control border border-lv-border-gold bg-lv-gold-50 px-3 py-2 text-small text-lv-gold-700">
                    Đơn đã nhận và đang xếp hàng chờ xử lý. Bộ phận vận hành sẽ chạy trong giờ làm việc.
                  </p>
                ) : null}

                {selected.note ? (
                  <p className="mt-3 rounded-control border border-lv-border bg-lv-bg px-3 py-2 text-small text-lv-muted">
                    Ghi chú: {selected.note}
                  </p>
                ) : null}

                {selected.premium?.status === "delivered" ? (
                  <LinkButton href="/purchased" variant="secondary" block className="mt-4">
                    Xem thông tin tài khoản đã nhận
                  </LinkButton>
                ) : null}
              </div>
            ) : (
              <p className="text-small text-lv-muted">
                {rows.length ? "Chọn một đơn trong danh sách để xem chi tiết." : "Chưa có đơn nào để xem."}
              </p>
            )}
          </SectionCard>

          <SupportCard
            channels={demoBrand.supportChannels.map((c) => ({ label: c.label, value: c.value }))}
          />

          <div className="rounded-card border border-lv-border bg-lv-surface p-4">
            <p className="flex items-center gap-2 text-card-title text-lv-text">
              <IconClockHour4 size={17} className="text-lv-gold-600" />
              Thời gian xử lý
            </p>
            <p className="mt-1 text-small text-lv-muted">
              Đơn dịch vụ thường bắt đầu chạy trong 0–30 phút. Gói premium có sẵn trong kho được giao ngay khi
              thanh toán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
