"use client";

import * as React from "react";
import { IconBellRinging, IconX } from "@tabler/icons-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { cn } from "@/lib/utils";
import { ADMIN_DB_KEY } from "@/lib/admin/store";
import { defaultAnnouncement, type AdminAnnouncement } from "@/lib/admin/data";

/**
 * Popup thông báo cho khách, nội dung do quản trị viên đặt ở /admin/announcement.
 *
 * Bản DEMO đọc thẳng kho quản trị trong localStorage (cùng tên miền). Khi có
 * backend thật, thay hàm readAnnouncement bằng một lời gọi API là xong; phần
 * hiển thị và luật tần suất giữ nguyên.
 */

const SEEN_KEY = "lacviet_notice_seen_v1";

interface SeenRecord {
  /** Số hiệu bản thông báo mà khách đã tắt. */
  v: number;
  /** Ngày tắt gần nhất, dạng yyyy-mm-dd. */
  d: string;
}

const today = () => new Date().toISOString().slice(0, 10);

function readAnnouncement(): AdminAnnouncement {
  try {
    const raw = window.localStorage.getItem(ADMIN_DB_KEY);
    if (!raw) return defaultAnnouncement;
    const db = JSON.parse(raw) as { announcement?: AdminAnnouncement };
    return db.announcement ?? defaultAnnouncement;
  } catch {
    return defaultAnnouncement;
  }
}

function readSeen(): SeenRecord | null {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as SeenRecord) : null;
  } catch {
    return null;
  }
}

/** Quản trị viên bấm “Phát lại cho tất cả” thì xoá dấu đã-xem trên máy này. */
export function clearAnnouncementSeen() {
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    /* trình duyệt chặn lưu trữ — bỏ qua */
  }
}

/** Quyết định có hiện popup hay không theo cấu hình và lịch sử đã xem. */
export function shouldShow(a: AdminAnnouncement, seen: SeenRecord | null, now = today()) {
  if (!a.enabled || !a.title.trim()) return false;
  if (a.startAt && now < a.startAt) return false;
  if (a.endAt && now > a.endAt) return false;
  if (!seen) return true;
  // Nội dung được phát lại (đổi version) thì ai cũng thấy lại.
  if (seen.v !== a.version) return true;
  if (a.frequency === "always") return true;
  if (a.frequency === "daily") return seen.d !== now;
  return false;
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = React.useState<AdminAnnouncement | null>(null);

  React.useEffect(() => {
    // Chỉ chạy sau khi mount: máy chủ không biết trạng thái đã-xem của từng khách.
    const a = readAnnouncement();
    if (shouldShow(a, readSeen())) setAnnouncement(a);
  }, []);

  function close() {
    if (announcement) {
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify({ v: announcement.version, d: today() }));
      } catch {
        /* trình duyệt chặn lưu trữ — vẫn đóng được popup */
      }
    }
    setAnnouncement(null);
  }

  if (!announcement) return null;

  return (
    <Modal open onClose={close} title={announcement.title} size="md">
      <AnnouncementCard announcement={announcement} onClose={close} hideTitle />
    </Modal>
  );
}

const toneStyles: Record<AdminAnnouncement["tone"], string> = {
  info: "border-lv-info/35 bg-lv-info/[0.07] text-lv-info",
  success: "border-lv-success/35 bg-lv-success/[0.07] text-lv-success",
  warning: "border-lv-warning/35 bg-lv-warning/[0.07] text-lv-warning",
  danger: "border-lv-danger/35 bg-lv-danger/[0.07] text-lv-danger",
};

/**
 * Thân popup. Dùng chung cho trang khách và khung xem thử ở trang quản trị nên
 * hai nơi không bao giờ lệch nhau.
 */
export function AnnouncementCard({
  announcement,
  onClose,
  hideTitle = false,
  preview = false,
}: {
  announcement: AdminAnnouncement;
  onClose: () => void;
  hideTitle?: boolean;
  preview?: boolean;
}) {
  const lines = announcement.body.split("\n").filter((l) => l.trim());

  return (
    <div className="space-y-3">
      <div className={cn("flex items-start gap-2 rounded-card border px-3 py-2", toneStyles[announcement.tone])}>
        <IconBellRinging size={17} className="mt-0.5 shrink-0" />
        <p className="min-w-0 break-words text-body-strong">
          {hideTitle ? "Thông báo từ Lạc Việt" : announcement.title}
        </p>
      </div>

      {announcement.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={announcement.imageSrc}
          alt=""
          className="max-h-56 w-full rounded-card border border-lv-border object-contain"
        />
      ) : null}

      {lines.length > 0 ? (
        <div className="space-y-2">
          {lines.map((line, i) => (
            <p key={i} className="break-words text-body text-lv-navy-700">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <Button variant="ghost" icon={<IconX size={17} />} onClick={onClose} disabled={preview}>
          Đóng
        </Button>
        {announcement.ctaLabel && announcement.ctaHref ? (
          preview ? (
            <Button disabled>{announcement.ctaLabel}</Button>
          ) : (
            <LinkButton href={announcement.ctaHref} onClick={onClose}>
              {announcement.ctaLabel}
            </LinkButton>
          )
        ) : null}
      </div>
    </div>
  );
}
