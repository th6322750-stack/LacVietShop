"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowBackUp,
  IconBellRinging,
  IconChartHistogram,
  IconLayoutGrid,
  IconLogout,
  IconMenu2,
  IconPackage,
  IconPlugConnected,
  IconRefresh,
  IconShoppingCart,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import { cn, initialsOf } from "@/lib/utils";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer, ConfirmDialog } from "@/components/ui/Overlay";
import { Tooltip } from "@/components/ui/Popover";
import { useToast } from "@/components/ui/Toast";
import { useAdminSession, useRequireAdmin } from "@/lib/admin/session";
import { useAdminStore } from "@/lib/admin/store";
import { InfoCard } from "@/components/blocks/Cards";

interface AdminNavItem {
  href: string;
  label: string;
  icon: Icon;
}

const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: IconChartHistogram },
  { href: "/admin/orders", label: "Đơn hàng", icon: IconShoppingCart },
  { href: "/admin/services", label: "Dịch vụ & bảng giá", icon: IconLayoutGrid },
  { href: "/admin/products", label: "Sản phẩm premium", icon: IconPackage },
  { href: "/admin/users", label: "Người dùng & giao dịch", icon: IconUsers },
  { href: "/admin/announcement", label: "Popup thông báo", icon: IconBellRinging },
  { href: "/admin/api", label: "Kết nối API", icon: IconPlugConnected },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Trang đăng nhập không có khung và không bị chặn.
  if (pathname === "/admin/login") return <>{children}</>;

  return <AdminFrame pathname={pathname}>{children}</AdminFrame>;
}

function AdminFrame({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const { session, ready } = useRequireAdmin(pathname);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lv-bg">
        <span className="lv-skeleton h-10 w-40 rounded-control" />
      </div>
    );
  }
  if (!session) {
    // useRequireAdmin đang chuyển hướng; không nháy nội dung quản trị ra ngoài.
    return <div className="min-h-screen bg-lv-bg" />;
  }

  return (
    <div className="min-h-screen bg-lv-bg">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-lv-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua điều hướng
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail border-r border-lv-border bg-lv-surface lg:block xl:w-sidebar">
        <SidebarContent pathname={pathname} compact />
      </aside>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Điều hướng quản trị">
        <SidebarContent pathname={pathname} compact={false} />
      </Drawer>

      <div className="lg:pl-rail xl:pl-sidebar">
        <AdminTopbar onOpenMenu={() => setDrawerOpen(true)} />
        <main id="admin-content" className="mx-auto w-full max-w-shell px-gutter-m py-5 sm:py-6 xl:px-gutter">
          <StorageWarning />
          {children}
        </main>
      </div>
    </div>
  );
}

/** Trình duyệt từ chối lưu (thường do hết dung lượng) — phải báo, không im lặng. */
function StorageWarning() {
  const { storageError } = useAdminStore();
  if (!storageError) return null;
  return (
    <div className="mb-4">
      <InfoCard title="Không lưu được thay đổi" tone="danger">
        {storageError}
      </InfoCard>
    </div>
  );
}

