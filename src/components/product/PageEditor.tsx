"use client";

import * as React from "react";
import { IconAlertTriangle, IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { InfoCard } from "@/components/blocks/Cards";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Switch, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { formatMoney } from "@/lib/utils";

/**
 * Chỉnh trang sản phẩm ngay tại chỗ.
 *
 * Quản trị viên đang đăng nhập mở trang sản phẩm sẽ thấy một thanh nổi ở góc.
 * Bấm vào là sửa được đúng những gì đang nhìn thấy: tiêu đề, mô tả, giá từng
 * gói, gói nào phổ biến. Không phải nhớ gói nào ở dòng nào trong bảng quản trị.
 *
 * Quyền do máy chủ quyết định (cookie httpOnly), phần này chỉ hiện/ẩn nút.
 */

export interface EditablePackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice: number | null;
  bullets: string[];
  highlight: boolean;
  badge: string | null;
  inStock: boolean;
  available: number;
  pileBased: boolean;
}

export interface PageContent {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  badges: string[];
  customized: boolean;
  packages: EditablePackage[];
}

export function useAdminEditor(slug: string) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [content, setContent] = React.useState<PageContent | null>(null);

  const loadContent = React.useCallback(async () => {
    const res = await fetch(`/api/products/content?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .catch(() => null);
    if (res?.ok) setContent(res.content);
  }, [slug]);

  React.useEffect(() => {
    void loadContent();
    // Máy chủ mới biết có phải quản trị hay không; trình duyệt chỉ hỏi.
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d?.admin)))
      .catch(() => undefined);
  }, [loadContent]);

  return { isAdmin, content, setContent, reload: loadContent };
}

/** Thanh nổi ở góc màn hình, chỉ quản trị viên thấy. */
export function EditorBar({
  content,
  onSaved,
}: {
  content: PageContent | null;
  onSaved: (next: PageContent) => void;
}) {
  const [open, setOpen] = React.useState(false);
  if (!content) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-pill border border-lv-border-gold bg-lv-surface px-3 py-2 shadow-lg">
        <Badge tone="navy">ADMIN</Badge>
        <span className="hidden text-small text-lv-muted sm:inline">Bạn đang xem với quyền quản trị</span>
        <Button size="sm" icon={<IconEdit size={16} />} onClick={() => setOpen(true)}>
          Chỉnh trang
        </Button>
      </div>

      {open ? <EditorModal content={content} onClose={() => setOpen(false)} onSaved={onSaved} /> : null}
    </>
  );
}

function EditorModal({
  content,
  onClose,
  onSaved,
}: {
  content: PageContent;
  onClose: () => void;
  onSaved: (next: PageContent) => void;
}) {
  const toast = useToast();
  const [name, setName] = React.useState(content.name);
  const [tagline, setTagline] = React.useState(content.tagline);
  const [description, setDescription] = React.useState(content.description);
  const [badges, setBadges] = React.useState<string[]>([...content.badges]);
  const [packages, setPackages] = React.useState<EditablePackage[]>(content.packages.map((p) => ({ ...p })));
  const [busy, setBusy] = React.useState(false);

  function patchPkg(id: string, patch: Partial<EditablePackage>) {
    setPackages((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save() {
    setBusy(true);

    // Lưu chữ nghĩa của sản phẩm trước, rồi từng gói. Gói nào lỗi thì báo ngay
    // chứ không lặng lẽ bỏ qua.
    const textRes = await fetch("/api/admin/product-content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: content.slug,
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        badges: badges.map((b) => b.trim()).filter(Boolean),
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));

    if (!textRes.ok) {
      setBusy(false);
      toast.push({ tone: "error", title: "Không lưu được nội dung", description: String(textRes.error) });
      return;
    }

    for (const p of packages) {
      const before = content.packages.find((x) => x.id === p.id);
      const same =
        before &&
        before.name === p.name &&
        before.duration === p.duration &&
        before.price === p.price &&
        before.highlight === p.highlight &&
        (before.badge ?? "") === (p.badge ?? "") &&
        before.bullets.join("|") === p.bullets.join("|");
      if (same) continue;

      const res = await fetch("/api/admin/product-settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: content.slug,
          packageId: p.id,
          price: Math.round(p.price),
          stock: null,
          active: p.inStock || p.pileBased,
          format: [],
          highlight: p.highlight,
          badge: p.badge?.trim() || null,
          name: p.name.trim(),
          duration: p.duration.trim(),
          bullets: p.bullets.map((b) => b.trim()).filter(Boolean),
        }),
      })
        .then((r) => r.json())
        .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));

      if (!res.ok) {
        setBusy(false);
        toast.push({ tone: "error", title: `Không lưu được gói ${p.name}`, description: String(res.error) });
        return;
      }
    }

    const fresh = await fetch(`/api/products/content?slug=${encodeURIComponent(content.slug)}`)
      .then((r) => r.json())
      .catch(() => null);
    setBusy(false);

    if (fresh?.ok) onSaved(fresh.content);
    toast.push({ tone: "success", title: "Đã lưu, khách thấy ngay" });
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Chỉnh trang sản phẩm" description={content.slug} size="lg">
      <div className="space-y-5">
        <InfoCard title="Sửa xong là khách thấy ngay" tone="warning" icon={<IconAlertTriangle size={16} />}>
          Nội dung và giá ở đây áp cho toàn bộ khách. Đổi giá gói đang có người xem thì lượt mua tiếp theo tính
          theo giá mới.
        </InfoCard>

        <div className="space-y-3">
          <div>
            <Label htmlFor="ed-name" required>
              Tên sản phẩm
            </Label>
            <Input id="ed-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div>
            <Label htmlFor="ed-tagline">Dòng giới thiệu ngắn</Label>
            <Input id="ed-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={160} />
          </div>
          <div>
            <Label htmlFor="ed-desc">Mô tả</Label>
            <Textarea id="ed-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} />
          </div>
          <div>
            <Label>Nhãn dưới tên sản phẩm</Label>
            <div className="space-y-2">
              {badges.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    aria-label={`Nhãn ${i + 1}`}
                    value={b}
                    maxLength={40}
                    onChange={(e) => setBadges(badges.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <Button variant="ghost" aria-label={`Xoá nhãn ${i + 1}`} onClick={() => setBadges(badges.filter((_, j) => j !== i))}>
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
              onClick={() => setBadges([...badges, ""])}
              disabled={badges.length >= 6}
            >
              Thêm nhãn
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-card-title text-lv-text">Các gói</p>
          {packages.map((p) => (
            <div key={p.id} className="rounded-card border border-lv-border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`pk-name-${p.id}`}>Tên gói</Label>
                  <Input
                    id={`pk-name-${p.id}`}
                    value={p.name}
                    maxLength={80}
                    onChange={(e) => patchPkg(p.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`pk-dur-${p.id}`}>Thời hạn</Label>
                  <Input
                    id={`pk-dur-${p.id}`}
                    value={p.duration}
                    maxLength={40}
                    onChange={(e) => patchPkg(p.id, { duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`pk-price-${p.id}`} hint={p.originalPrice ? `gạch ngang ${formatMoney(p.originalPrice)}` : undefined}>
                    Giá bán
                  </Label>
                  <Input
                    id={`pk-price-${p.id}`}
                    type="number"
                    min={0}
                    step={1000}
                    value={p.price}
                    onChange={(e) => patchPkg(p.id, { price: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor={`pk-badge-${p.id}`} hint="để trống là không hiện">
                    Nhãn trên thẻ
                  </Label>
                  <Input
                    id={`pk-badge-${p.id}`}
                    value={p.badge ?? ""}
                    maxLength={30}
                    onChange={(e) => patchPkg(p.id, { badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label>Các dòng mô tả trong thẻ</Label>
                <div className="space-y-2">
                  {p.bullets.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        aria-label={`Dòng ${i + 1} của ${p.name}`}
                        value={b}
                        maxLength={120}
                        onChange={(e) => patchPkg(p.id, { bullets: p.bullets.map((x, j) => (j === i ? e.target.value : x)) })}
                      />
                      <Button
                        variant="ghost"
                        aria-label={`Xoá dòng ${i + 1}`}
                        onClick={() => patchPkg(p.id, { bullets: p.bullets.filter((_, j) => j !== i) })}
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
                  onClick={() => patchPkg(p.id, { bullets: [...p.bullets, ""] })}
                  disabled={p.bullets.length >= 8}
                >
                  Thêm dòng
                </Button>
              </div>

              <div className="mt-3">
                <Switch
                  id={`pk-hl-${p.id}`}
                  checked={p.highlight}
                  onCheckedChange={(v) => patchPkg(p.id, { highlight: v })}
                  label="Gói phổ biến"
                  description={p.highlight ? "Được làm nổi và chọn sẵn." : "Hiện như các gói khác."}
                />
              </div>

              {p.pileBased ? (
                <FieldMessage tone="default">
                  Gói bán theo kho · còn {p.available} món. Nạp thêm hàng ở trang quản trị.
                </FieldMessage>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" icon={<IconX size={17} />} onClick={onClose}>
            Đóng
          </Button>
          <Button loading={busy} onClick={save}>
            Lưu và áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
