"use client";

import * as React from "react";
import {
  IconActivity,
  IconClockPause,
  IconPackage,
  IconRefresh,
  IconShoppingCart,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { SignInGate } from "@/components/blocks/SignInGate";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { useCustomerAuth } from "@/lib/customer/auth";
import { depositMethodLabel, useLedger } from "@/lib/customer/ledger";
import { formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Lịch sử hoạt động.
 *
 * Nhật ký dựng từ những việc hệ thống thật sự có ghi lại: mở tài khoản, lệnh
 * nạp tiền (kể cả lệnh còn chờ) và đơn mua premium. Trang này từng liệt kê cả
 * "đăng nhập thiết bị lạ", "bật 2FA"… trong khi hệ thống không hề lưu những sự
 * kiện đó — nhìn thì chuyên nghiệp nhưng là bịa, nên đã bỏ.
 */

type Kind = "order" | "payment" | "account";

interface Entry {
  id: string;
  kind: Kind;
  title: string;
  detail: string;
  status: "success" | "warning" | "info";
  at: string;
}

const kindLabels: Record<Kind, string> = {
  order: "Đơn hàng",
  payment: "Thanh toán",
  account: "Tài khoản",
};

const kindIcons: Record<Kind, React.ReactNode> = {
  order: <IconShoppingCart size={16} />,
  payment: <IconWallet size={16} />,
  account: <IconPackage size={16} />,
};

export function HistoryView() {
  const { session } = useCustomerAuth();
  const { ready, signedIn, loading, deposits, orders, reload } = useLedger();
  const [kind, setKind] = React.useState<Kind | "all">("all");
  const [search, setSearch] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const activity = React.useMemo<Entry[]>(() => {
    const out: Entry[] = [];

    for (const d of deposits) {
      out.push(
        d.status === "success"
          ? {
              id: `nap-${d.id}`,
              kind: "payment",
              title: "Nạp tiền thành công",
              detail: `${depositMethodLabel(d.method)} · ${formatMoney(d.amount)} · nội dung ${d.code}`,
              status: "success",
              at: d.paidAt ?? d.createdAt,
            }
          : {
              id: `nap-${d.id}`,
              kind: "payment",
              title: d.status === "pending" ? "Lệnh nạp đang chờ chuyển khoản" : "Lệnh nạp đã huỷ",
              detail: `${depositMethodLabel(d.method)} · ${formatMoney(d.amount)} · nội dung ${d.code}`,
              status: d.status === "pending" ? "info" : "warning",
              at: d.createdAt,
            },
      );
    }

    for (const o of orders) {
      out.push({
        id: `dat-${o.id}`,
        kind: "order",
        title: `Đặt mua ${o.productName}`,
        detail: `${o.packageName} · ${formatMoney(o.amount)}`,
        status: "success",
        at: o.createdAt,
      });
      if (o.status === "delivered" && o.deliveredAt) {
        out.push({
          id: `giao-${o.id}`,
          kind: "order",
          title: `Đã nhận ${o.productName}`,
          detail: o.note?.trim() || o.packageName,
          status: "success",
          at: o.deliveredAt,
        });
      }
      if (o.status === "canceled") {
        out.push({
          id: `huy-${o.id}`,
          kind: "order",
          title: `Huỷ đơn ${o.productName} và hoàn tiền`,
          detail: o.note?.trim() || formatMoney(o.amount),
          status: "warning",
          at: o.deliveredAt ?? o.createdAt,
        });
      }
    }

    if (session?.createdAt) {
      out.push({
        id: "mo-tai-khoan",
        kind: "account",
        title: "Mở tài khoản",
        detail: `@${session.username}`,
        status: "info",
        at: session.createdAt,
      });
    }

    return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  }, [deposits, orders, session]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return activity.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      const day = a.at.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (q && !`${a.title} ${a.detail}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activity, kind, search, from, to]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 10);

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { all: activity.length };
    for (const a of activity) base[a.kind] = (base[a.kind] ?? 0) + 1;
    return base;
  }, [activity]);

  const columns: Column<Entry>[] = [
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
        ) : (
          <Badge tone="info">Thông tin</Badge>
        ),
    },
    { key: "time", header: "Thời gian", align: "right", cell: (a) => formatDateTime(a.at) },
  ];

  if (ready && !signedIn) {
    return (
      <SignInGate
        title="Lịch sử hoạt động"
        description="Nạp tiền, đặt đơn và nhận hàng của tài khoản."
        next="/history"
        reason="Nhật ký gắn với tài khoản của bạn, đăng nhập để xem."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lịch sử hoạt động"
        description="Nạp tiền, đặt đơn và nhận hàng của tài khoản."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Lịch sử hoạt động" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={16} />} onClick={() => void reload()}>
            Làm mới
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng hoạt động"
          value={counts.all ?? 0}
          suffix="mục"
          tone="navy"
          icon={<IconActivity size={20} />}
        />
        <StatCard
          label="Đơn hàng"
          value={counts.order ?? 0}
          suffix="mục"
          tone="gold"
          icon={<IconShoppingCart size={20} />}
        />
        <StatCard
          label="Thanh toán"
          value={counts.payment ?? 0}
          suffix="mục"
          tone="success"
          icon={<IconWallet size={20} />}
        />
        <StatCard
          label="Lệnh nạp đang chờ"
          value={deposits.filter((d) => d.status === "pending").length}
          suffix="mục"
          tone="info"
          icon={<IconClockPause size={20} />}
        />
      </div>

      <Tabs
        ariaLabel="Nhóm hoạt động"
        value={kind}
        onChange={(id) => setKind(id as Kind | "all")}
        items={[
          { id: "all", label: "Tất cả", count: counts.all },
          ...(Object.keys(kindLabels) as Kind[]).map((k) => ({
            id: k,
            label: kindLabels[k],
            count: counts[k] ?? 0,
          })),
        ]}
      />

      <SectionCard
        title="Nhật ký"
        description={activity.length ? `${filtered.length} hoạt động khớp bộ lọc` : undefined}
        padded={false}
      >
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
          state={loading && activity.length === 0 ? "loading" : "ready"}
          emptyTitle={activity.length === 0 ? "Chưa có hoạt động nào" : "Không có hoạt động nào khớp bộ lọc"}
          emptyDescription={
            activity.length === 0
              ? "Nạp tiền hoặc mua hàng xong là hoạt động hiện ở đây."
              : "Thử mở rộng khoảng ngày hoặc chọn nhóm khác."
          }
        />
        {pageCount > 1 ? (
          <div className="border-t border-lv-border px-5 py-3">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
