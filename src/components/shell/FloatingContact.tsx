"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Cụm nút liên hệ nổi ở góc màn hình.
 *
 * Luôn nhìn thấy ở mọi trang, khách đang xem dở cũng bấm được ngay — khác với
 * thẻ ở thanh bên chỉ thấy khi cuộn xuống và biến mất trên điện thoại.
 *
 * Link do quản trị đặt (Popup thông báo › Kênh liên hệ). Kênh nào chưa điền thì
 * không hiện; chưa điền kênh nào thì cả cụm không xuất hiện.
 */

export interface Contact {
  hours?: string;
  zalo?: string;
  facebook?: string;
  messenger?: string;
  telegram?: string;
}

/** Thứ tự này là thứ tự nút hiện ra, xếp theo mức người Việt hay dùng. */
export const KENH = [
  { key: "zalo" as const, nhan: "Zalo", icon: "/assets/brands/brand-zalo.svg" },
  { key: "messenger" as const, nhan: "Messenger", icon: "/assets/brands/brand-messenger.svg" },
  { key: "telegram" as const, nhan: "Telegram", icon: "/assets/brands/brand-telegram.svg" },
  { key: "facebook" as const, nhan: "Facebook", icon: "/assets/brands/brand-facebook.svg" },
];

export function useContact() {
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

  return contact;
}

export function FloatingContact() {
  const contact = useContact();
  const co = KENH.filter((k) => (contact?.[k.key] ?? "").trim());
  if (co.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6"
      role="complementary"
      aria-label="Kênh liên hệ nhanh"
    >
      {co.map(({ key, nhan, icon }) => (
        <a
          key={key}
          href={contact![key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Liên hệ qua ${nhan}`}
          title={nhan}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-lv-border bg-lv-surface shadow-card transition-transform duration-button hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <Image src={icon} alt="" width={26} height={26} className="h-[26px] w-[26px]" />
        </a>
      ))}
    </div>
  );
}
