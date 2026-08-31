import { AppShell } from "@/components/shell/AppShell";
import { AnnouncementPopup } from "@/components/blocks/AnnouncementPopup";

/** Khung panel khách hàng — bọc toàn bộ route người dùng. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
      <AnnouncementPopup />
    </AppShell>
  );
}
