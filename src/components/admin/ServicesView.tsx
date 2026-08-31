"use client";

import * as React from "react";
import {
  IconArrowsHorizontal,
  IconCheck,
  IconCoins,
  IconEdit,
  IconFileExport,
  IconHash,
  IconLayoutGrid,
  IconPlus,
  IconServer2,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar, Pagination, usePagination } from "@/components/blocks/DataTable";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Switch } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { memberLevels, type AdminService } from "@/lib/admin/data";
import { platforms } from "@/lib/demo/catalog";
import { useAdminStore } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatNumber, formatUnitPrice } from "@/lib/utils";

export function AdminServicesView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const { services, updateService, deleteService, addService } = useAdminStore();

  const [search, setSearch] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [editing, setEditing] = React.useState<AdminService | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminService | null>(null);
  const [draft, setDraft] = React.useState({
    platformId: platforms[0].id,
    serviceName: "",
    serverName: "",
    prices: ["0", "0", "0", "0"],
    min: "100",
    max: "100000",
  });

  const platformNames = React.useMemo(() => [...new Set(services.map((s) => s.platformName))].sort(), [services]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      if (platform && s.platformName !== platform) return false;
      if (q && !`${s.serviceName} ${s.serverName} ${s.platformName} ${s.code}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [services, search, platform]);

  const { page, pageCount, slice, setPage, total, pageSize } = usePagination(filtered, 15);

  const medianPrice = React.useMemo(() => {
    if (filtered.length === 0) return 0;
    const sorted = [...filtered].map((s) => s.prices[0]).sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, [filtered]);

  function openEdit(service: AdminService) {
    setCreating(false);
    setEditing(service);
    setDraft({
      platformId: service.platformId,
      serviceName: service.serviceName,
      serverName: service.serverName,
      prices: service.prices.map((p) => String(p)),
      min: String(service.min),
      max: String(service.max),
    });
  }

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setDraft({
      platformId: platforms[0].id,
      serviceName: "",
      serverName: "",
      prices: ["1", "0.97", "0.94", "0.9"],
      min: "100",
      max: "100000",
    });
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  function save() {
    const prices = draft.prices.map((p) => Number(p) || 0) as [number, number, number, number];
    const min = Number(draft.min) || 1;
    const max = Number(draft.max) || 1;

    if (creating) {
      if (!draft.serviceName.trim()) {
        toast.push({ tone: "warning", title: "Chưa nhập tên dịch vụ" });
        return;
      }
      const platform = platforms.find((p) => p.id === draft.platformId) ?? platforms[0];
      addService({
        platformId: platform.id,
        platformName: platform.name,
        platformAssetKey: platform.assetKey,
        serviceName: draft.serviceName.trim(),
        serverName: draft.serverName.trim() || "Máy chủ 1",
        prices,
        min,
        max,
      });
      toast.push({ tone: "success", title: `Đã thêm dịch vụ ${draft.serviceName.trim()}` });
      closeModal();
      return;
    }

    if (!editing) return;
    updateService(editing.id, {
      serviceName: draft.serviceName.trim() || editing.serviceName,
      serverName: draft.serverName.trim() || editing.serverName,
      prices,
      min,
      max,
    });
    toast.push({ tone: "success", title: `Đã lưu dịch vụ ${editing.code}` });
    closeModal();
  }

  function exportCsv() {
    const rows: unknown[][] = [["Mã", "Nền tảng", "Dịch vụ", "Máy chủ", ...memberLevels, "MIN", "MAX", "Đang bật"]];
    for (const s of filtered) {
      rows.push([s.code, s.platformName, s.serviceName, s.serverName, ...s.prices, s.min, s.max, s.active ? "có" : "không"]);
    }
    const file = downloadCsv("bang-gia-dich-vu", rows);
    toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng`, description: file });
  }

  const columns: Column<AdminService>[] = [
    {
      key: "service",
      header: "Dịch vụ",
      cell: (s) => (
        <div className="flex min-w-0 items-start gap-2.5">
          <AssetImage assetKey={s.platformAssetKey} className="mt-0.5 h-9 w-9 shrink-0" rounded="control" />
          <div className="min-w-0 max-w-[420px] space-y-1">
            <p className="truncate text-body-strong text-lv-text">{s.serviceName}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-small text-lv-muted">
              <span className="flex items-center gap-1">
                <IconLayoutGrid size={13} className="shrink-0" />
                {s.platformName}
              </span>
              <span className="flex items-center gap-1">
                <IconHash size={13} className="shrink-0" />
                {s.code}
              </span>
              <span className="flex items-center gap-1">
                <IconArrowsHorizontal size={13} className="shrink-0" />
                {formatNumber(s.min)} – {formatNumber(s.max)}
              </span>
            </p>
            {/* Tên đầy đủ mới là chỗ phân biệt các máy chủ cùng nhóm dịch vụ. */}
            {s.serverFullName ? (
              <p className="flex items-start gap-1 text-small text-lv-muted" title={s.serverFullName}>
                <IconServer2 size={13} className="mt-0.5 shrink-0" />
                <span className="truncate">{s.serverFullName}</span>
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
    ...memberLevels.map((level, index) => ({
      key: `price-${index}`,
      header: level,
      align: "right" as const,
      cell: (s: AdminService) => (
        <span className={`lv-price ${index === 0 ? "text-body-strong text-lv-success" : "text-lv-navy-700"}`}>
          {formatUnitPrice(s.prices[index])}
        </span>
      ),
    })),
    {
      key: "active",
      header: "Bật",
      align: "center",
      cell: (s) =>
        can("services.edit") ? (
          <div className="flex justify-center">
            <Switch
              id={`svc-${s.id}`}
              checked={s.active}
              onCheckedChange={(next) => {
                updateService(s.id, { active: next });
                toast.push({ tone: next ? "success" : "warning", title: next ? `Đã bật ${s.code}` : `Đã tắt ${s.code}` });
              }}
            />
          </div>
        ) : s.active ? (
          <IconCheck size={16} className="mx-auto text-lv-success" />
        ) : (
          <IconX size={16} className="mx-auto text-lv-muted" />
        ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          {can("services.edit") ? (
            <Button variant="secondary" size="sm" aria-label={`Sửa ${s.code}`} onClick={() => openEdit(s)}>
              <IconEdit size={15} />
            </Button>
          ) : null}
          {can("services.delete") ? (
            <Button variant="danger" size="sm" aria-label={`Xoá ${s.code}`} onClick={() => setConfirmDelete(s)}>
              <IconTrash size={15} />
            </Button>
          ) : null}
          {!can("services.edit") && !can("services.delete") ? (
            <span className="text-small text-lv-muted">chỉ xem</span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dịch vụ & bảng giá"
        description="Giá tính trên một tương tác, theo bốn cấp bậc thành viên."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dịch vụ khớp lọc" value={formatNumber(filtered.length)} suffix={`/ ${services.length}`} tone="gold" icon={<IconLayoutGrid size={20} />} />
        <StatCard label="Nền tảng" value={platformNames.length} suffix="nền tảng" tone="navy" icon={<IconLayoutGrid size={20} />} />
        <StatCard label="Giá trung vị (Thành viên)" value={formatUnitPrice(medianPrice)} tone="info" icon={<IconCoins size={20} />} />
        <StatCard label="Đang tắt" value={formatNumber(services.filter((s) => !s.active).length)} suffix="dịch vụ" tone="danger" icon={<IconX size={20} />} />
      </div>

      <SectionCard
        title="Bảng giá"
        description={`${formatNumber(filtered.length)} dịch vụ`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {can("export.csv") ? (
              <Button variant="secondary" size="sm" icon={<IconFileExport size={16} />} onClick={exportCsv}>
                Xuất CSV
              </Button>
            ) : null}
            {can("services.edit") ? (
              <Button size="sm" icon={<IconPlus size={16} />} onClick={openCreate}>
                Thêm dịch vụ
              </Button>
            ) : null}
          </div>
        }
        padded={false}
      >
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tên dịch vụ, máy chủ, mã…">
            <Select aria-label="Nền tảng" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="">Tất cả nền tảng</option>
              {platformNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>
        <DataTable
          caption="Bảng giá dịch vụ theo cấp bậc"
          columns={columns}
          rows={slice}
          rowKey={(s) => s.id}
          emptyTitle="Không có dịch vụ nào khớp bộ lọc"
        />
        <div className="border-t border-lv-border px-5 py-3">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} total={total} pageSize={pageSize} />
        </div>
      </SectionCard>

      <Modal
        open={!!editing || creating}
        onClose={closeModal}
        title={creating ? "Thêm dịch vụ" : editing ? `Sửa dịch vụ ${editing.code}` : ""}
        description={!creating && editing ? `${editing.platformName} · ${editing.serviceName}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Huỷ
            </Button>
            <Button onClick={save} data-autofocus>
              {creating ? "Thêm" : "Lưu"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="svc-platform" required>
              Nền tảng
            </Label>
            <Select
              id="svc-platform"
              value={draft.platformId}
              disabled={!creating}
              onChange={(e) => setDraft((d) => ({ ...d, platformId: e.target.value }))}
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="svc-name" required>
              Tên dịch vụ
            </Label>
            <Input
              id="svc-name"
              placeholder="Ví dụ: Tăng lượt xem video"
              value={draft.serviceName}
              onChange={(e) => setDraft((d) => ({ ...d, serviceName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="svc-server">Tên máy chủ</Label>
            <Input
              id="svc-server"
              placeholder="Máy chủ 1 — Nguồn Việt"
              value={draft.serverName}
              onChange={(e) => setDraft((d) => ({ ...d, serverName: e.target.value }))}
            />
          </div>
          {memberLevels.map((level, index) => (
            <div key={level}>
              <Label htmlFor={`price-${index}`}>{level}</Label>
              <Input
                id={`price-${index}`}
                type="number"
                step="0.001"
                value={draft.prices[index]}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, prices: d.prices.map((p, i) => (i === index ? e.target.value : p)) }))
                }
              />
            </div>
          ))}
          <div>
            <Label htmlFor="svc-min">Số lượng tối thiểu</Label>
            <Input id="svc-min" type="number" value={draft.min} onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="svc-max">Số lượng tối đa</Label>
            <Input id="svc-max" type="number" value={draft.max} onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteService(confirmDelete.id);
          toast.push({ tone: "success", title: `Đã xoá dịch vụ ${confirmDelete.code}` });
          setConfirmDelete(null);
        }}
        title={confirmDelete ? `Xoá dịch vụ ${confirmDelete.code}?` : ""}
        message="Dịch vụ sẽ biến mất khỏi bảng giá. Nạp lại dữ liệu gốc mới khôi phục được."
        confirmLabel="Xoá"
        tone="danger"
      />
    </div>
  );
}
