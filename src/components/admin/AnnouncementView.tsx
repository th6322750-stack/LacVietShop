"use client";

import * as React from "react";
import { IconDeviceFloppy, IconEye, IconPhoto, IconRefreshAlert, IconTrash } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, InfoCard } from "@/components/blocks/Cards";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select, Switch, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useAdminStore } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { formatBytes, readProductImage } from "@/lib/admin/image";
import { AnnouncementCard, clearAnnouncementSeen } from "@/components/blocks/AnnouncementPopup";
import type { AdminAnnouncement } from "@/lib/admin/data";

const tones: { id: AdminAnnouncement["tone"]; label: string }[] = [
  { id: "info", label: "Thông tin (xanh dương)" },
  { id: "success", label: "Tin vui (xanh lá)" },
  { id: "warning", label: "Lưu ý (vàng)" },
  { id: "danger", label: "Cảnh báo (đỏ)" },
];

const frequencies: { id: AdminAnnouncement["frequency"]; label: string; hint: string }[] = [
  { id: "always", label: "Mỗi lần vào web", hint: "Khách thấy popup ở mọi lượt truy cập." },
  { id: "daily", label: "Mỗi ngày một lần", hint: "Khách tắt rồi thì hôm sau mới thấy lại." },
  { id: "once", label: "Chỉ một lần", hint: "Khách tắt là thôi, trừ khi bạn phát lại." },
];

