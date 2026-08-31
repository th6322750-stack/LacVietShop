"use client";

import * as React from "react";
import { IconCoins, IconFileExport, IconUsers, IconWallet } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDate, formatMoney, formatNumber, initialsOf } from "@/lib/utils";

/**
 * Khách hàng.
 *
 * Danh sách và số dư đều là dữ liệu thật của máy chủ. Màn này trước đây sửa số dư
 * trong localStorage của máy quản trị: bấm "cộng tiền" xong tưởng đã cộng cho
 * khách, thực tế khách không nhận được đồng nào. Nay mọi thay đổi đi qua
 * /api/admin/customers và được ghi lại thành một dòng trong sổ tiền của khách.
 */

interface Customer {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: string;
  daNap: number;
  daChi: number;
  soDon: number;
}

export function AdminUsersView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const canBalance = can("users.balance");
  const canExport = can("export.csv");

  const [customers, setCustomers] = React.useState<Customer[] | null>(null);
  const [search, setSearch] = React.useState("");
  const [target, setTarget] = React.useState<Customer | null>(null);
  const [amount, setAmount] = React.useState("100000");
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await fetch("/api/admin/customers")
      .then((r) => r.json())
      .catch(() => null);
    setCustomers(res?.ok ? (res.customers ?? []) : []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const all = React.useMemo(() => customers ?? [], [customers]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((u) => `${u.name} ${u.username} ${u.email} ${u.phone}`.toLowerCase().includes(q));
  }, [all, search]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 12);

  const tongDu = all.reduce((s, u) => s + u.balance, 0);
  const tongNap = all.reduce((s, u) => s + u.daNap, 0);

  async function apDung() {
    if (!target) return;
    const value = Math.round(Number(amount));
    if (!Number.isFinite(value) || value === 0) {
      toast.push({ tone: "warning", title: "Số tiền phải khác 0" });
      return;
    }

    setBusy(true);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: target.id, amount: value, note: note.trim() || undefined }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setBusy(false);

    if (!res.ok) {
      toast.push({ tone: "error", title: "Không đổi được số dư", description: String(res.error) });
      return;
    }
    setCustomers(res.customers ?? []);
    setTarget(null);
    setNote("");
    toast.push({
      tone: "success",
      title: `${value > 0 ? "Đã cộng" : "Đã trừ"} ${formatMoney(Math.abs(value))}`,
      description: `Số dư mới của ${target.name}: ${formatMoney(res.balance)}`,
    });
  }

  const columns: Column<Customer>[] = [
    {
      key: "user",
      header: "Khách hàng",
      cell: (u) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lv-border-gold bg-lv-gold-50 text-small-strong text-lv-gold-700">
            {initialsOf(u.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-strong text-lv-text">{u.name}</p>
            <p className="truncate text-small text-lv-muted">@{u.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Liên hệ",
      cell: (u) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="truncate text-small text-lv-muted">{u.email}</p>
          <p className="truncate text-small text-lv-muted">{u.phone}</p>
        </div>
      ),
    },
    {
      key: "balance",
      header: "Số dư",
      align: "right",
      cell: (u) => <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(u.balance)}</span>,
    },
    {
      key: "money",
      header: "Đã nạp / đã chi",
      align: "right",
      cell: (u) => (
        <div>
          <p className="lv-price text-small text-lv-success">{formatMoney(u.daNap)}</p>
          <p className="lv-price text-small text-lv-muted">{formatMoney(u.daChi)}</p>
        </div>
      ),
    },
    { key: "orders", header: "Đơn", align: "right", cell: (u) => formatNumber(u.soDon) },
    { key: "joined", header: "Tham gia", align: "right", cell: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "",
      cell: (u) =>
        canBalance ? (
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Cộng trừ tiền ${u.name}`}
            icon={<IconWallet size={15} />}
            onClick={() => {
              setTarget(u);
              setAmount("100000");
              setNote("");
            }}
          >
            Cộng / trừ
          </Button>
        ) : (
          <span className="text-small text-lv-muted">chỉ xem</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khách hàng"
        description="Tài khoản thật trên hệ thống, số dư và mức chi tiêu."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Khách hàng" }]}
        action={
          canExport ? (
            <Button
              variant="secondary"
              icon={<IconFileExport size={16} />}
              onClick={() => {
                downloadCsv("khach-hang", [
                  ["Tên", "Tài khoản", "Email", "Điện thoại", "Số dư", "Đã nạp", "Đã chi", "Số đơn", "Tham gia"],
                  ...filtered.map((u) => [
                    u.name,
                    u.username,
                    u.email,
                    u.phone,
                    u.balance,
                    u.daNap,
                    u.daChi,
                    u.soDon,
                    formatDate(u.createdAt),
                  ]),
                ]);
                toast.push({ tone: "success", title: `Đã xuất ${filtered.length} khách hàng` });
              }}
            >
              Xuất CSV
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Khách hàng"
          value={formatNumber(all.length)}
          suffix="tài khoản"
          tone="navy"
          icon={<IconUsers size={20} />}
        />
        <StatCard label="Tổng số dư đang giữ" value={formatMoney(tongDu)} tone="gold" icon={<IconWallet size={20} />} />
        <StatCard label="Tổng đã nạp" value={formatMoney(tongNap)} tone="success" icon={<IconCoins size={20} />} />
      </div>

      <SectionCard
        title="Danh sách khách hàng"
        description={all.length ? `${filtered.length} khách khớp bộ lọc` : undefined}
        padded={false}
      >
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tên, tài khoản, email, số điện thoại…" />
        </div>
        <DataTable
          caption="Khách hàng của hệ thống"
          columns={columns}
          rows={slice}
          state={customers === null ? "loading" : "ready"}
          emptyTitle={all.length === 0 ? "Chưa có khách hàng nào" : "Không có khách nào khớp bộ lọc"}
          emptyDescription={all.length === 0 ? "Tài khoản khách đăng ký sẽ hiện tại đây." : undefined}
        />
        {pageCount > 1 ? (
          <div className="border-t border-lv-border px-5 py-3">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        ) : null}
      </SectionCard>

      {target ? (
        <Modal open onClose={() => setTarget(null)} title="Cộng / trừ số dư" description={target.name} size="sm">
          <div className="space-y-4">
            <InfoCard title="Đây là tiền thật" tone="warning" icon={<IconWallet size={16} />}>
              Số dư đổi ngay và khách nhìn thấy một dòng trong sổ tiền. Nhập số âm để trừ.
            </InfoCard>

            <div>
              <Label htmlFor="bal-amount" required hint={`số dư hiện tại ${formatMoney(target.balance)}`}>
                Số tiền
              </Label>
              <Input
                id="bal-amount"
                type="number"
                step={10000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <FieldMessage tone="default">
                Sau khi áp dụng: {formatMoney(target.balance + Math.round(Number(amount) || 0))}
              </FieldMessage>
            </div>

            <div>
              <Label htmlFor="bal-note" hint="khách cũng đọc được">
                Lý do
              </Label>
              <Input
                id="bal-note"
                value={note}
                maxLength={200}
                placeholder="Ví dụ: bù đơn chạy thiếu"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setTarget(null)}>
                Đóng
              </Button>
              <Button loading={busy} onClick={apDung}>
                Áp dụng
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
