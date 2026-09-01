"use client";

import { IconHeadset } from "@tabler/icons-react";
import { useContact } from "./FloatingContact";

/**
 * Giờ hỗ trợ ở thanh bên.
 *
 * Các nút liên hệ đã nằm ở cụm nổi góc màn hình (FloatingContact) nên ở đây chỉ
 * còn giờ làm việc — bày cùng một bộ nút ở hai chỗ vừa thừa vừa rối.
 * Chưa đặt giờ thì thẻ này không hiện.
 */
export function SupportChannels({ compact }: { compact: boolean }) {
  const contact = useContact();
  if (!contact?.hours?.trim()) return null;

  return (
    <div className="rounded-card border border-lv-border-gold bg-lv-surface-soft p-3">
      <p className="flex items-start gap-1.5 text-small-strong text-lv-gold-700">
        <IconHeadset size={15} className="mt-0.5 shrink-0" />
        <span className={compact ? "hidden xl:inline" : "inline"}>Hỗ trợ {contact.hours}</span>
      </p>
    </div>
  );
}
