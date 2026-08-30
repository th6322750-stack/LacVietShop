import { AppShell } from "@/components/shell/AppShell";

/** Khung panel khách hàng — bọc 20 route người dùng. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
