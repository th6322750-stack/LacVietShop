"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconCoins,
  IconPackageExport,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { Tabs } from "@/components/ui/Tabs";
import { AdminPremiumStockView } from "./PremiumStockView";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Giao hàng premium.
 *
 * Dịch vụ tương tác đẩy thẳng sang API nhà cung cấp nên tự chạy. Tài khoản
 * premium là hàng của mình: khách trả tiền xong đơn nằm ở đây chờ, quản trị viên
 * điền thông tin tài khoản rồi bấm giao. Khách thấy ngay ở trang Sản phẩm đã mua.
 */

interface Credential {
  label: string;
  value: string;
}

interface Order {
  id: string;
  productSlug: string;
  productName: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: "pending" | "delivered" | "canceled";
  createdAt: string;
  deliveredAt?: string | null;
  credentials: Credential[];
  note?: string | null;
  customerNote?: string | null;
  buyer: { name: string; email: string; username: string } | null;
}

/** Mẫu điền sẵn theo loại hàng, đỡ phải gõ lại nhãn mỗi lần. */
const TEMPLATES: Record<string, Credential[]> = {
  default: [
    { label: "Email đăng nhập", value: "" },
    { label: "Mật khẩu", value: "" },
  ],
  netflix: [
    { label: "Email đăng nhập", value: "" },
    { label: "Mật khẩu", value: "" },
    { label: "Tên hồ sơ", value: "" },
    { label: "Mã PIN hồ sơ", value: "" },
  ],
  vpn: [
    { label: "Dịch vụ", value: "" },
    { label: "Tài khoản", value: "" },
    { label: "Mật khẩu", value: "" },
  ],
};

