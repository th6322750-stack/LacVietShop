"use client";

import * as React from "react";
import Link from "next/link";
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
import { IconCoins, IconRefresh, IconShoppingCart, IconWallet } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { ChartCard } from "@/components/blocks/Media";
import { StatusBadge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { orderStatusLabels } from "@/lib/admin/data";
import { revenueByDay, revenueOf, statusCounts, topServices, useAdminStore } from "@/lib/admin/store";
import { formatCompact, formatDateTime, formatMoney, formatNumber } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusColors: Record<OrderStatus, string> = {
  completed: "#16A34A",
  running: "#2563EB",
  processing: "#C97900",
  pending: "#D99A16",
  refunded: "#DC2626",
  canceled: "#667085",
};

export function AdminDashboardView() {
  const { orders, users } = useAdminStore();

  const kpi = React.useMemo(() => {
    const today = "2026-08-31";
    const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === today);
    return {
      revenue30: revenueOf(orders),
      ordersToday: todayOrders.length,
      running: orders.filter((o) => o.status === "running").length,
      balance: users.reduce((s, u) => s + u.balance, 0),
    };
  }, [orders, users]);

  const series = React.useMemo(() => revenueByDay(orders, 30), [orders]);
  const counts = React.useMemo(() => statusCounts(orders), [orders]);
  const top = React.useMemo(() => topServices(orders, 10), [orders]);
  const donut = (Object.keys(counts) as OrderStatus[]).map((k) => ({
    name: orderStatusLabels[k],
    value: counts[k] ?? 0,
    color: statusColors[k],
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Tổng quan doanh thu, đơn hàng và người dùng của hệ thống Lạc Việt."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu 30 ngày" value={formatMoney(kpi.revenue30)} tone="gold" icon={<IconCoins size={20} />} />
        <StatCard label="Đơn hôm nay" value={formatNumber(kpi.ordersToday)} suffix="đơn" tone="success" icon={<IconShoppingCart size={20} />} />
        <StatCard label="Đơn đang chạy" value={formatNumber(kpi.running)} suffix="đơn" tone="info" icon={<IconRefresh size={20} />} />
        <StatCard label="Tổng số dư người dùng" value={formatMoney(kpi.balance)} tone="navy" icon={<IconWallet size={20} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ChartCard title="Doanh thu 30 ngày" description="Doanh thu và số đơn theo ngày.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C97900" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#C97900" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} minTickGap={22} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#667085" }}
                  tickFormatter={(v: number) => formatCompact(v)}
                  width={58}
                />
                <RTooltip
                  formatter={(value: number, name) => [name === "revenue" ? formatMoney(value) : formatNumber(value), name === "revenue" ? "Doanh thu" : "Số đơn"]}
                  labelFormatter={(l) => `Ngày ${l}`}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6EAF0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C97900" strokeWidth={2} fill="url(#adminRevenue)" />
                <Area type="monotone" dataKey="orders" stroke="#0F1B3D" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <ChartCard title="Cơ cấu trạng thái đơn" description={`Tổng ${formatNumber(orders.length)} đơn.`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={2}>
                  {donut.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={52} wrapperStyle={{ fontSize: 12 }} />
                <RTooltip formatter={(v: number, n) => [`${formatNumber(v)} đơn`, n]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard
          title="Top 10 dịch vụ theo doanh thu"
          className="min-w-0 xl:col-span-7"
          padded={false}
        >
          <div className="lv-scroll-x">
            <table className="w-full min-w-[520px] border-collapse text-body">
              <caption className="sr-only">Top dịch vụ theo doanh thu</caption>
              <thead>
                <tr className="border-b border-lv-border text-left">
                  <th scope="col" className="px-5 py-2.5 text-label uppercase tracking-wide text-lv-muted">Dịch vụ</th>
                  <th scope="col" className="px-3 py-2.5 text-right text-label uppercase tracking-wide text-lv-muted">Đơn</th>
                  <th scope="col" className="px-5 py-2.5 text-right text-label uppercase tracking-wide text-lv-muted">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {top.map((row) => (
                  <tr key={`${row.platform}-${row.name}`} className="border-b border-lv-border last:border-0">
                    <td className="px-5 py-3">
                      <span className="block max-w-[320px] truncate text-body-strong text-lv-text">{row.name}</span>
                      <span className="text-small text-lv-muted">{row.platform}</span>
                    </td>
                    <td className="px-3 py-3 text-right">{formatNumber(row.orders)}</td>
                    <td className="lv-price px-5 py-3 text-right text-body-strong text-lv-success">
                      {formatMoney(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Đơn mới nhất"
          className="min-w-0 xl:col-span-5"
          action={
            <LinkButton href="/admin/orders" variant="secondary" size="sm">
              Xem tất cả
            </LinkButton>
          }
          padded={false}
        >
          <ul className="divide-y divide-lv-border">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link href={`/admin/orders?q=${o.id}`} className="text-body-strong text-lv-text hover:text-lv-gold-700">
                    #{o.id}
                  </Link>
                  <span className="block truncate text-small text-lv-muted">
                    {o.platformName} · {formatDateTime(o.createdAt)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={o.status} />
                  <span className="lv-price text-body-strong text-lv-text">{formatMoney(o.amount)}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
