"use client";

import * as React from "react";
import Image from "next/image";
import { IconHeadset } from "@tabler/icons-react";

/**
 * Kênh liên hệ ở thanh bên.
 *
 * Link do quản trị đặt ở trang Popup thông báo và lấy từ máy chủ, nên đổi một
 * lần là mọi khách thấy ngay. Kênh nào chưa điền thì KHÔNG hiện — thà thiếu nút
 * còn hơn có nút bấm vào chẳng đi đâu.
 *
 * Biểu tượng là logo chính thức của từng nền tảng, lấy từ kho asset của dự án
 * WebLacViet. Không tự vẽ lại logo của họ.
 */

interface Contact {
  hours?: string;
  zalo?: string;
  facebook?: string;
  telegram?: string;
}

const KENH = [
  { key: "zalo" as const, nhan: "Zalo", icon: "/assets/brands/brand-zalo.svg" },
  { key: "facebook" as const, nhan: "Facebook", icon: "/assets/brands/brand-facebook.svg" },
  { key: "telegram" as const, nhan: "Telegram", icon: "/assets/brands/brand-telegram.svg" },
];

export function SupportChannels({ compact }: { compact: boolean }) {
  const [contact, setContact] = React.useState<Contact | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/contact")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok) setContact(d.contact ?? {});
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const co = KENH.filter((k) => (contact?.[k.key] ?? "").trim());
  // Chưa cấu hình gì thì không chiếm chỗ ở thanh bên.
  if (!contact || (co.length === 0 && !contact.hours?.trim())) return null;

  return (
    <div className="rounded-card border border-lv-border-gold bg-lv-surface-soft p-3">
      {contact.hours?.trim() ? (
        <p className="flex items-center gap-1.5 text-small-strong text-lv-gold-700">
          <IconHeadset size={15} className="shrink-0" />
          <span className={compact ? "hidden xl:inline" : "inline"}>Hỗ trợ {contact.hours}</span>
        </p>
      ) : null}

      {co.length > 0 ? (
        <div className={`flex flex-wrap gap-2 ${contact.hours?.trim() ? "mt-2.5" : ""}`}>
          {co.map(({ key, nhan, icon }) => (
            <a
              key={key}
              href={contact[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Liên hệ qua ${nhan}`}
              title={nhan}
              className="flex h-9 w-9 items-center justify-center rounded-control border border-lv-border bg-lv-surface transition-all duration-button hover:-translate-y-0.5 hover:border-lv-border-gold hover:shadow-sm"
            >
              <Image src={icon} alt="" width={20} height={20} className="h-5 w-5" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
