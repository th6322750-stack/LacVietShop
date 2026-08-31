"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCoins,
  IconPlugConnected,
  IconRefresh,
  IconServer2,
  IconShieldLock,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatNumber, formatUnitPrice } from "@/lib/utils";
import type { Platform } from "@/types";

interface StatusPayload {
  ok: boolean;
  configured: boolean;
  endpoint: string;
  keyMasked: string;
  usdToVnd: number;
  markup: number;
  allowOrders: boolean;
  cacheSeconds: number;
  balance: number | null;
  balanceVnd: number | null;
  currency: string | null;
  error: string | null;
  catalog?: {
    source: "api" | "fallback";
    fetchedAt: string;
    platformCount: number;
    serviceCount: number;
    serverCount: number;
  };
}

interface CatalogPayload {
  source: "api" | "fallback";
  platforms: Platform[];
  fetchedAt: string;
  error?: string;
}

/** Một dòng phẳng của bảng dịch vụ lấy từ nhà cung cấp. */
interface Row {
  key: string;
  serviceId: string;
  platform: string;
  category: string;
  name: string;
  price: number;
  min: number;
  max: number;
}

export function AdminApiView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const [status, setStatus] = React.useState<StatusPayload | null>(null);
  const [catalog, setCatalog] = React.useState<CatalogPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [platformFilter, setPlatformFilter] = React.useState("");

  const load = React.useCallback(
    async (refresh: boolean) => {
      setLoading(true);
      setFailed(null);
      try {
        const q = refresh ? "?refresh=1" : "";
        const [s, c] = await Promise.all([
          fetch(`/api/thatim/status${q}`).then((r) => r.json()),
          fetch(`/api/thatim/catalog${q}`).then((r) => r.json()),
        ]);
        setStatus(s);
        setCatalog(c);
        if (refresh) toast.push({ tone: "success", title: "Đã nạp lại từ nhà cung cấp" });
      } catch {
        setFailed("Không gọi được máy chủ của chính mình. Kiểm tra lại tiến trình Next.js.");
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
    if (!catalog) return [];
    return catalog.platforms.flatMap((p) =>
      p.services.flatMap((svc) =>
        svc.servers.map((sv) => ({
          key: `${p.id}/${svc.id}/${sv.id}`,
          serviceId: sv.apiServiceId ?? sv.code,
          platform: p.name,
          category: svc.name,
          name: sv.fullName,
          price: sv.pricePerUnit,
          min: sv.min,
          max: sv.max,
        })),
      ),
    );
  }, [catalog]);

  const platformNames = React.useMemo(() => [...new Set(rows.map((r) => r.platform))].sort(), [rows]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (platformFilter && r.platform !== platformFilter) return false;
      if (q && !`${r.serviceId} ${r.platform} ${r.category} ${r.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, platformFilter]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 15);

  const columns: Column<Row>[] = [
    {
      key: "serviceId",
      header: "Mã dịch vụ",
      cell: (r) => <span className="lv-price text-body-strong text-lv-text">{r.serviceId}</span>,
    },
    { key: "platform", header: "Nền tảng", cell: (r) => <span className="text-body">{r.platform}</span> },
    {
      key: "name",
      header: "Dịch vụ / máy chủ",
      cell: (r) => (
        <div className="min-w-0 max-w-xl">
          <p className="text-small text-lv-muted">{r.category}</p>
          <p className="break-words text-body text-lv-text">{r.name}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Đơn giá",
      align: "right",
      cell: (r) => <span className="lv-price text-body-strong text-lv-gold-700">{formatUnitPrice(r.price)}</span>,
    },
    {
      key: "range",
      header: "MIN / MAX",
      align: "right",
      cell: (r) => (
        <span className="text-small text-lv-muted">
          {formatNumber(r.min)} / {formatNumber(r.max)}
        </span>
      ),
    },
  ];

  const connected = status?.ok && status.catalog?.source === "api";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kết nối API nhà cung cấp"
        description="Trạng thái đường truyền, số dư và toàn bộ bảng dịch vụ lấy trực tiếp từ nhà cung cấp."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Kết nối API" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void load(true)} loading={loading}>
            Nạp lại
          </Button>
        }
      />

      {failed ? (
        <InfoCard title="Không lấy được trạng thái" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {failed}
        </InfoCard>
      ) : null}

      {status && !status.configured ? (
        <InfoCard title="Chưa cấu hình khoá API" tone="warning" icon={<IconAlertTriangle size={16} />}>
          Thêm <code className="lv-price">THATIM_API_KEY</code> vào tệp <code className="lv-price">.env.local</code> rồi
          khởi động lại tiến trình. Trong lúc chờ, hệ thống chạy bằng bảng giá dự phòng.
        </InfoCard>
      ) : null}

      {status?.error ? (
        <InfoCard title="Nhà cung cấp báo lỗi" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {status.error}
        </InfoCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Khi chưa có kết quả thì phải nói là đang kiểm tra. Kết luận
            "chưa cấu hình" hay "đang tắt" lúc còn đang gọi là báo sai. */}
        <StatCard
          label="Trạng thái"
          value={
            !status
              ? "Đang kiểm tra…"
              : connected
                ? "Đang kết nối"
                : status.configured
                  ? "Lỗi kết nối"
                  : "Chưa cấu hình"
          }
          tone={!status ? "info" : connected ? "success" : "danger"}
          icon={connected ? <IconCircleCheck size={18} /> : <IconPlugConnected size={18} />}
          hint={status?.endpoint}
        />
        <StatCard
          label="Số dư nhà cung cấp"
          value={
            !status ? "…" : status.balance !== null && status.balance !== undefined ? `${status.balance} ${status.currency}` : "—"
          }
          tone="gold"
          icon={<IconCoins size={18} />}
          hint={status?.balanceVnd !== null && status?.balanceVnd !== undefined ? `≈ ${formatNumber(status.balanceVnd)} đ` : undefined}
        />
        <StatCard
          label="Dịch vụ lấy được"
          value={!status ? "…" : formatNumber(status.catalog?.serverCount ?? 0)}
          tone="navy"
          icon={<IconServer2 size={18} />}
          hint={status ? `${status.catalog?.platformCount ?? 0} nền tảng · ${status.catalog?.serviceCount ?? 0} nhóm` : undefined}
        />
        <StatCard
          label="Đẩy đơn thật"
          value={!status ? "…" : status.allowOrders ? "Đang bật" : "Đang tắt"}
          tone={!status ? "info" : status.allowOrders ? "success" : "info"}
          icon={<IconShieldLock size={18} />}
          hint={status ? (status.allowOrders ? "Đơn sẽ tiêu tiền thật" : "THATIM_ALLOW_ORDERS=true để bật") : undefined}
        />
      </div>

      <SectionCard title="Cấu hình đang áp dụng" description="Đọc từ biến môi trường phía máy chủ, không sửa được từ trình duyệt.">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ConfigItem label="Điểm cuối" value={status?.endpoint ?? "—"} />
          <ConfigItem label="Khoá API" value={status?.keyMasked ?? "—"} />
          <ConfigItem
            label="Tỷ giá quy đổi"
            value={status ? `1 USD = ${formatNumber(status.usdToVnd)} đ` : "—"}
          />
          <ConfigItem label="Hệ số bán ra" value={status ? `× ${status.markup}` : "—"} />
          <ConfigItem
            label="Nguồn danh mục"
            value={
              status?.catalog?.source === "api" ? "API nhà cung cấp" : status?.catalog ? "Bản dự phòng tĩnh" : "—"
            }
          />
          <ConfigItem
            label="Lấy lúc"
            value={status?.catalog ? new Date(status.catalog.fetchedAt).toLocaleString("vi-VN") : "—"}
          />
          <ConfigItem label="Nhớ tạm" value={status ? `${status.cacheSeconds} giây` : "—"} />
          <ConfigItem label="Số dòng bảng giá" value={formatNumber(rows.length)} />
        </dl>
      </SectionCard>

      <SectionCard
        title="Bảng dịch vụ nhà cung cấp"
        description="Mã dịch vụ ở cột đầu chính là tham số gửi kèm khi đẩy đơn."
      >
        <FilterBar
          right={
            can("export.csv") ? (
              <Button
                variant="secondary"
                onClick={() => {
                  downloadCsv("dich-vu-nha-cung-cap", [
                    ["Mã dịch vụ", "Nền tảng", "Nhóm dịch vụ", "Tên máy chủ", "Đơn giá (đ)", "MIN", "MAX"],
                    ...filtered.map((r) => [r.serviceId, r.platform, r.category, r.name, r.price, r.min, r.max]),
                  ]);
                  toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng` });
                }}
              >
                Xuất CSV
              </Button>
            ) : null
          }
        >
          <Input
            aria-label="Tìm dịch vụ"
            placeholder="Tìm theo mã, tên, nhóm dịch vụ…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
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
        </FilterBar>

        <DataTable
          caption="Bảng dịch vụ lấy từ API nhà cung cấp"
          columns={columns}
          rows={slice}
          rowKey={(r) => r.key}
          state={loading ? "loading" : "ready"}
          emptyTitle="Không có dịch vụ nào khớp"
        />
        <Pagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onChange={setPage} />
      </SectionCard>

      {catalog?.source === "fallback" ? (
        <InfoCard title="Đang hiển thị bảng dự phòng" tone="warning" icon={<IconAlertTriangle size={16} />}>
          Bảng trên dựng từ bản chụp trang nhà cung cấp, không phải dữ liệu sống. Sửa cấu hình rồi bấm “Nạp lại”.
        </InfoCard>
      ) : (
        <p className="flex items-center gap-2 text-small text-lv-muted">
          <Badge tone="success">Trực tiếp</Badge>
          Danh mục được nhớ tạm {status?.cacheSeconds ?? 0} giây; bấm “Nạp lại” để lấy ngay bản mới nhất.
        </p>
      )}
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-control border border-lv-border bg-lv-bg px-3 py-2">
      <dt className="text-small text-lv-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-body-strong text-lv-text">{value}</dd>
    </div>
  );
}
