"use client";

import * as React from "react";
import Image from "next/image";
import { IconPhone, IconX } from "@tabler/icons-react";

/**
 * Nút liên hệ nổi ở góc màn hình.
 *
 * Bình thường chỉ một nút điện thoại; bấm thì các kênh bung lên theo. Gom lại
 * một nút vì bốn nút xếp dọc chiếm gần nửa chiều cao màn hình điện thoại và che
 * mất nội dung khách đang đọc.
 *
 * Link do quản trị đặt (Popup thông báo › Kênh liên hệ). Kênh nào chưa điền thì
 * không hiện; chưa điền kênh nào thì cả nút không xuất hiện.
 */

export interface Contact {
  hours?: string;
  zalo?: string;
  facebook?: string;
  messenger?: string;
  telegram?: string;
}

/** Thứ tự này là thứ tự bung ra, xếp theo mức người Việt hay dùng. */
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
  const [mo, setMo] = React.useState(false);
  const boc = React.useRef<HTMLDivElement>(null);

  // Bấm ra ngoài hoặc bấm Esc thì thu lại — đang đọc trang mà nút cứ bung là vướng.
  React.useEffect(() => {
    if (!mo) return;
    const ngoai = (e: MouseEvent) => {
      if (boc.current && !boc.current.contains(e.target as Node)) setMo(false);
    };
    const phim = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMo(false);
    };
    document.addEventListener("mousedown", ngoai);
    document.addEventListener("keydown", phim);
    return () => {
      document.removeEventListener("mousedown", ngoai);
      document.removeEventListener("keydown", phim);
    };
  }, [mo]);

  const co = KENH.filter((k) => (contact?.[k.key] ?? "").trim());
  if (co.length === 0) return null;

  return (
    <div ref={boc} className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-2.5 sm:bottom-6 sm:right-6">
      {/* Các kênh xếp trên nút chính, bung lần lượt từ dưới lên. */}
      <div className="flex flex-col-reverse items-center gap-2.5">
        {co.map(({ key, nhan, icon }, i) => (
          <a
            key={key}
            href={contact![key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Liên hệ qua ${nhan}`}
            title={nhan}
            tabIndex={mo ? 0 : -1}
            aria-hidden={!mo}
            style={{ transitionDelay: `${(mo ? i : co.length - 1 - i) * 45}ms` }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-lv-border bg-lv-surface shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none ${
              mo ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-75 opacity-0"
            }`}
          >
            <Image src={icon} alt="" width={24} height={24} className="h-6 w-6" />
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setMo((v) => !v)}
        aria-expanded={mo}
        aria-label={mo ? "Đóng kênh liên hệ" : "Mở kênh liên hệ"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-lv-gold-600 text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lv-gold-700 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {mo ? <IconX size={24} /> : <IconPhone size={24} />}
        {/* Vòng sáng nhè nhẹ để khách để ý, tắt khi đã mở và khi máy giảm chuyển động. */}
        {!mo ? (
          <span
            aria-hidden
            className="absolute h-14 w-14 animate-ping rounded-full bg-lv-gold-600 opacity-20 motion-reduce:hidden"
          />
        ) : null}
      </button>
    </div>
  );
}
