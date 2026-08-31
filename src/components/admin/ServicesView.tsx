"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconArrowsHorizontal,
  IconCoins,
  IconEdit,
  IconHash,
  IconLayoutGrid,
  IconPercentage,
  IconRefresh,
  IconServer2,
  IconTrendingUp,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatNumber, formatUnitPrice } from "@/lib/utils";
import type { Platform } from "@/types";

/**
 * Bảng giá bán.
 *
 * Danh mục lấy từ API nhà cung cấp — đó là GIÁ VỐN. Giá bán do quản trị viên đặt,
 * lưu ở máy chủ (data/lacviet-pricing.json) nên khách ở mọi máy đều thấy như nhau.
 * Không sửa trực tiếp danh mục ở đây: nhà cung cấp đổi gì thì mình nhận nấy, phần
 * của mình chỉ là quy tắc giá.
 */

type PriceRule = { type: "percent"; value: number } | { type: "fixed"; value: number };

interface PricingRules {
  globalMarkup: number;
  overrides: Record<string, PriceRule>;
  updatedAt: string;
  updatedBy?: string;
}

/** Một dòng bảng giá = một máy chủ của nhà cung cấp. */
interface Row {
  key: string;
  apiServiceId: string;
  platform: string;
  platformAssetKey: string;
  category: string;
  fullName: string;
  cost: number;
  price: number;
  min: number;
  max: number;
  belowCost: boolean;
}

const pct = (v: number) => `${Math.round((v - 1) * 1000) / 10}%`;