export function AdminPremiumOrdersView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const editable = can("products.edit");

  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"pending" | "delivered" | "canceled" | "">("");
  const [search, setSearch] = React.useState("");
  const [delivering, setDelivering] = React.useState<Order | null>(null);
  const [canceling, setCanceling] = React.useState<Order | null>(null);
  const [view, setView] = React.useState<"orders" | "stock">("stock");

  const load = React.useCallback(async () => {
    setFailed(null);
    const res = await fetch("/api/admin/product-orders")
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    if (!res.ok) {
      setFailed(String(res.error));
      setOrders([]);
      return;
    }
    setOrders(res.orders ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const all = React.useMemo(() => orders ?? [], [orders]);
  const counts = {
    pending: all.filter((o) => o.status === "pending").length,
    delivered: all.filter((o) => o.status === "delivered").length,
    canceled: all.filter((o) => o.status === "canceled").length,
  };
  const pendingValue = all.filter((o) => o.status === "pending").reduce((s, o) => s + o.amount, 0);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((o) => {
      if (status && o.status !== status) return false;
      if (q && !`${o.productName} ${o.packageName} ${o.buyer?.name ?? ""} ${o.buyer?.email ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [all, status, search]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 12);

  async function act(body: Record<string, unknown>, done: string) {
    const res = await fetch("/api/admin/product-orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));

    if (!res.ok) {
      toast.push({ tone: "error", title: "Không xử lý được", description: String(res.error) });
      return false;
    }
    toast.push({ tone: "success", title: done });
    await load();
    return true;
  }

  const columns: Column<Order>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      cell: (o) => (
        <div className="min-w-0 max-w-[280px]">
          <p className="truncate text-body-strong text-lv-text">{o.productName}</p>
          <p className="truncate text-small text-lv-muted">{o.packageName}</p>
        </div>
      ),
    },
    {
      key: "buyer",
      header: "Khách",
      cell: (o) => (
        <div className="min-w-0 max-w-[240px]">
          <p className="truncate text-body text-lv-text">{o.buyer?.name ?? "—"}</p>
          <p className="truncate text-small text-lv-muted">{o.buyer?.email ?? o.id}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      align: "right",
      cell: (o) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(o.amount)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (o) =>
        o.status === "delivered" ? (
          <Badge tone="success">Đã giao</Badge>
        ) : o.status === "pending" ? (
          <Badge tone="warning">Chờ giao</Badge>
        ) : (
          <Badge tone="danger">Đã huỷ</Badge>
        ),
    },
    { key: "createdAt", header: "Đặt lúc", align: "right", cell: (o) => formatDateTime(o.createdAt) },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (o) =>
        o.status !== "pending" ? (
          <span className="text-small text-lv-muted">{o.status === "delivered" ? "xong" : "đã huỷ"}</span>
        ) : editable ? (
          <span className="flex justify-end gap-1">
            <Button size="sm" icon={<IconPackageExport size={15} />} onClick={() => setDelivering(o)}>
              Giao
            </Button>
            <Button variant="ghost" size="sm" aria-label="Huỷ đơn" onClick={() => setCanceling(o)}>
              <IconTrash size={15} className="text-lv-danger" />
            </Button>
          </span>
        ) : (
          <span className="text-small text-lv-muted">chỉ xem</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sản phẩm premium"
        description="Nạp hàng vào kho và đặt định dạng tài khoản. Khách mua là hệ thống giao ngay, không cần duyệt tay."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Sản phẩm premium" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void load()}>
            Làm mới
          </Button>
        }
      />

      <Tabs
        ariaLabel="Khu vực hàng premium"
        value={view}
        onChange={(id) => setView(id as "orders" | "stock")}
        items={[
          { id: "stock", label: "Kho hàng" },
          { id: "orders", label: "Lịch sử đơn", count: counts.pending || undefined },
        ]}
      />

      {view === "stock" ? <AdminPremiumStockView /> : null}

      {view === "orders" && failed ? (
        <InfoCard title="Không đọc được đơn" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {failed} Đăng xuất rồi đăng nhập lại trang quản trị để cấp phiên mới.
        </InfoCard>
      ) : null}

      {view === "orders" && counts.pending > 0 ? (
        <InfoCard title={`${counts.pending} đơn chưa giao được`} tone="danger" icon={<IconClock size={16} />}>
          Khách đã trả {formatMoney(pendingValue)} mà hệ thống chưa giao được — thường vì gói đó chưa đặt định
          dạng hàng nên không bán theo kho. Sang tab Kho hàng đặt định dạng rồi nạp hàng, hoặc giao tay ở đây.
        </InfoCard>
      ) : null}

      {view === "orders" ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chưa giao được"
          value={String(counts.pending)}
          suffix="đơn"
          tone={counts.pending ? "danger" : "info"}
          icon={<IconClock size={18} />}
        />
        <StatCard label="Đã giao" value={String(counts.delivered)} suffix="đơn" tone="success" icon={<IconCheck size={18} />} />
        <StatCard label="Đã huỷ" value={String(counts.canceled)} suffix="đơn" tone="info" icon={<IconX size={18} />} />
        <StatCard
          label="Tiền đang giữ"
          value={formatMoney(pendingValue)}
          tone="gold"
          icon={<IconCoins size={18} />}
          hint="của các đơn chưa giao"
        />
      </div>

      ) : null}

      {view === "orders" ? (
      <SectionCard title="Lịch sử đơn premium" description={`${filtered.length} đơn`}>
        <FilterBar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tên sản phẩm, tên khách, email…"
          right={
            can("export.csv") ? (
              <Button
                variant="secondary"
                onClick={() => {
                  downloadCsv("don-premium", [
                    ["Mã đơn", "Sản phẩm", "Gói", "Khách", "Email", "Số tiền", "Trạng thái", "Đặt lúc", "Giao lúc"],
                    ...filtered.map((o) => [
                      o.id,
                      o.productName,
                      o.packageName,
                      o.buyer?.name ?? "",
                      o.buyer?.email ?? "",
                      o.amount,
                      o.status,
                      o.createdAt,
                      o.deliveredAt ?? "",
                    ]),
                  ]);
                  toast.push({ tone: "success", title: `Đã xuất ${filtered.length} đơn` });
                }}
              >
                Xuất CSV
              </Button>
            ) : null
          }
        >
          <Select
            aria-label="Lọc theo trạng thái"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="delivered">Đã giao</option>
            <option value="pending">Chưa giao được</option>
            <option value="canceled">Đã huỷ</option>
          </Select>
        </FilterBar>

        <DataTable
          caption="Lịch sử đơn premium"
          columns={columns}
          rows={slice}
          rowKey={(o) => o.id}
          state={orders === null ? "loading" : "ready"}
          emptyTitle="Không có đơn nào"
          emptyDescription="Đơn premium của khách sẽ hiện ở đây ngay khi thanh toán xong."
        />
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onChange={setPage} />
      </SectionCard>
      ) : null}

      <DeliverModal
        order={delivering}
        onClose={() => setDelivering(null)}
        onSubmit={async (credentials, note) => {
          const ok = await act({ id: delivering!.id, action: "deliver", credentials, note }, "Đã giao hàng cho khách");
          if (ok) setDelivering(null);
        }}
      />

      <ConfirmDialog
        open={!!canceling}
        onClose={() => setCanceling(null)}
        onConfirm={async () => {
          await act({ id: canceling!.id, action: "cancel" }, "Đã huỷ đơn và hoàn tiền");
          setCanceling(null);
        }}
        title="Huỷ đơn và hoàn tiền?"
        message={
          canceling
            ? `${canceling.productName} · ${canceling.packageName}. Số tiền ${formatMoney(canceling.amount)} sẽ được cộng lại vào số dư của khách.`
            : ""
        }
        confirmLabel="Huỷ đơn"
        tone="danger"
      />
    </div>
  );
}

/** Hộp điền thông tin tài khoản để giao cho khách. */
function DeliverModal({
  order,
  onClose,
  onSubmit,
}: {
  order: Order | null;
  onClose: () => void;
  onSubmit: (credentials: Credential[], note: string) => void | Promise<void>;
}) {
  const [rows, setRows] = React.useState<Credential[]>([]);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!order) return;
    setRows((TEMPLATES[order.productSlug] ?? TEMPLATES.default).map((r) => ({ ...r })));
    setNote("");
  }, [order]);

  if (!order) return null;

  const filled = rows.filter((r) => r.label.trim() && r.value.trim());

  return (
    <Modal
      open
      onClose={onClose}
      title="Giao hàng cho khách"
      description={`${order.productName} · ${order.packageName}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="rounded-card border border-lv-border bg-lv-bg p-3 text-small">
          <p className="text-lv-muted">
            Khách: <span className="text-body-strong text-lv-text">{order.buyer?.name ?? "—"}</span>{" "}
            {order.buyer?.email ? `· ${order.buyer.email}` : ""}
          </p>
          <p className="mt-1 text-lv-muted">
            Đã trả <span className="lv-price text-body-strong text-lv-text">{formatMoney(order.amount)}</span> lúc{" "}
            {formatDateTime(order.createdAt)}
          </p>
          {order.customerNote ? (
            <p className="mt-2 rounded-control border border-lv-border-gold bg-lv-gold-50 px-2 py-1.5 text-lv-gold-700">
              Khách ghi chú: {order.customerNote}
            </p>
          ) : null}
        </div>

        <div>
          <Label>Thông tin tài khoản giao cho khách</Label>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label={`Nhãn dòng ${i + 1}`}
                  placeholder="Nhãn, ví dụ Email"
                  className="w-[38%]"
                  value={r.label}
                  onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                <Input
                  aria-label={`Giá trị dòng ${i + 1}`}
                  placeholder="Giá trị"
                  value={r.value}
                  onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                />
                <Button
                  variant="ghost"
                  aria-label={`Xoá dòng ${i + 1}`}
                  onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  disabled={rows.length <= 1}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            icon={<IconPlus size={15} />}
            onClick={() => setRows([...rows, { label: "", value: "" }])}
            disabled={rows.length >= 10}
          >
            Thêm dòng
          </Button>
        </div>

        <div>
          <Label htmlFor="deliver-note">Ghi chú gửi khách</Label>
          <Textarea
            id="deliver-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: bảo hành tới 30/09/2026, không đổi mật khẩu trong 24 giờ đầu."
          />
        </div>

        <InfoCard title="Kiểm lại trước khi bấm giao" tone="warning" icon={<IconAlertTriangle size={16} />}>
          Giao xong là khách thấy ngay và không sửa lại được từ màn này. Sai thông tin thì phải liên hệ khách trực tiếp.
        </InfoCard>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            loading={busy}
            disabled={filled.length === 0}
            icon={<IconPackageExport size={17} />}
            onClick={async () => {
              setBusy(true);
              await onSubmit(filled, note);
              setBusy(false);
            }}
          >
            Giao {filled.length} dòng thông tin
          </Button>
        </div>
      </div>
    </Modal>
  );
}
