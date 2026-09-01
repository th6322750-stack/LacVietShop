"use client";

import * as React from "react";
import { IconBellRinging, IconClockPause, IconX } from "@tabler/icons-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Overlay";
import { cn } from "@/lib/utils";
import { type AdminAnnouncement } from "@/lib/admin/data";

/**
 * Popup thông báo cho khách, nội dung do quản trị viên đặt ở /admin/announcement.
 *
 * Nội dung lấy từ máy chủ (/api/announcement) nên quản trị soạn ở đâu thì khách
 * ở máy nào cũng thấy. Riêng chuyện "đã xem chưa" là việc của từng máy khách nên
 * vẫn nằm ở localStorage.
 */

const SEEN_KEY = "lacviet_notice_seen_v1";

interface SeenRecord {
  /** Số hiệu bản thông báo mà khách đã tắt. */
  v: number;
  /** Ngày tắt gần nhất, dạng yyyy-mm-dd. */
  d: string;
  /** Mốc thời gian (epoch ms) mà trước đó không hiện lại — do khách bấm tạm ẩn. */
  until?: number;
}

const today = () => new Date().toISOString().slice(0, 10);

async function fetchAnnouncement(): Promise<AdminAnnouncement | null> {
  const res = await fetch("/api/announcement")
    .then((r) => r.json())
    .catch(() => null);
  return res?.ok ? (res.announcement as AdminAnnouncement) : null;
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
export function shouldShow(a: AdminAnnouncement, seen: SeenRecord | null, at = new Date()) {
  const day = at.toISOString().slice(0, 10);
  if (!a.enabled || !a.title.trim()) return false;
  if (a.startAt && day < a.startAt) return false;
  if (a.endAt && day > a.endAt) return false;
  if (!seen) return true;
  // Quản trị viên phát lại (đổi version) thì ai cũng thấy lại, kể cả đang tạm ẩn.
  if (seen.v !== a.version) return true;
  // Khách bấm "Ẩn trong N giờ": im đúng N giờ rồi hiện lại. Đây là lựa chọn riêng
  // của khách nên nó thắng luật tần suất — nếu không thì luật "mỗi ngày một lần"
  // sẽ chặn tiếp và nút tạm ẩn hoá ra không khác gì nút Đóng.
  if (seen.until) return at.getTime() >= seen.until;
  if (a.frequency === "always") return true;
  if (a.frequency === "daily") return seen.d !== day;
  return false;
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = React.useState<AdminAnnouncement | null>(null);

  React.useEffect(() => {
    // Chỉ chạy sau khi mount: máy chủ không biết trạng thái đã-xem của từng khách.
    let alive = true;
    void fetchAnnouncement().then((a) => {
      if (alive && a && shouldShow(a, readSeen())) setAnnouncement(a);
    });
    return () => {
      alive = false;
    };
  }, []);

  /** snoozeHours > 0 nghĩa là khách chọn tạm ẩn, không phải chỉ đóng. */
  function close(snoozeHours = 0) {
    if (announcement) {
      const record: SeenRecord = { v: announcement.version, d: today() };
      if (snoozeHours > 0) record.until = Date.now() + snoozeHours * 3_600_000;
      try {
        window.localStorage.setItem(SEEN_KEY, JSON.stringify(record));
      } catch {
        /* trình duyệt chặn lưu trữ — vẫn đóng được popup */
      }
    }
    setAnnouncement(null);
  }

  if (!announcement) return null;

  return (
    <Modal open onClose={() => close()} title={announcement.title} size="md">
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
  /** Nhận số giờ tạm ẩn; bỏ trống hoặc 0 là đóng thường. */
  onClose: (snoozeHours?: number) => void;
  hideTitle?: boolean;
  preview?: boolean;
}) {
  const lines = announcement.body.split("\n").filter((l) => l.trim());
  const snooze = announcement.snoozeHours ?? 0;

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
        <Button variant="ghost" icon={<IconX size={17} />} onClick={() => onClose()} disabled={preview}>
          Đóng
        </Button>
        {snooze > 0 ? (
          <Button
            variant="secondary"
            icon={<IconClockPause size={17} />}
            onClick={() => onClose(snooze)}
            disabled={preview}
          >
            Ẩn trong {snooze} giờ
          </Button>
        ) : null}
        {announcement.ctaLabel && announcement.ctaHref ? (
          preview ? (
            <Button disabled>{announcement.ctaLabel}</Button>
          ) : (
            <LinkButton href={announcement.ctaHref} onClick={() => onClose()}>
              {announcement.ctaLabel}
            </LinkButton>
          )
        ) : null}
      </div>
    </div>
  );
}
