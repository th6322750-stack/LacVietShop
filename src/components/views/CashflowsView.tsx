"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { IconArrowDownRight, IconArrowUpRight, IconCoins, IconWallet } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { SignInGate } from "@/components/blocks/SignInGate";
import { ChartCard } from "@/components/blocks/Media";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { paymentMethods } from "@/lib/demo/data";
import { depositMethodLabel, ledgerKindLabel, useLedger, type LedgerEntry } from "@/lib/customer/ledger";
import { formatCompact, formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Dòng tiền & Giao dịch.
 *
 * Mọi con số ở đây là tiền thật của tài khoản đang đăng nhập: lệnh nạp đã được
 * SePay xác nhận và các đơn premium đã mua. Không còn giao dịch dựng sẵn.
 *
 * "Số dư sau" được tính ngược từ số dư hiện tại: đi từ giao dịch mới nhất trở về
 * trước và gỡ dần từng khoản ra. Cách này luôn khớp với số dư thật, không cần
 * lưu thêm cột nào trong cơ sở dữ liệu.
 */

const kinds: LedgerEntry["kind"][] = ["deposit", "purchase", "refund"];

interface Row extends LedgerEntry {
  balanceAfter: number;
}

export function CashflowsView() {
  const { ready, signedIn, loading, balance, entries, deposits } = useLedger();
  const [kind, setKind] = React.useState<LedgerEntry["kind"] | "">("");
  const [search, setSearch] = React.useState("");

  // entries đã xếp mới nhất trước, nên cứ đi xuôi và gỡ dần khoản của chính nó ra.
  const rows = React.useMemo<Row[]>(() => {
    let running = balance;
    return entries.map((e) => {
      const row: Row = { ...e, balanceAfter: running };
      running -= e.amount * e.direction;
      return row;
    });
  }, [entries, balance]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) => {
      if (kind && t.kind !== kind) return false;
      if (q && !`${t.id} ${t.title} ${t.detail}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, kind, search]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 8);

  const totals = React.useMemo(() => {
    const income = entries.filter((e) => e.direction > 0).reduce((s, e) => s + e.amount, 0);
    const outcome = entries.filter((e) => e.direction < 0).reduce((s, e) => s + e.amount, 0);
    const deposited = entries.filter((e) => e.kind === "deposit").reduce((s, e) => s + e.amount, 0);
    return { income, outcome, deposited };
  }, [entries]);

  // Biểu đồ chỉ có nghĩa khi đã có vài giao dịch; một điểm thì vẽ ra cũng vô ích.
  const series = React.useMemo(
    () =>
      [...rows]
        .reverse()
        .map((r) => ({ day: r.at.slice(5, 10).split("-").reverse().join("/"), balance: r.balanceAfter })),
    [rows],
  );

  const pendingDeposits = deposits.filter((d) => d.status === "pending");

  const columns: Column<Row>[] = [
    {
      key: "tx",
      header: "Giao dịch",
      cell: (t) => (
        <div className="min-w-0 max-w-[320px]">
          <p className="truncate text-body-strong text-lv-text">{t.title}</p>
          <p className="truncate text-small text-lv-muted">{t.detail}</p>
        </div>
      ),
    },
    {
      key: "kind",
      header: "Loại",
      cell: (t) => (
        <Badge tone={t.kind === "deposit" ? "success" : t.kind === "refund" ? "warning" : "neutral"}>
          {ledgerKindLabel(t.kind)}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      align: "right",
      cell: (t) => (
        <span className={`lv-price text-body-strong ${t.direction > 0 ? "text-lv-success" : "text-lv-danger"}`}>
          {t.direction > 0 ? "+" : "-"} {formatMoney(t.amount)}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Số dư sau",
      align: "right",
      cell: (t) => <span className="lv-price text-lv-navy-700">{formatMoney(t.balanceAfter)}</span>,
    },
    { key: "time", header: "Thời gian", align: "right", cell: (t) => formatDateTime(t.at) },
  ];

  if (ready && !signedIn) {
    return (
      <SignInGate
        title="Dòng tiền & Giao dịch"
        description="Biến động số dư và toàn bộ lịch sử giao dịch."
        next="/cashflows"
        reason="Số dư và giao dịch gắn với tài khoản của bạn, đăng nhập để xem."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dòng tiền & Giao dịch"
        description="Biến động số dư và toàn bộ lịch sử giao dịch."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Dòng tiền & Giao dịch" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Số dư hiện tại" value={formatMoney(balance)} tone="gold" icon={<IconWallet size={20} />} />
        <StatCard
          label="Tổng tiền vào"
          value={formatMoney(totals.income)}
          tone="success"
          icon={<IconArrowDownRight size={20} />}
        />
        <StatCard
          label="Tổng tiền ra"
          value={formatMoney(totals.outcome)}
          tone="danger"
          icon={<IconArrowUpRight size={20} />}
        />
        <StatCard label="Tổng đã nạp" value={formatMoney(totals.deposited)} tone="navy" icon={<IconCoins size={20} />} />
      </div>

      {series.length >= 2 ? (
        <ChartCard title="Biến động số dư" description="Số dư sau mỗi giao dịch.">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C97900" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#C97900" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#667085" }}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#667085" }}
                tickFormatter={(v: number) => formatCompact(v)}
                width={56}
              />
              <RTooltip
                formatter={(value: number) => [formatMoney(value), "Số dư"]}
                labelFormatter={(l) => `Ngày ${l}`}
                contentStyle={{ borderRadius: 12, border: "1px solid #E6EAF0", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="balance" stroke="#C97900" strokeWidth={2} fill="url(#balanceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}

      {pendingDeposits.length > 0 ? (
        <SectionCard
          title="Lệnh nạp đang chờ"
          description="Tiền vào tài khoản ngay khi ngân hàng báo có; chưa tính vào số dư."
        >
          <div className="divide-y divide-lv-border">
            {pendingDeposits.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-body-strong text-lv-text">{formatMoney(d.amount)}</p>
                  <p className="text-small text-lv-muted">
                    {depositMethodLabel(d.method)} · nội dung {d.code}
                  </p>
                </div>
                <span className="text-small text-lv-muted">{formatDateTime(d.createdAt)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Phương thức nạp tiền" description="Cổng nạp tiền khả dụng cho tài khoản của bạn.">
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

      <SectionCard
        title="Lịch sử giao dịch"
        description={entries.length ? `${filtered.length} giao dịch` : undefined}
        padded={false}
      >
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tìm theo mô tả, mã giao dịch…">
            <Select
              aria-label="Loại giao dịch"
              value={kind}
              onChange={(e) => setKind(e.target.value as LedgerEntry["kind"] | "")}
            >
              <option value="">Tất cả loại</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {ledgerKindLabel(k)}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>
        <DataTable
          caption="Lịch sử giao dịch tài khoản"
          columns={columns}
          rows={slice}
          state={loading && entries.length === 0 ? "loading" : "ready"}
          emptyTitle={entries.length === 0 ? "Chưa có giao dịch nào" : "Không có giao dịch nào khớp bộ lọc"}
          emptyDescription={
            entries.length === 0 ? "Nạp tiền hoặc mua hàng xong là giao dịch hiện ở đây." : undefined
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