export function AdminAnnouncementView() {
  const toast = useToast();
  const { can } = useAdminSession();
  const { announcement, setAnnouncement, hydrated } = useAdminStore();
  const editable = can("announce.edit");

  const [draft, setDraft] = React.useState<AdminAnnouncement>(announcement);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [imageBytes, setImageBytes] = React.useState<number | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Kho dữ liệu nạp từ localStorage sau khi mount; đồng bộ lại bản nháp một lần.
  React.useEffect(() => {
    if (hydrated) setDraft(announcement);
  }, [hydrated, announcement]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(announcement);

  function patch(next: Partial<AdminAnnouncement>) {
    setDraft((d) => ({ ...d, ...next }));
  }

  async function pickImage(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    const res = await readProductImage(file);
    if (!res.ok) {
      setImageError(res.error);
      return;
    }
    patch({ imageSrc: res.dataUrl });
    setImageBytes(res.bytes);
  }

  function save() {
    if (!draft.title.trim()) {
      toast.push({ tone: "warning", title: "Chưa có tiêu đề" });
      return;
    }
    setAnnouncement(draft);
    toast.push({ tone: "success", title: "Đã lưu thông báo" });
  }

  function republish() {
    const next = { ...draft, version: draft.version + 1 };
    setDraft(next);
    setAnnouncement(next);
    clearAnnouncementSeen();
    toast.push({
      tone: "success",
      title: "Đã phát lại thông báo",
      description: "Mọi khách đều thấy popup ở lượt truy cập tới.",
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Popup thông báo"
        description="Nội dung hiện lên khi khách vào trang. Sửa ở đây, khách thấy ngay ở lượt truy cập kế tiếp."
        breadcrumb={[{ label: "Quản trị", href: "/admin" }, { label: "Popup thông báo" }]}
        action={
          editable ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" icon={<IconRefreshAlert size={17} />} onClick={republish}>
                Phát lại cho tất cả
              </Button>
              <Button icon={<IconDeviceFloppy size={17} />} onClick={save} disabled={!dirty}>
                {dirty ? "Lưu thay đổi" : "Đã lưu"}
              </Button>
            </div>
          ) : null
        }
      />

      {!editable ? (
        <InfoCard title="Chỉ xem" tone="info">
          Tài khoản của bạn không có quyền <code className="lv-price">announce.edit</code> nên chỉ xem được nội dung.
        </InfoCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 xl:col-span-7">
          <SectionCard title="Nội dung" description="Tiêu đề và nội dung hiển thị trong popup.">
            <div className="space-y-4">
              <Switch
                id="ann-enabled"
                checked={draft.enabled}
                onCheckedChange={(v) => patch({ enabled: v })}
                disabled={!editable}
                label="Bật popup"
                description={draft.enabled ? "Khách sẽ thấy popup khi vào web." : "Đang tắt, không ai thấy popup."}
              />

              <div>
                <Label htmlFor="ann-title" required>
                  Tiêu đề
                </Label>
                <Input
                  id="ann-title"
                  value={draft.title}
                  disabled={!editable}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Ví dụ: Bảo trì hệ thống tối nay"
                />
              </div>

              <div>
                <Label htmlFor="ann-body" hint="mỗi dòng là một đoạn">
                  Nội dung
                </Label>
                <Textarea
                  id="ann-body"
                  rows={5}
                  value={draft.body}
                  disabled={!editable}
                  onChange={(e) => patch({ body: e.target.value })}
                  placeholder="Nội dung thông báo gửi tới khách…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ann-tone">Tông màu</Label>
                  <Select
                    id="ann-tone"
                    value={draft.tone}
                    disabled={!editable}
                    onChange={(e) => patch({ tone: e.target.value as AdminAnnouncement["tone"] })}
                  >
                    {tones.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ann-freq">Tần suất hiện</Label>
                  <Select
                    id="ann-freq"
                    value={draft.frequency}
                    disabled={!editable}
                    onChange={(e) => patch({ frequency: e.target.value as AdminAnnouncement["frequency"] })}
                  >
                    {frequencies.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                  <FieldMessage tone="default">
                    {frequencies.find((f) => f.id === draft.frequency)?.hint}
                  </FieldMessage>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Nút hành động" description="Để trống nếu popup chỉ để đọc.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ann-cta">Nhãn nút</Label>
                <Input
                  id="ann-cta"
                  value={draft.ctaLabel ?? ""}
                  disabled={!editable}
                  onChange={(e) => patch({ ctaLabel: e.target.value })}
                  placeholder="Xem bảng dịch vụ"
                />
              </div>
              <div>
                <Label htmlFor="ann-href">Đường dẫn</Label>
                <Input
                  id="ann-href"
                  value={draft.ctaHref ?? ""}
                  disabled={!editable}
                  onChange={(e) => patch({ ctaHref: e.target.value })}
                  placeholder="/services"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ảnh minh hoạ" description="Không bắt buộc. Ảnh được thu nhỏ trước khi lưu.">
            <div className="flex flex-wrap items-center gap-3">
              {draft.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.imageSrc}
                  alt="Ảnh thông báo"
                  className="h-24 w-24 rounded-card border border-lv-border object-contain"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-card border border-dashed border-lv-border text-lv-muted">
                  <IconPhoto size={22} />
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void pickImage(e.target.files?.[0])}
                />
                <Button variant="secondary" disabled={!editable} onClick={() => fileRef.current?.click()}>
                  Chọn ảnh
                </Button>
                {draft.imageSrc ? (
                  <Button
                    variant="ghost"
                    icon={<IconTrash size={17} />}
                    disabled={!editable}
                    onClick={() => {
                      patch({ imageSrc: undefined });
                      setImageBytes(null);
                    }}
                  >
                    Bỏ ảnh
                  </Button>
                ) : null}
              </div>
              {imageBytes !== null ? <span className="text-small text-lv-muted">{formatBytes(imageBytes)}</span> : null}
            </div>
            {imageError ? <FieldMessage>{imageError}</FieldMessage> : null}
          </SectionCard>

          <SectionCard title="Thời gian hiển thị" description="Để trống là hiện không giới hạn.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ann-start">Bắt đầu</Label>
                <Input
                  id="ann-start"
                  type="date"
                  value={draft.startAt ?? ""}
                  disabled={!editable}
                  onChange={(e) => patch({ startAt: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="ann-end">Kết thúc</Label>
                <Input
                  id="ann-end"
                  type="date"
                  value={draft.endAt ?? ""}
                  disabled={!editable}
                  onChange={(e) => patch({ endAt: e.target.value || undefined })}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Xem thử đúng bằng thành phần mà trang khách dùng */}
        <aside className="min-w-0 xl:col-span-5">
          <div className="xl:sticky xl:top-[88px]">
            <SectionCard
              title="Xem thử"
              description="Đúng khối mà khách nhìn thấy."
              action={
                <span className="flex items-center gap-1.5 text-small text-lv-muted">
                  <IconEye size={15} /> bản nháp
                </span>
              }
            >
              {draft.enabled ? (
                <div className="rounded-card bg-lv-bg p-4">
                  <AnnouncementCard announcement={draft} onClose={() => undefined} preview />
                </div>
              ) : (
                <p className="py-8 text-center text-small text-lv-muted">Popup đang tắt, khách không thấy gì.</p>
              )}
            </SectionCard>

            <div className="mt-4 rounded-card border border-lv-border bg-lv-surface p-4 text-small text-lv-muted">
              <p className="text-card-title text-lv-text">Cách hoạt động</p>
              <ul className="mt-2 space-y-1.5">
                <li>· Bản nháp chỉ có tác dụng sau khi bấm “Lưu thay đổi”.</li>
                <li>· “Phát lại cho tất cả” dùng khi bạn sửa nội dung và muốn cả người đã tắt xem lại.</li>
                <li>· Trạng thái đã-xem lưu trong trình duyệt của từng khách.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
