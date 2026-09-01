"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconDatabase,
  IconEdit,
  IconPackageImport,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { FilterBar } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select, Switch, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession } from "@/lib/admin/session";
import { formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Kho hàng premium.
 *
 * Quản trị đặt ĐỊNH DẠNG cho từng gói (ví dụ Email | Mật khẩu | Hồ sơ), rồi nạp
 * hàng loạt — mỗi dòng một tài khoản, các cột ngăn bằng dấu "|". Khách mua là hệ
 * thống lấy một món ra giao ngay. Hết kho thì gói tự ngừng bán.
 */

interface Pkg {
  slug: string;
  productName: string;
  packageId: string;
  packageName: string;
  price: number;
  catalogPrice: number;
  stock: number | null;
  active: boolean;
  format: string[];
  available: number;
  highlight: boolean;
  badge: string | null;
  duration: string;
  bullets: string[];
  customized: boolean;
}

interface StockItem {
  id: string;
  key: string;
  fields: { label: string; value: string }[];
  status: "available" | "used";
  createdAt: string;
  usedAt?: string | null;
}

const keyOf = (p: Pkg) => `${p.slug}/${p.packageId}`;

export function AdminPremiumStockView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const editable = can("products.edit");

  const [packages, setPackages] = React.useState<Pkg[] | null>(null);
  const [failed, setFailed] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Pkg | null>(null);
  const [filling, setFilling] = React.useState<Pkg | null>(null);
  const [viewing, setViewing] = React.useState<Pkg | null>(null);
  /** Bấm Nạp khi gói chưa có định dạng: mở cấu hình trước, lưu xong nạp luôn. */
  const [fillSau, setFillSau] = React.useState(false);

  const load = React.useCallback(async () => {
    setFailed(null);
    const res = await fetch("/api/admin/product-settings")
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    if (!res.ok) {
      setFailed(String(res.error));
      setPackages([]);
      return;
    }
    setPackages(res.packages ?? []);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const all = React.useMemo(() => packages ?? [], [packages]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => `${p.productName} ${p.packageName}`.toLowerCase().includes(q));
  }, [all, search]);

  /** Gom theo sản phẩm — tên sản phẩm lặp ở từng dòng gói thì rất rối mắt. */
  const grouped = React.useMemo(() => {
    const map = new Map<string, { name: string; items: Pkg[] }>();
    for (const p of filtered) {
      const g = map.get(p.slug) ?? { name: p.productName, items: [] };
      g.items.push(p);
      map.set(p.slug, g);
    }
    return [...map.entries()].map(([slug, g]) => ({ slug, ...g }));
  }, [filtered]);

  const pileBased = all.filter((p) => p.format.length > 0);
  const outOfStock = pileBased.filter((p) => p.available === 0);
  const totalItems = all.reduce((s, p) => s + p.available, 0);

  async function saveSetting(body: Record<string, unknown>, done: string) {
    const res = await fetch("/api/admin/product-settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    if (!res.ok) {
      toast.push({ tone: "error", title: "Không lưu được", description: String(res.error) });
      return false;
    }
    setPackages(res.packages ?? []);
    toast.push({ tone: "success", title: done });
    return true;
  }


  return (
    <div className="space-y-5">
      {failed ? (
        <InfoCard title="Không đọc được kho hàng" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {failed} Đăng xuất rồi đăng nhập lại trang quản trị để cấp phiên mới.
        </InfoCard>
      ) : null}

      {outOfStock.length > 0 ? (
        <InfoCard title={`${outOfStock.length} gói đã hết hàng`} tone="warning" icon={<IconAlertTriangle size={16} />}>
          Các gói này đang không bán được: {outOfStock.map((p) => `${p.productName} · ${p.packageName}`).join(", ")}.
          Nạp thêm hàng để mở bán lại.
        </InfoCard>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gói hàng" value={String(all.length)} suffix="gói" tone="navy" icon={<IconDatabase size={18} />} />
        <StatCard
          label="Bán theo kho"
          value={String(pileBased.length)}
          suffix="gói"
          tone="info"
          icon={<IconPackageImport size={18} />}
          hint="đã đặt định dạng hàng"
        />
        <StatCard label="Hàng còn sẵn" value={String(totalItems)} suffix="món" tone="success" icon={<IconCheck size={18} />} />
        <StatCard
          label="Hết hàng"
          value={String(outOfStock.length)}
          suffix="gói"
          tone={outOfStock.length ? "danger" : "gold"}
          icon={<IconX size={18} />}
        />
      </div>

      <SectionCard
        title="Kho hàng premium"
        description="Đặt định dạng cho từng gói rồi nạp hàng. Khách mua là giao ngay, hết kho thì tự ngừng bán."
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void load()}>
            Làm mới
          </Button>
        }
      >
        <FilterBar search={search} onSearch={setSearch} placeholder="Tên sản phẩm hoặc gói…" />

        {packages === null ? (
          <span className="lv-skeleton mt-3 block h-40 w-full rounded-card" />
        ) : grouped.length === 0 ? (
          <p className="py-10 text-center text-small text-lv-muted">Không có gói nào khớp.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {grouped.map((g) => (
              <div key={g.slug} className="overflow-hidden rounded-card border border-lv-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border bg-lv-bg px-4 py-2.5">
                  <p className="text-body-strong text-lv-text">{g.name}</p>
                  <p className="text-small text-lv-muted">{g.items.length} gói</p>
                </div>
                <div className="divide-y divide-lv-border">
                  {g.items.map((p) => (
                    <PackageRow
                      key={keyOf(p)}
                      pkg={p}
                      editable={editable}
                      onFill={() => {
                        if (p.format.length) {
                          setFilling(p);
                        } else {
                          setFillSau(true);
                          setEditing(p);
                        }
                      }}
                      onView={() => setViewing(p)}
                      onEdit={() => setEditing(p)}
                      onToggle={(next) =>
                        void saveSetting(
                          {
                            slug: p.slug,
                            packageId: p.packageId,
                            price: p.price,
                            stock: p.stock,
                            active: next,
                            format: p.format,
                            highlight: p.highlight,
                            badge: p.badge,
                            name: p.packageName,
                            duration: p.duration,
                            bullets: p.bullets,
                          },
                          next ? "Đã mở bán" : "Đã ngừng bán",
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SettingModal
        pkg={editing}
        moTuNutNap={fillSau}
        onClose={() => {
          setEditing(null);
          setFillSau(false);
        }}
        onSave={async (body) => {
          const ok = await saveSetting(body, "Đã lưu cấu hình gói");
          if (!ok) return;
          const goi = editing;
          setEditing(null);
          if (!fillSau || !goi) return;
          setFillSau(false);
          const dinhDang = Array.isArray(body.format) ? (body.format as string[]) : [];
          // Có định dạng rồi thì mở luôn ô nạp hàng, khỏi bắt bấm lại từ đầu.
          if (dinhDang.length) setFilling({ ...goi, format: dinhDang });
        }}
      />

      <FillModal
        pkg={filling}
        onClose={() => setFilling(null)}
        onDone={async () => {
          await load();
          setFilling(null);
        }}
      />

      <StockListModal pkg={viewing} onClose={() => setViewing(null)} onChanged={load} />
    </div>
  );
}

/**
 * Một dòng gói trong nhóm sản phẩm.
 *
 * Cố ý không lặp lại tên sản phẩm và không in "không giới hạn" ở mọi dòng —
 * bảng cũ mỗi cột một câu giống hệt nhau, đọc rất mệt mà chẳng thêm thông tin gì.
 */
function PackageRow({
  pkg,
  editable,
  onFill,
  onView,
  onEdit,
  onToggle,
}: {
  pkg: Pkg;
  editable: boolean;
  onFill: () => void;
  onView: () => void;
  onEdit: () => void;
  onToggle: (next: boolean) => void;
}) {
  const pile = pkg.format.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-body-strong text-lv-text">
          {pkg.packageName}
          {pkg.highlight ? <Badge tone="gold">{pkg.badge || "Phổ biến"}</Badge> : null}
        </p>
        <p className="mt-0.5 text-small text-lv-muted">
          {pile ? pkg.format.join(" · ") : "Chưa đặt định dạng hàng — bấm Nạp để đặt"}
        </p>
      </div>

      <div className="w-[120px] text-right">
        <p className="lv-price text-body-strong text-lv-text">{formatMoney(pkg.price)}</p>
        {pkg.price !== pkg.catalogPrice ? (
          <p className="text-small text-lv-muted line-through">{formatMoney(pkg.catalogPrice)}</p>
        ) : null}
      </div>

      <div className="w-[110px] text-right">
        {pile ? (
          pkg.available > 0 ? (
            <span className="text-body-strong text-lv-success">{pkg.available} món</span>
          ) : (
            <Badge tone="danger">hết hàng</Badge>
          )
        ) : (
          <span className="text-small text-lv-muted">—</span>
        )}
      </div>

      <div className="flex w-[44px] justify-center">
        {editable ? (
          <Switch id={`pkg-${pkg.slug}-${pkg.packageId}`} checked={pkg.active} onCheckedChange={onToggle} />
        ) : pkg.active ? (
          <IconCheck size={16} className="text-lv-success" />
        ) : (
          <IconX size={16} className="text-lv-muted" />
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        {editable ? (
          <>
            <Button
              size="sm"
              variant={pile ? "secondary" : "ghost"}
              icon={<IconPackageImport size={15} />}
              onClick={onFill}
              title={pile ? undefined : "Gói này chưa có định dạng hàng — bấm để đặt rồi nạp"}
            >
              Nạp
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Xem kho"
              onClick={onView}
              disabled={!pile}
              title={pile ? "Xem kho" : "Chưa có kho vì gói chưa đặt định dạng"}
            >
              <IconDatabase size={15} />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Sửa cấu hình" onClick={onEdit}>
              <IconEdit size={15} />
            </Button>
          </>
        ) : (
          <span className="text-small text-lv-muted">chỉ xem</span>
        )}
      </div>
    </div>
  );
}

/** Đặt giá, định dạng hàng và giới hạn bán. */
function SettingModal({
  pkg,
  onClose,
  onSave,
  moTuNutNap = false,
}: {
  pkg: Pkg | null;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => void | Promise<void>;
  /** Mở vì bấm Nạp ở gói chưa có định dạng — cần nói rõ đang ở bước nào. */
  moTuNutNap?: boolean;
}) {
  const [price, setPrice] = React.useState("");
  const [format, setFormat] = React.useState<string[]>([]);
  const [stock, setStock] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [highlight, setHighlight] = React.useState(false);
  const [badge, setBadge] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!pkg) return;
    setPrice(String(pkg.price));
    setFormat(pkg.format.length ? [...pkg.format] : ["Email đăng nhập", "Mật khẩu"]);
    setStock(pkg.stock === null ? "" : String(pkg.stock));
    setActive(pkg.active);
    setHighlight(pkg.highlight);
    setBadge(pkg.badge ?? "");
  }, [pkg]);

  if (!pkg) return null;
  const clean = format.map((f) => f.trim()).filter(Boolean);

  return (
    <Modal open onClose={onClose} title="Cấu hình gói" description={`${pkg.productName} · ${pkg.packageName}`} size="md">
      <div className="space-y-4">
        {moTuNutNap ? (
          <InfoCard title="Đặt định dạng trước đã" tone="warning" icon={<IconAlertTriangle size={16} />}>
            Gói này chưa biết một món hàng gồm những gì nên chưa nạp được. Kiểm tra các cột bên dưới rồi bấm Lưu —
            hệ thống mở ngay ô nạp hàng.
          </InfoCard>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pkg-price" required hint={`catalog: ${formatMoney(pkg.catalogPrice)}`}>
              Giá bán
            </Label>
            <Input id="pkg-price" type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pkg-stock" hint="để trống là không giới hạn">
              Giới hạn bán tay
            </Label>
            <Input
              id="pkg-stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={clean.length > 0}
            />
            <FieldMessage tone="default">
              {clean.length > 0 ? "Gói này bán theo kho nên số lượng lấy từ kho hàng." : "Chỉ dùng khi giao tay."}
            </FieldMessage>
          </div>
        </div>

        <div>
          <Label>Định dạng một món hàng</Label>
          <p className="mb-2 text-small text-lv-muted">
            Mỗi dòng là một cột của món hàng, đúng thứ tự bạn sẽ nạp. Để trống hết nghĩa là gói này giao tay.
          </p>
          <div className="space-y-2">
            {format.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label={`Cột ${i + 1}`}
                  placeholder="Ví dụ: Email đăng nhập"
                  value={f}
                  onChange={(e) => setFormat(format.map((x, j) => (j === i ? e.target.value : x)))}
                />
                <Button
                  variant="ghost"
                  aria-label={`Xoá cột ${i + 1}`}
                  onClick={() => setFormat(format.filter((_, j) => j !== i))}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            icon={<IconPlus size={15} />}
            onClick={() => setFormat([...format, ""])}
            disabled={format.length >= 10}
          >
            Thêm cột
          </Button>
        </div>

        {clean.length > 0 ? (
          <div className="rounded-card border border-lv-border bg-lv-bg p-3">
            <p className="text-small text-lv-muted">Khi nạp kho, mỗi dòng sẽ có dạng:</p>
            <p className="lv-price mt-1 break-all text-body-strong text-lv-text">
              {clean.map((f) => f.toLowerCase().replace(/\s+/g, "-")).join(" | ")}
            </p>
          </div>
        ) : null}

        <Switch
          id="pkg-active"
          checked={active}
          onCheckedChange={setActive}
          label="Đang mở bán"
          description={active ? "Khách mua được gói này." : "Khách không thấy nút mua."}
        />

        <Switch
          id="pkg-highlight"
          checked={highlight}
          onCheckedChange={setHighlight}
          label="Gói phổ biến"
          description={
            highlight
              ? "Trang khách làm nổi gói này và chọn sẵn khi mở trang."
              : "Hiện như các gói khác."
          }
        />

        <div>
          <Label htmlFor="pkg-badge" hint="để trống là không hiện">
            Nhãn trên thẻ gói
          </Label>
          <Input
            id="pkg-badge"
            maxLength={30}
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Ví dụ: Bán chạy, Tiết kiệm 33%"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await onSave({
                slug: pkg.slug,
                packageId: pkg.packageId,
                price: Number(price) || 0,
                stock: clean.length > 0 ? null : stock === "" ? null : Number(stock),
                active,
                format: clean,
                highlight,
                badge: badge.trim() || null,
              });
              setBusy(false);
            }}
          >
            Lưu cấu hình
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Nạp hàng hàng loạt. */
function FillModal({ pkg, onClose, onDone }: { pkg: Pkg | null; onClose: () => void; onDone: () => void | Promise<void> }) {
  const toast = useToast();
  const [lines, setLines] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [skipped, setSkipped] = React.useState<string[]>([]);

  React.useEffect(() => {
    setLines("");
    setSkipped([]);
  }, [pkg]);

  if (!pkg) return null;
  const count = lines.split(/\r?\n/).filter((l) => l.trim()).length;

  return (
    <Modal open onClose={onClose} title="Nạp hàng vào kho" description={`${pkg.productName} · ${pkg.packageName}`} size="lg">
      <div className="space-y-4">
        <div className="rounded-card border border-lv-border bg-lv-bg p-3">
          <p className="text-small text-lv-muted">Định dạng của gói này — mỗi dòng nạp phải đúng thứ tự:</p>
          <p className="lv-price mt-1 break-all text-body-strong text-lv-text">{pkg.format.join(" | ")}</p>
          <p className="mt-2 text-small text-lv-muted">
            Ví dụ: <span className="lv-price">{pkg.format.map((_, i) => `giatri${i + 1}`).join(" | ")}</span>
          </p>
        </div>

        <div>
          <Label htmlFor="fill-lines" required hint={`${count} dòng`}>
            Danh sách hàng
          </Label>
          <Textarea
            id="fill-lines"
            rows={10}
            className="lv-price"
            value={lines}
            onChange={(e) => setLines(e.target.value)}
            placeholder={`${pkg.format.map((_, i) => `giatri${i + 1}`).join(" | ")}\n${pkg.format.map((_, i) => `giatri${i + 1}`).join(" | ")}`}
          />
          <FieldMessage tone="default">Mỗi dòng một tài khoản, các cột ngăn nhau bằng dấu gạch đứng.</FieldMessage>
        </div>

        {skipped.length > 0 ? (
          <InfoCard title={`${skipped.length} dòng bị bỏ qua`} tone="warning" icon={<IconAlertTriangle size={16} />}>
            Thiếu cột hoặc để trống nên không nạp — nạp vào rồi giao cho khách là hỏng. Các dòng đó:
            <span className="lv-price mt-1 block break-all">{skipped.slice(0, 5).join(" · ")}</span>
          </InfoCard>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
          <Button
            loading={busy}
            disabled={count === 0}
            icon={<IconPackageImport size={17} />}
            onClick={async () => {
              setBusy(true);
              const res = await fetch("/api/admin/product-stock", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ slug: pkg.slug, packageId: pkg.packageId, lines }),
              })
                .then((r) => r.json())
                .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
              setBusy(false);

              if (!res.ok) {
                toast.push({ tone: "error", title: "Không nạp được", description: String(res.error) });
                return;
              }
              setSkipped(res.skipped ?? []);
              toast.push({
                tone: res.added > 0 ? "success" : "warning",
                title: `Đã nạp ${res.added} món`,
                description: `Kho còn ${res.available} món dùng được.`,
              });
              if (res.added > 0) {
                setLines("");
                await onDone();
              }
            }}
          >
            Nạp {count} dòng
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Xem và dọn kho của một gói. */
function StockListModal({ pkg, onClose, onChanged }: { pkg: Pkg | null; onClose: () => void; onChanged: () => void | Promise<void> }) {
  const toast = useToast();
  const [items, setItems] = React.useState<StockItem[] | null>(null);
  const [filter, setFilter] = React.useState<"available" | "used" | "">("available");

  const load = React.useCallback(async () => {
    if (!pkg) return;
    const res = await fetch(`/api/admin/product-stock?key=${encodeURIComponent(keyOf(pkg))}`)
      .then((r) => r.json())
      .catch(() => null);
    setItems(res?.ok ? (res.items ?? []) : []);
  }, [pkg]);

  React.useEffect(() => {
    setItems(null);
    void load();
  }, [load]);

  if (!pkg) return null;
  const shown = (items ?? []).filter((i) => !filter || i.status === filter);

  return (
    <Modal open onClose={onClose} title="Kho hàng" description={`${pkg.productName} · ${pkg.packageName}`} size="lg">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[200px]">
            <Label htmlFor="stock-filter">Lọc</Label>
            <Select id="stock-filter" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="available">Còn dùng được</option>
              <option value="used">Đã giao</option>
              <option value="">Tất cả</option>
            </Select>
          </div>
          <p className="text-small text-lv-muted">{shown.length} món</p>
        </div>

        <div className="max-h-[26rem] space-y-2 overflow-y-auto">
          {items === null ? (
            <span className="lv-skeleton block h-20 w-full rounded-card" />
          ) : shown.length === 0 ? (
            <p className="py-6 text-center text-small text-lv-muted">Không có món nào.</p>
          ) : (
            shown.map((it) => (
              <div key={it.id} className="flex items-start justify-between gap-3 rounded-card border border-lv-border p-3">
                <div className="min-w-0">
                  <p className="lv-price break-all text-body text-lv-text">
                    {it.fields.map((f) => f.value).join(" | ")}
                  </p>
                  <p className="mt-1 text-small text-lv-muted">
                    {it.status === "used" ? `Đã giao ${it.usedAt ? formatDateTime(it.usedAt) : ""}` : `Nạp ${formatDateTime(it.createdAt)}`}
                  </p>
                </div>
                {it.status === "available" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Xoá món này"
                    onClick={async () => {
                      const res = await fetch(`/api/admin/product-stock?id=${it.id}`, { method: "DELETE" })
                        .then((r) => r.json())
                        .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
                      if (!res.ok) {
                        toast.push({ tone: "error", title: "Không xoá được", description: String(res.error) });
                        return;
                      }
                      toast.push({ tone: "success", title: "Đã xoá khỏi kho" });
                      await load();
                      await onChanged();
                    }}
                  >
                    <IconTrash size={15} className="text-lv-danger" />
                  </Button>
                ) : (
                  <Badge tone="neutral">đã giao</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