export function AdminServicesView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const editable = can("services.edit");

  const [platforms, setPlatforms] = React.useState<Platform[] | null>(null);
  const [source, setSource] = React.useState<"api" | "fallback" | null>(null);
  const [rules, setRules] = React.useState<PricingRules | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState("");
  const [onlyCustom, setOnlyCustom] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [markupDraft, setMarkupDraft] = React.useState("");

  const load = React.useCallback(
    async (refresh: boolean, quiet = false) => {
      if (!quiet) setLoading(true);
      setFailed(null);
      try {
        const [cat, pr] = await Promise.all([
          fetch(`/api/thatim/catalog${refresh ? "?refresh=1" : ""}`).then((r) => r.json()),
          fetch("/api/admin/pricing").then((r) => r.json()),
        ]);
        setPlatforms(cat.platforms ?? []);
        setSource(cat.source ?? null);
        if (pr.ok) {
          setRules(pr.rules);
          setMarkupDraft(String(Math.round((pr.rules.globalMarkup - 1) * 1000) / 10));
        } else {
          setFailed(String(pr.error ?? "Không đọc được bảng giá."));
        }
        if (refresh) toast.push({ tone: "success", title: "Đã nạp lại từ nhà cung cấp" });
      } catch {
        setFailed("Không gọi được máy chủ.");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  React.useEffect(() => {
    void load(false);
  }, [load]);

  const rows = React.useMemo<Row[]>(() => {
    if (!platforms) return [];
    return platforms.flatMap((p) =>
      p.services.flatMap((svc) =>
        svc.servers.map((sv) => ({
          key: sv.id,
          apiServiceId: sv.apiServiceId ?? sv.code,
          platform: p.name,
          platformAssetKey: p.assetKey,
          category: svc.name,
          fullName: sv.fullName,
          cost: sv.costPerUnit,
          price: sv.pricePerUnit,
          min: sv.min,
          max: sv.max,
          belowCost: Boolean(sv.belowCost),
        })),
      ),
    );
  }, [platforms]);

  const platformNames = React.useMemo(() => [...new Set(rows.map((r) => r.platform))].sort(), [rows]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (platformFilter && r.platform !== platformFilter) return false;
      if (onlyCustom && !rules?.overrides[r.apiServiceId]) return false;
      if (q && !`${r.apiServiceId} ${r.platform} ${r.category} ${r.fullName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, platformFilter, onlyCustom, rules]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 15);

  const belowCostCount = rows.filter((r) => r.belowCost).length;
  const overrideCount = Object.keys(rules?.overrides ?? {}).length;
  const margin = React.useMemo(() => {
    const withCost = rows.filter((r) => r.cost > 0);
    if (!withCost.length) return 0;
    return withCost.reduce((s, r) => s + r.price, 0) / withCost.reduce((s, r) => s + r.cost, 0);
  }, [rows]);

  async function save(body: Record<string, unknown>, done: string) {
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));

    if (!res.ok) {
      toast.push({ tone: "error", title: "Không lưu được bảng giá", description: String(res.error) });
      return false;
    }
    setRules(res.rules);
    toast.push({ tone: "success", title: done });
    // Giá đổi thì danh mục phải nạp lại để bảng hiện số mới.
    await load(false, true);
    return true;
  }

  const columns: Column<Row>[] = [
    {
      key: "service",
      header: "Dịch vụ",
      cell: (r) => (
        <div className="flex min-w-0 items-start gap-2.5">
          <AssetImage assetKey={r.platformAssetKey} className="mt-0.5 h-9 w-9 shrink-0" rounded="control" />
          <div className="min-w-0 max-w-[420px] space-y-1">
            <p className="truncate text-body-strong text-lv-text">{r.category}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-small text-lv-muted">
              <span className="flex items-center gap-1">
                <IconLayoutGrid size={13} className="shrink-0" />
                {r.platform}
              </span>
              <span className="flex items-center gap-1">
                <IconHash size={13} className="shrink-0" />
                {r.apiServiceId}
              </span>
              <span className="flex items-center gap-1">
                <IconArrowsHorizontal size={13} className="shrink-0" />
                {formatNumber(r.min)} – {formatNumber(r.max)}
              </span>
            </p>
            <p className="flex items-start gap-1 text-small text-lv-muted" title={r.fullName}>
              <IconServer2 size={13} className="mt-0.5 shrink-0" />
              <span className="truncate">{r.fullName}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "cost",
      header: "Giá vốn",
      align: "right",
      cell: (r) => <span className="lv-price text-lv-muted">{formatUnitPrice(r.cost)}</span>,
    },
    {
      key: "price",
      header: "Giá bán",
      align: "right",
      cell: (r) => <span className="lv-price text-body-strong text-lv-success">{formatUnitPrice(r.price)}</span>,
    },
    {
      key: "margin",
      header: "Chênh lệch",
      align: "right",
      cell: (r) => {
        const rule = rules?.overrides[r.apiServiceId];
        const diff = r.cost > 0 ? r.price / r.cost : 1;
        return (
          <span className="flex flex-col items-end gap-0.5">
            <span className={r.belowCost ? "text-body-strong text-lv-danger" : "text-lv-navy-700"}>
              {r.belowCost ? "dưới vốn" : `+${pct(diff)}`}
            </span>
            {rule ? (
              <Badge tone="gold">{rule.type === "fixed" ? "giá cố định" : "riêng"}</Badge>
            ) : (
              <span className="text-small text-lv-muted">theo chung</span>
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (r) =>
        editable ? (
          <Button variant="ghost" size="sm" aria-label={`Sửa giá ${r.apiServiceId}`} onClick={() => setEditing(r)}>
            <IconEdit size={16} />
          </Button>
        ) : (
          <span className="text-small text-lv-muted">chỉ xem</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dịch vụ & bảng giá"
        description="Giá vốn lấy từ nhà cung cấp, giá bán do bạn đặt. Áp cho toàn hệ thống."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Dịch vụ & bảng giá" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void load(true)} loading={loading}>
            Nạp lại
          </Button>
        }
      />

      {failed ? (
        <InfoCard title="Không đọc được bảng giá" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {failed} Đăng xuất rồi đăng nhập lại trang quản trị để cấp phiên mới.
        </InfoCard>
      ) : null}

      {source === "fallback" ? (
        <InfoCard title="Đang dùng danh mục dự phòng" tone="warning" icon={<IconAlertTriangle size={16} />}>
          Chưa lấy được danh mục trực tiếp từ nhà cung cấp nên bảng dưới đây là bản chụp cũ. Sửa giá lúc này vẫn
          lưu được, nhưng nên nạp lại khi API thông trở lại.
        </InfoCard>
      ) : null}

      {belowCostCount > 0 ? (
        <InfoCard
          title={`${belowCostCount} dịch vụ đang bán dưới giá vốn`}
          tone="danger"
          icon={<IconAlertTriangle size={16} />}
        >
          Thường do đặt giá cố định rồi nhà cung cấp tăng giá vốn. Lọc “Chỉ giá đặt riêng” để soát lại.
        </InfoCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Dịch vụ"
          value={loading ? "…" : formatNumber(rows.length)}
          tone="navy"
          icon={<IconServer2 size={18} />}
          hint={`${platformNames.length} nền tảng`}
        />
        <StatCard
          label="Hệ số chung"
          value={rules ? `+${pct(rules.globalMarkup)}` : "…"}
          tone="gold"
          icon={<IconPercentage size={18} />}
          hint="áp cho dịch vụ chưa đặt riêng"
        />
        <StatCard
          label="Chênh lệch bình quân"
          value={margin ? `+${pct(margin)}` : "…"}
          tone="success"
          icon={<IconTrendingUp size={18} />}
          hint="giá bán so với giá vốn"
        />
        <StatCard
          label="Đặt giá riêng"
          value={formatNumber(overrideCount)}
          tone={belowCostCount ? "danger" : "info"}
          icon={<IconCoins size={18} />}
          hint={belowCostCount ? `${belowCostCount} dịch vụ dưới vốn` : "dịch vụ có quy tắc riêng"}
        />
      </div>

      <SectionCard
        title="Hệ số bán chung"
        description="Cộng thêm bao nhiêu phần trăm so với giá vốn, cho mọi dịch vụ chưa đặt giá riêng."
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[180px]">
            <Label htmlFor="markup" hint="phần trăm">
              Cộng thêm
            </Label>
            <Input
              id="markup"
              type="number"
              step="0.5"
              min={0}
              disabled={!editable}
              value={markupDraft}
              onChange={(e) => setMarkupDraft(e.target.value)}
            />
          </div>
          <Button
            disabled={!editable || markupDraft === "" || !rules}
            onClick={() => {
              const v = Number(markupDraft);
              if (!Number.isFinite(v) || v < 0) {
                toast.push({ tone: "warning", title: "Phần trăm không hợp lệ" });
                return;
              }
              void save({ globalMarkup: 1 + v / 100 }, `Đã đặt hệ số chung +${v}%`);
            }}
          >
            Lưu hệ số
          </Button>
          <p className="text-small text-lv-muted">
            Ví dụ giá vốn 2,3 đ → bán{" "}
            {formatUnitPrice(Math.round(2.3 * (1 + (Number(markupDraft) || 0) / 100) * 1e5) / 1e5)}
          </p>
        </div>
        {rules?.updatedBy ? (
          <p className="mt-3 text-small text-lv-muted">
            Sửa lần cuối bởi {rules.updatedBy} · {new Date(rules.updatedAt).toLocaleString("vi-VN")}
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title="Bảng giá" description={`${filtered.length} dịch vụ`}>
        <FilterBar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Tên dịch vụ, máy chủ, mã…"
          right={
            can("export.csv") ? (
              <Button
                variant="secondary"
                onClick={() => {
                  downloadCsv("bang-gia", [
                    ["Mã dịch vụ", "Nền tảng", "Nhóm", "Máy chủ", "Giá vốn (đ)", "Giá bán (đ)", "MIN", "MAX"],
                    ...filtered.map((r) => [
                      r.apiServiceId,
                      r.platform,
                      r.category,
                      r.fullName,
                      r.cost,
                      r.price,
                      r.min,
                      r.max,
                    ]),
                  ]);
                  toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng` });
                }}
              >
                Xuất CSV
              </Button>
            ) : null
          }
        >
          <Select
            aria-label="Lọc theo nền tảng"
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả nền tảng</option>
            {platformNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Lọc theo quy tắc giá"
            value={onlyCustom ? "custom" : "all"}
            onChange={(e) => {
              setOnlyCustom(e.target.value === "custom");
              setPage(1);
            }}
          >
            <option value="all">Mọi mức giá</option>
            <option value="custom">Chỉ giá đặt riêng</option>
          </Select>
        </FilterBar>

        <DataTable
          caption="Bảng giá dịch vụ"
          columns={columns}
          rows={slice}
          rowKey={(r) => r.key}
          state={loading ? "loading" : "ready"}
          emptyTitle="Không có dịch vụ nào khớp"
        />
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onChange={setPage} />
      </SectionCard>

      <PriceModal
        row={editing}
        rule={editing ? rules?.overrides[editing.apiServiceId] : undefined}
        globalMarkup={rules?.globalMarkup ?? 1}
        onClose={() => setEditing(null)}
        onSave={async (id, rule) => {
          const ok = await save({ overrides: { [id]: rule } }, rule ? "Đã đặt giá riêng" : "Đã bỏ giá riêng");
          if (ok) setEditing(null);
        }}
      />
    </div>
  );
}

