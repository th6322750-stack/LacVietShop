"use client";

import * as React from "react";
import { IconCoins, IconEye, IconFileExport, IconLock, IconUsers, IconWallet } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { memberLevels, txTypeLabels, type AdminUser, type MemberLevel } from "@/lib/admin/data";
import { useAdminStore } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDate, formatDateTime, formatMoney, formatNumber, initialsOf } from "@/lib/utils";

export function AdminUsersView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const { users, orders, transactions, adjustBalance, setUserLevel, toggleUserLock } = useAdminStore();

  const [search, setSearch] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [txUser, setTxUser] = React.useState<number | null>(null);
  const [balanceUser, setBalanceUser] = React.useState<AdminUser | null>(null);
  const [confirmLock, setConfirmLock] = React.useState<AdminUser | null>(null);
  const [amount, setAmount] = React.useState("100000");
  const [note, setNote] = React.useState("Admin cộng tiền");

  const stats = React.useMemo(() => {
    const map = new Map<number, { orders: number; spent: number }>();
    for (const o of orders) {
      const row = map.get(o.userId) ?? { orders: 0, spent: 0 };
      row.orders += 1;
      if (o.status !== "refunded" && o.status !== "canceled") row.spent += o.amount;
      map.set(o.userId, row);
    }
    return map;
  }, [orders]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (level && u.level !== level) return false;
      if (status && u.status !== status) return false;
      if (q && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, level, status]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 12);

  const txRows = React.useMemo(
    () => (txUser ? transactions.filter((t) => t.userId === txUser) : transactions).slice(0, 60),
    [transactions, txUser],
  );

  function applyBalance() {
    if (!balanceUser) return;
    const value = Number(amount);
    if (!value) {
      toast.push({ tone: "warning", title: "Số tiền phải khác 0" });
      return;
    }
    adjustBalance(balanceUser.id, value, note.trim() || (value > 0 ? "Admin cộng tiền" : "Admin trừ tiền"));
    toast.push({
      tone: "success",
      title: `${value > 0 ? "Đã cộng" : "Đã trừ"} ${formatMoney(Math.abs(value))}`,
      description: balanceUser.name,
    });
    setBalanceUser(null);
  }

  function exportCsv() {
    const rows: unknown[][] = [["ID", "Họ tên", "Email", "Điện thoại", "Cấp bậc", "Số dư", "Số đơn", "Đã chi", "Trạng thái", "Ngày tạo"]];
    for (const u of filtered) {
      const s = stats.get(u.id) ?? { orders: 0, spent: 0 };
      rows.push([u.id, u.name, u.email, u.phone, u.level, u.balance, s.orders, s.spent, u.status === "locked" ? "khoá" : "hoạt động", u.createdAt]);
    }
    const file = downloadCsv("nguoi-dung", rows);
    toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng`, description: file });
  }

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "Người dùng",
      cell: (u) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lv-gold-100 text-small-strong text-lv-gold-700">
            {initialsOf(u.name)}
          </span>
          <div className="min-w-0 max-w-[190px]">
            <p className="flex items-center gap-1.5 truncate text-body-strong text-lv-text">
              {u.name}
              {u.status === "locked" ? <Badge tone="danger">khoá</Badge> : null}
            </p>
            <p className="truncate text-small text-lv-muted">{u.email}</p>
            <p className="truncate text-small text-lv-muted">{u.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Cấp bậc",
      cell: (u) =>
        can("users.level") ? (
          <Select
            aria-label={`Cấp bậc của ${u.name}`}
            value={u.level}
            onChange={(e) => {
              setUserLevel(u.id, e.target.value as MemberLevel);
              toast.push({ tone: "success", title: `Đã đổi cấp bậc ${u.name}` });
            }}
            className="h-8 min-w-[130px] text-small"
          >
            {memberLevels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        ) : (
          <Badge tone="neutral">{u.level}</Badge>
        ),
    },
    {
      key: "balance",
      header: "Số dư",
      align: "right",
      cell: (u) => <span className="lv-price text-body-strong text-lv-success">{formatMoney(u.balance)}</span>,
    },
    {
      key: "orders",
      header: "Đơn / Đã chi",
      align: "right",
      cell: (u) => {
        const s = stats.get(u.id) ?? { orders: 0, spent: 0 };
        return (
          <span className="text-small text-lv-navy-700">
            {formatNumber(s.orders)} đơn
            <span className="lv-price block text-small text-lv-muted">{formatMoney(s.spent)}</span>
          </span>
        );
      },
    },
    { key: "created", header: "Tham gia", align: "right", cell: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (u) => (
        <div className="flex items-center justify-end gap-1">
          {can("users.balance") ? (
            <Button variant="secondary" size="sm" aria-label={`Cộng trừ tiền ${u.name}`} onClick={() => setBalanceUser(u)}>
              <IconWallet size={15} />
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Xem giao dịch ${u.name}`}
            onClick={() => setTxUser((prev) => (prev === u.id ? null : u.id))}
          >
            <IconEye size={15} />
          </Button>
          {can("users.lock") ? (
            <Button variant="danger" size="sm" aria-label={`Khoá mở ${u.name}`} onClick={() => setConfirmLock(u)}>
              <IconLock size={15} />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Người dùng & giao dịch" description="Số dư, cấp bậc và dòng tiền của khách hàng." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Người dùng khớp lọc" value={`${filtered.length} / ${users.length}`} tone="gold" icon={<IconUsers size={20} />} />
        <StatCard label="Tổng số dư" value={formatMoney(users.reduce((s, u) => s + u.balance, 0))} tone="success" icon={<IconWallet size={20} />} />
        <StatCard
          label="Tổng nạp"
          value={formatMoney(transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0))}
          tone="info"
          icon={<IconCoins size={20} />}
        />
        <StatCard label="Đang khoá" value={formatNumber(users.filter((u) => u.status === "locked").length)} suffix="tài khoản" tone="danger" icon={<IconLock size={20} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard
          title="Danh sách người dùng"
          description={`${filtered.length} người`}
          className="min-w-0 xl:col-span-8"
          action={
            can("export.csv") ? (
              <Button variant="secondary" size="sm" icon={<IconFileExport size={16} />} onClick={exportCsv}>
                Xuất CSV
              </Button>
            ) : null
          }
          padded={false}
        >
          <div className="px-5 py-4">
            <FilterBar search={search} onSearch={setSearch} placeholder="Tên, email, số điện thoại…">
              <Select aria-label="Cấp bậc" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Tất cả cấp bậc</option>
                {memberLevels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
              <Select aria-label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đang khoá</option>
              </Select>
            </FilterBar>
          </div>
          <DataTable
            caption="Danh sách người dùng"
            columns={columns}
            rows={slice}
            rowKey={(u) => String(u.id)}
            emptyTitle="Không có người dùng nào khớp bộ lọc"
          />
          <div className="border-t border-lv-border px-5 py-3">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        </SectionCard>

        <SectionCard
          title="Giao dịch gần đây"
          description={txUser ? users.find((u) => u.id === txUser)?.name : "Toàn hệ thống"}
          className="min-w-0 xl:col-span-4"
          action={
            txUser ? (
              <Button variant="ghost" size="sm" onClick={() => setTxUser(null)}>
                Bỏ lọc
              </Button>
            ) : null
          }
          padded={false}
        >
          <ul className="max-h-[560px] divide-y divide-lv-border overflow-y-auto">
            {txRows.map((t) => {
              const who = users.find((u) => u.id === t.userId);
              return (
                <li key={t.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={t.type === "deposit" || t.type === "commission" ? "success" : t.type === "refund" ? "warning" : t.type === "withdraw" ? "danger" : "neutral"}>
                        {txTypeLabels[t.type]}
                      </Badge>
                      <span className="text-small text-lv-muted">{formatDateTime(t.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-small text-lv-navy-700">{t.note}</p>
                    {!txUser ? <p className="truncate text-small text-lv-muted">{who?.name}</p> : null}
                  </div>
                  <span className={`lv-price shrink-0 text-body-strong ${t.amount >= 0 ? "text-lv-success" : "text-lv-danger"}`}>
                    {t.amount >= 0 ? "+" : "−"} {formatMoney(Math.abs(t.amount))}
                  </span>
                </li>
              );
            })}
            {txRows.length === 0 ? <li className="px-5 py-8 text-center text-small text-lv-muted">Chưa có giao dịch nào</li> : null}
          </ul>
        </SectionCard>
      </div>

      <Modal
        open={!!balanceUser}
        onClose={() => setBalanceUser(null)}
        title="Điều chỉnh số dư"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBalanceUser(null)}>
              Huỷ
            </Button>
            <Button onClick={applyBalance} data-autofocus>
              Áp dụng
            </Button>
          </>
        }
      >
        {balanceUser ? (
          <div className="space-y-4">
            <div className="rounded-card border border-lv-border-gold bg-lv-gold-50 p-3">
              <p className="text-body-strong text-lv-text">{balanceUser.name}</p>
              <p className="text-small text-lv-muted">{balanceUser.email}</p>
              <p className="lv-price mt-1 text-body-strong text-lv-gold-700">
                Số dư hiện tại: {formatMoney(balanceUser.balance)}
              </p>
            </div>
            <div>
              <Label htmlFor="bal-amount" required hint="số âm để trừ">
                Số tiền
              </Label>
              <Input id="bal-amount" type="number" step={10_000} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bal-note">Ghi chú</Label>
              <Input id="bal-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!confirmLock}
        onClose={() => setConfirmLock(null)}
        onConfirm={() => {
          if (!confirmLock) return;
          toggleUserLock(confirmLock.id);
          toast.push({
            tone: confirmLock.status === "locked" ? "success" : "warning",
            title: confirmLock.status === "locked" ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản",
            description: confirmLock.name,
          });
          setConfirmLock(null);
        }}
        title={confirmLock ? `${confirmLock.status === "locked" ? "Mở khoá" : "Khoá"} ${confirmLock.name}?` : ""}
        message={
          confirmLock?.status === "locked"
            ? "Tài khoản sẽ đăng nhập và đặt đơn lại được."
            : "Tài khoản sẽ không đặt được đơn mới cho tới khi mở khoá."
        }
        confirmLabel={confirmLock?.status === "locked" ? "Mở khoá" : "Khoá"}
        tone={confirmLock?.status === "locked" ? "primary" : "danger"}
      />
    </div>
  );
}