function SidebarContent({ pathname, compact }: { pathname: string; compact: boolean }) {
  const { can, logout } = useAdminSession();
  const { reset } = useAdminStore();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-topbar shrink-0 items-center gap-2 border-b border-lv-border px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-2" aria-label="Lạc Việt Admin">
          <AssetImage assetKey="brand.markCompact" className="h-9 w-9 shrink-0" rounded="control" />
          <span className={cn("flex min-w-0 items-center gap-1.5", compact ? "hidden xl:flex" : "flex")}>
            <span className="truncate text-card-title text-lv-text">Lạc Việt</span>
            <Badge tone="navy">ADMIN</Badge>
          </span>
        </Link>
      </div>

      <nav aria-label="Điều hướng quản trị" className="flex-1 overflow-y-auto px-3 py-4">
        <p
          className={cn(
            "mb-1.5 px-2 text-small-strong uppercase tracking-wide text-lv-muted",
            compact ? "hidden xl:block" : "block",
          )}
        >
          Quản trị
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const link = (
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-control px-2.5 py-2 text-body transition-colors duration-button",
                  active
                    ? "bg-lv-gold-50 font-semibold text-lv-gold-700"
                    : "text-lv-navy-700 hover:bg-lv-bg hover:text-lv-text",
                )}
              >
                {active ? (
                  <span aria-hidden className="absolute inset-y-1.5 left-0 w-0.5 rounded-pill bg-lv-gold-600" />
                ) : null}
                <Icon size={19} className="shrink-0" />
                <span className={cn("truncate", compact ? "hidden xl:inline" : "inline")}>{item.label}</span>
              </Link>
            );
            return (
              <li key={item.href}>
                {compact ? (
                  <span className="block xl:hidden">
                    <Tooltip label={item.label}>{link}</Tooltip>
                  </span>
                ) : null}
                <span className={compact ? "hidden xl:block" : "block"}>{link}</span>
              </li>
            );
          })}
        </ul>

        <p
          className={cn(
            "mb-1.5 mt-4 px-2 text-small-strong uppercase tracking-wide text-lv-muted",
            compact ? "hidden xl:block" : "block",
          )}
        >
          Khác
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-body text-lv-navy-700 transition-colors duration-button hover:bg-lv-bg hover:text-lv-text"
            >
              <IconArrowBackUp size={19} className="shrink-0" />
              <span className={cn("truncate", compact ? "hidden xl:inline" : "inline")}>Về trang khách hàng</span>
            </Link>
          </li>
          {can("data.reset") ? (
            <li>
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body text-lv-navy-700 transition-colors duration-button hover:bg-lv-bg hover:text-lv-text"
              >
                <IconRefresh size={19} className="shrink-0" />
                <span className={cn("truncate", compact ? "hidden xl:inline" : "inline")}>Nạp lại dữ liệu gốc</span>
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-body text-lv-navy-700 transition-colors duration-button hover:bg-lv-bg hover:text-lv-text"
            >
              <IconLogout size={19} className="shrink-0" />
              <span className={cn("truncate", compact ? "hidden xl:inline" : "inline")}>Đăng xuất</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className={cn("shrink-0 border-t border-lv-border p-3", compact ? "hidden xl:block" : "block")}>
        <div className="rounded-card border border-lv-warning/35 bg-lv-warning/[0.07] p-3">
          <p className="text-small-strong text-lv-warning">Dữ liệu DEMO</p>
          <p className="mt-1 text-small text-lv-muted">
            Toàn bộ đơn hàng, người dùng và giao dịch là dữ liệu trình diễn, lưu trong trình duyệt.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          reset();
          setConfirmReset(false);
          toast.push({ tone: "success", title: "Đã nạp lại dữ liệu gốc" });
        }}
        title="Nạp lại dữ liệu gốc?"
        message="Mọi thay đổi bạn đã thực hiện (trạng thái đơn, giá, số dư…) sẽ bị xoá và trả về bộ dữ liệu ban đầu."
        confirmLabel="Nạp lại"
      />
      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={logout}
        title="Đăng xuất khỏi trang quản trị?"
        message="Bạn sẽ quay lại màn hình đăng nhập."
        confirmLabel="Đăng xuất"
      />
    </div>
  );
}

function AdminTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { session } = useAdminSession();
  const { hydrated } = useAdminStore();

  return (
    <header className="sticky top-0 z-20 h-topbar border-b border-lv-border bg-lv-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-shell items-center gap-3 px-gutter-m xl:px-gutter">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-lv-border text-lv-navy-700 transition-colors duration-button hover:bg-lv-bg lg:hidden"
        >
          <IconMenu2 size={19} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-body-strong text-lv-text">Bảng điều khiển quản trị</p>
          <p className="truncate text-small text-lv-muted">Lạc Việt Media Agency</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge tone={hydrated ? "success" : "neutral"} className="hidden md:inline-flex">
            {hydrated ? "localStorage" : "đang nạp"}
          </Badge>
          <span className="flex items-center gap-2 rounded-control px-1.5 py-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lv-gold-100 text-small-strong text-lv-gold-700">
              {initialsOf(session?.name ?? "AD")}
            </span>
            <span className="hidden min-w-0 text-left lg:block">
              <span className="block truncate text-body-strong leading-tight text-lv-text">{session?.name}</span>
              <span className="block truncate text-small text-lv-muted">
                {session?.role} · {session?.permissions.length} quyền
              </span>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

/** Nút chỉ hiện khi tài khoản có quyền tương ứng. */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Parameters<ReturnType<typeof useAdminSession>["can"]>[0];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = useAdminSession();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

export function ReadOnlyHint() {
  return <span className="text-small text-lv-muted">chỉ xem</span>;
}

export { Button as AdminButton };