/** Hộp đặt giá cho một dịch vụ. */
function PriceModal({
  row,
  rule,
  globalMarkup,
  onClose,
  onSave,
}: {
  row: Row | null;
  rule?: PriceRule;
  globalMarkup: number;
  onClose: () => void;
  onSave: (id: string, rule: PriceRule | null) => void | Promise<void>;
}) {
  const [mode, setMode] = React.useState<"global" | "percent" | "fixed">("global");
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!row) return;
    if (rule?.type === "percent") {
      setMode("percent");
      setValue(String(Math.round((rule.value - 1) * 1000) / 10));
    } else if (rule?.type === "fixed") {
      setMode("fixed");
      setValue(String(rule.value));
    } else {
      setMode("global");
      setValue(String(Math.round((globalMarkup - 1) * 1000) / 10));
    }
  }, [row, rule, globalMarkup]);

  if (!row) return null;

  const num = Number(value);
  const preview =
    mode === "fixed"
      ? num
      : Math.round(row.cost * (1 + (mode === "global" ? (globalMarkup - 1) * 100 : num) / 100) * 1e5) / 1e5;
  const below = Number.isFinite(preview) && preview < row.cost;

  return (
    <Modal open onClose={onClose} title="Đặt giá bán" description={`${row.platform} · ${row.category}`} size="md">
      <div className="space-y-4">
        <div className="rounded-card border border-lv-border bg-lv-bg p-3">
          <p className="break-words text-small text-lv-muted">{row.fullName}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-small">
            <span className="flex items-center gap-1 text-lv-muted">
              <IconHash size={13} /> {row.apiServiceId}
            </span>
            <span>
              <span className="text-lv-muted">Giá vốn </span>
              <span className="lv-price text-body-strong text-lv-text">{formatUnitPrice(row.cost)}</span>
            </span>
          </p>
        </div>

        <div>
          <Label htmlFor="price-mode">Cách tính giá bán</Label>
          <Select id="price-mode" value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <option value="global">Theo hệ số chung (+{pct(globalMarkup)})</option>
            <option value="percent">Cộng phần trăm riêng</option>
            <option value="fixed">Đặt giá cố định</option>
          </Select>
        </div>

        {mode !== "global" ? (
          <div>
            <Label htmlFor="price-value" hint={mode === "fixed" ? "đồng / tương tác" : "phần trăm"}>
              {mode === "fixed" ? "Giá bán" : "Cộng thêm"}
            </Label>
            <Input
              id="price-value"
              type="number"
              step={mode === "fixed" ? "0.01" : "0.5"}
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              tone={below ? "invalid" : "default"}
            />
            {mode === "fixed" ? (
              <FieldMessage tone={below ? "invalid" : "default"}>
                {below
                  ? "Thấp hơn giá vốn — mỗi đơn bán ra là lỗ."
                  : "Giá cố định không tự tăng khi nhà cung cấp tăng giá vốn."}
              </FieldMessage>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-card border border-lv-border-gold bg-lv-gold-50 px-3 py-2">
          <p className="text-small text-lv-gold-700">Giá bán sau khi lưu</p>
          <p className="lv-price mt-0.5 text-h3 text-lv-gold-700">
            {Number.isFinite(preview) ? formatUnitPrice(preview) : "—"}
            <span className="ml-2 text-small font-normal text-lv-muted">
              {row.cost > 0 && Number.isFinite(preview)
                ? `(${below ? "dưới vốn" : `+${pct(preview / row.cost)}`})`
                : ""}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          {rule ? (
            <Button variant="secondary" onClick={() => void onSave(row.apiServiceId, null)}>
              Bỏ giá riêng
            </Button>
          ) : null}
          <Button
            disabled={mode !== "global" && (!Number.isFinite(num) || num < 0)}
            onClick={() =>
              void onSave(
                row.apiServiceId,
                mode === "global"
                  ? null
                  : mode === "fixed"
                    ? { type: "fixed", value: num }
                    : { type: "percent", value: 1 + num / 100 },
              )
            }
          >
            Lưu giá
          </Button>
        </div>
      </div>
    </Modal>
  );
}
