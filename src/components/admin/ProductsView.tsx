"use client";

import * as React from "react";
import Link from "next/link";
import { IconCoins, IconEdit, IconFileExport, IconPackage, IconPhoto, IconPlus, IconShoppingCart, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar } from "@/components/blocks/DataTable";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Switch } from "@/components/ui/Field";
import { ConfirmDialog, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import type { AdminProduct } from "@/lib/admin/data";
import { useAdminStore } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { downloadCsv } from "@/lib/admin/csv";
import { formatBytes, readProductImage } from "@/lib/admin/image";
import { formatMoney, formatNumber } from "@/lib/utils";

export function AdminProductsView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const { products, updateProduct, deleteProduct, addProduct } = useAdminStore();

  const [search, setSearch] = React.useState("");
  const [state, setState] = React.useState("");
  const [editing, setEditing] = React.useState<AdminProduct | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<AdminProduct | null>(null);
  const [draft, setDraft] = React.useState({ name: "", category: "AI", price: "0", stock: "0", imageSrc: "" });
  const [imageNote, setImageNote] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const categories = React.useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (state === "on" && !p.active) return false;
      if (state === "off" && p.active) return false;
      if (state === "empty" && p.stock > 0) return false;
      if (q && !`${p.name} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, state]);

  const totals = React.useMemo(
    () => ({
      active: products.filter((p) => p.active).length,
      stock: products.reduce((s, p) => s + p.stock, 0),
      sold: products.reduce((s, p) => s + p.sold, 0),
      revenue: products.reduce((s, p) => s + p.sold * p.price, 0),
    }),
    [products],
  );

  function openEdit(product: AdminProduct) {
    setCreating(false);
    setEditing(product);
    setDraft({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      imageSrc: product.imageSrc ?? "",
    });
    setImageNote(null);
  }

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setDraft({ name: "", category: categories[0] ?? "AI", price: "0", stock: "0", imageSrc: "" });
    setImageNote(null);
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  function save() {
    const price = Number(draft.price) || 0;
    const stock = Number(draft.stock) || 0;

    if (creating) {
      if (!draft.name.trim()) {
        toast.push({ tone: "warning", title: "Chưa nhập tên sản phẩm" });
        return;
      }
      addProduct({
        name: draft.name.trim(),
        category: draft.category,
        price,
        stock,
        imageSrc: draft.imageSrc.trim() || undefined,
      });
      toast.push({
        tone: "success",
        title: `Đã thêm ${draft.name.trim()}`,
        description: draft.imageSrc.trim()
          ? "Sản phẩm mới chưa có trang chi tiết bên khách hàng."
          : "Sản phẩm mới chưa có trang chi tiết và chưa có ảnh.",
      });
      closeModal();
      return;
    }

    if (!editing) return;
    updateProduct(editing.slug, {
      name: draft.name.trim() || editing.name,
      category: draft.category,
      price,
      stock,
      imageSrc: draft.imageSrc.trim() || undefined,
    });
    toast.push({ tone: "success", title: `Đã lưu ${editing.name}` });
    closeModal();
  }

  async function pickImage(file: File | undefined) {
    if (!file) return;
    setImageNote("Đang xử lý ảnh…");
    const result = await readProductImage(file);
    if (!result.ok) {
      setImageNote(null);
      toast.push({ tone: "error", title: "Không dùng được ảnh này", description: result.error });
      return;
    }
    setDraft((d) => ({ ...d, imageSrc: result.dataUrl }));
    setImageNote(`Đã thu nhỏ về tối đa 256px · ${formatBytes(result.bytes)}`);
  }

  function exportCsv() {
    const rows: unknown[][] = [["Slug", "Tên sản phẩm", "Danh mục", "Giá", "Tồn kho", "Đã bán", "Doanh thu", "Đang bán"]];
    for (const p of filtered) {
      rows.push([p.slug, p.name, p.category, p.price, p.stock, p.sold, p.sold * p.price, p.active ? "có" : "không"]);
    }
    const file = downloadCsv("san-pham-premium", rows);
    toast.push({ tone: "success", title: `Đã xuất ${filtered.length} dòng`, description: file });
  }

  const columns: Column<AdminProduct>[] = [
    {
      key: "product",
      header: "Sản phẩm",
      cell: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          {p.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageSrc} alt={p.name} className="h-10 w-10 shrink-0 rounded-control object-cover" />
          ) : (
            <AssetImage assetKey={p.assetKey} label={p.name} className="h-10 w-10 shrink-0" rounded="control" />
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-body-strong text-lv-text">
              {p.name}
              {p.stock === 0 ? <Badge tone="danger">hết hàng</Badge> : null}
            </p>
            <p className="truncate text-small text-lv-muted">
              {p.category}
              {p.hasPage ? (
                <>
                  {" · "}
                  <Link href={`/products/${p.slug}`} target="_blank" className="hover:text-lv-gold-700">
                    xem trang
                  </Link>
                </>
              ) : (
                " · chưa có trang"
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá",
      align: "right",
      cell: (p) => <span className="lv-price text-body-strong text-lv-success">{formatMoney(p.price)}</span>,
    },
    { key: "stock", header: "Tồn kho", align: "right", cell: (p) => formatNumber(p.stock) },
    { key: "sold", header: "Đã bán", align: "right", cell: (p) => formatNumber(p.sold) },
    {
      key: "revenue",
      header: "Doanh thu",
      align: "right",
      cell: (p) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(p.sold * p.price)}</span>,
    },
    {
      key: "active",
      header: "Bán",
      align: "center",
      cell: (p) => (
        <div className="flex justify-center">
          <Switch
            id={`prd-${p.slug}`}
            checked={p.active}
            disabled={!can("products.edit")}
            onCheckedChange={(next) => {
              updateProduct(p.slug, { active: next });
              toast.push({ tone: next ? "success" : "warning", title: next ? `Đã mở bán ${p.name}` : `Đã ngừng bán ${p.name}` });
            }}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          {can("products.edit") ? (
            <Button variant="secondary" size="sm" aria-label={`Sửa ${p.name}`} onClick={() => openEdit(p)}>
              <IconEdit size={15} />
            </Button>
          ) : null}
          {can("products.delete") ? (
            <Button variant="danger" size="sm" aria-label={`Xoá ${p.name}`} onClick={() => setConfirmDelete(p)}>
              <IconTrash size={15} />
            </Button>
          ) : null}
          {!can("products.edit") && !can("products.delete") ? (
            <span className="text-small text-lv-muted">chỉ xem</span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Sản phẩm premium" description="Giá bán, tồn kho và trạng thái mở bán của 8 sản phẩm." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Đang mở bán" value={`${totals.active} / ${products.length}`} tone="gold" icon={<IconPackage size={20} />} />
        <StatCard label="Tổng tồn kho" value={formatNumber(totals.stock)} suffix="tài khoản" tone="navy" icon={<IconPackage size={20} />} />
        <StatCard label="Đã bán" value={formatNumber(totals.sold)} suffix="lượt" tone="success" icon={<IconShoppingCart size={20} />} />
        <StatCard label="Doanh thu sản phẩm" value={formatMoney(totals.revenue)} tone="info" icon={<IconCoins size={20} />} />
      </div>

      <SectionCard
        title="Danh sách sản phẩm"
        description={`${filtered.length} sản phẩm`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {can("export.csv") ? (
              <Button variant="secondary" size="sm" icon={<IconFileExport size={16} />} onClick={exportCsv}>
                Xuất CSV
              </Button>
            ) : null}
            {can("products.edit") ? (
              <Button size="sm" icon={<IconPlus size={16} />} onClick={openCreate}>
                Thêm sản phẩm
              </Button>
            ) : null}
          </div>
        }
        padded={false}
      >
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tên sản phẩm…">
            <Select aria-label="Trạng thái" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="on">Đang bán</option>
              <option value="off">Đang tắt</option>
              <option value="empty">Hết hàng</option>
            </Select>
          </FilterBar>
        </div>
        <DataTable
          caption="Danh sách sản phẩm premium"
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.slug}
          emptyTitle="Không có sản phẩm nào khớp bộ lọc"
        />
      </SectionCard>

      <Modal
        open={!!editing || creating}
        onClose={closeModal}
        title={creating ? "Thêm sản phẩm" : editing ? `Sửa ${editing.name}` : ""}
        size="sm"
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="prd-name" required>
              Tên sản phẩm
            </Label>
            <Input
              id="prd-name"
              placeholder="Ví dụ: Spotify Premium"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="prd-category">Danh mục</Label>
            <Select id="prd-category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="prd-image-file">Ảnh sản phẩm</Label>
            <div className="flex items-start gap-3">
              {draft.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.imageSrc} alt="Xem trước ảnh sản phẩm" className="h-16 w-16 shrink-0 rounded-card border border-lv-border object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card border border-dashed border-lv-border-gold bg-lv-gold-50 text-lv-gold-700">
                  <IconPhoto size={20} />
                </span>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  ref={fileRef}
                  id="prd-image-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pickImage(e.target.files?.[0])}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" icon={<IconUpload size={15} />} onClick={() => fileRef.current?.click()}>
                    Chọn ảnh từ máy
                  </Button>
                  {draft.imageSrc ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<IconX size={15} />}
                      onClick={() => {
                        setDraft((d) => ({ ...d, imageSrc: "" }));
                        setImageNote(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      Bỏ ảnh
                    </Button>
                  ) : null}
                </div>
                <Input
                  aria-label="Đường dẫn ảnh"
                  placeholder="hoặc dán đường dẫn: /assets/products/ten.webp"
                  value={draft.imageSrc.startsWith("data:") ? "" : draft.imageSrc}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, imageSrc: e.target.value }));
                    setImageNote(null);
                  }}
                />
                <p className="text-small text-lv-muted">
                  {imageNote ?? "Ảnh được thu nhỏ về tối đa 256px và lưu trong trình duyệt."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="prd-price">Giá bán (₫)</Label>
            <Input id="prd-price" type="number" step={1000} value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="prd-stock">Tồn kho</Label>
            <Input id="prd-stock" type="number" value={draft.stock} onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))} />
          </div>
          <p className="text-small text-lv-muted">
            Giá ở đây là dữ liệu DEMO. Bảng giá production chưa được chốt (gap <code>catalog.pricing</code>).
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          deleteProduct(confirmDelete.slug);
          toast.push({ tone: "success", title: `Đã xoá ${confirmDelete.name}` });
          setConfirmDelete(null);
        }}
        title={confirmDelete ? `Xoá ${confirmDelete.name}?` : ""}
        message="Sản phẩm sẽ biến mất khỏi danh sách quản trị. Nạp lại dữ liệu gốc mới khôi phục được."
        confirmLabel="Xoá"
        tone="danger"
      />
    </div>
  );
}
