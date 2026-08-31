"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IconArrowDownRight, IconArrowUpRight, IconCoins, IconWallet } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { ChartCard } from "@/components/blocks/Media";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { account, balanceSeries, paymentMethods, spendingByCategory, transactions } from "@/lib/demo/data";
import { formatCompact, formatDateTime, formatMoney } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types";

const typeLabels: Record<TransactionType, string> = {
  deposit: "Nạp tiền",
  order: "Đặt đơn",
  refund: "Hoàn tiền",
  commission: "Hoa hồng",
  withdraw: "Rút tiền",
};

export function CashflowsView() {
  const [type, setType] = React.useState<TransactionType | "">("");
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type && t.type !== type) return false;
      if (q && !`${t.id} ${t.description} ${t.reference ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [type, search]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 8);

  const totals = React.useMemo(() => {
    const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const outcome = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, outcome };
  }, []);

  const columns: Column<Transaction>[] = [
    {
      key: "tx",
      header: "Giao dịch",
      cell: (t) => (
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate text-body-strong text-lv-text">{t.description}</p>
          <p className="text-small text-lv-muted">
            {t.id} · {t.reference}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại",
      cell: (t) => (
        <Badge
          tone={
            t.type === "deposit" || t.type === "commission"
              ? "success"
              : t.type === "refund"
                ? "warning"
                : t.type === "withdraw"
                  ? "danger"
                  : "neutral"
          }
        >
          {typeLabels[t.type]}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      align: "right",
      cell: (t) => (
        <span className={`lv-price text-body-strong ${t.amount >= 0 ? "text-lv-success" : "text-lv-danger"}`}>
          {t.amount >= 0 ? "+" : "-"} {formatMoney(Math.abs(t.amount))}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Số dư sau",
      align: "right",
      cell: (t) => <span className="lv-price text-lv-navy-700">{formatMoney(t.balanceAfter)}</span>,
    },
    { key: "time", header: "Thời gian", align: "right", cell: (t) => formatDateTime(t.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dòng tiền & Giao dịch"
        description="Theo dõi biến động số dư, cơ cấu chi tiêu và toàn bộ lịch sử giao dịch."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Dòng tiền & Giao dịch" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Số dư hiện tại" value={formatMoney(account.balance)} tone="gold" icon={<IconWallet size={20} />} />
        <StatCard label="Tổng tiền vào" value={formatMoney(totals.income)} tone="success" icon={<IconArrowDownRight size={20} />} />
        <StatCard label="Tổng tiền ra" value={formatMoney(totals.outcome)} tone="danger" icon={<IconArrowUpRight size={20} />} />
        <StatCard label="Tổng đã nạp" value={formatMoney(account.totalDeposited)} tone="navy" icon={<IconCoins size={20} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ChartCard title="Biến động số dư 30 ngày" description="Số dư cuối ngày và mức chi tiêu theo ngày.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C97900" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#C97900" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} minTickGap={24} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#667085" }}
                  tickFormatter={(v: number) => formatCompact(v)}
                  width={56}
                />
                <RTooltip
                  formatter={(value: number, name) => [formatMoney(value), name === "balance" ? "Số dư" : "Chi tiêu"]}
                  labelFormatter={(l) => `Ngày ${l}`}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6EAF0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="balance" stroke="#C97900" strokeWidth={2} fill="url(#balanceFill)" />
                <Area type="monotone" dataKey="spent" stroke="#0F1B3D" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <ChartCard title="Cơ cấu chi tiêu" description="Phân bổ theo nhóm dịch vụ.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendingByCategory} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={2}>
                  {spendingByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: 12 }} />
                <RTooltip formatter={(value: number, name) => [formatMoney(value), name]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <SectionCard title="Phương thức thanh toán đã dùng" description="Cổng nạp tiền khả dụng cho tài khoản của bạn.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.slice(0, 4).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-card border border-lv-border p-3">
              <AssetImage assetKey={m.assetKey} className="h-8 w-12" rounded="control" />
              <div className="min-w-0">
                <p className="truncate text-body-strong text-lv-text">{m.name}</p>
                <p className="text-small text-lv-muted">{m.processingTime}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Lịch sử giao dịch" description={`${filtered.length} giao dịch`} padded={false}>
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tìm theo mô tả, mã giao dịch…">
            <Select aria-label="Loại giao dịch" value={type} onChange={(e) => setType(e.target.value as TransactionType | "")}>
              <option value="">Tất cả loại</option>
              {Object.entries(typeLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>
        <DataTable
          caption="Lịch sử giao dịch tài khoản"
          columns={columns}
          rows={slice}
          emptyTitle="Không có giao dịch nào khớp bộ lọc"
        />
        <div className="border-t border-lv-border px-5 py-3">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </SectionCard>
    </div>
  );
}
