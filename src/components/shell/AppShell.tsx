"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBell,
  IconHeadset,
  IconLogout,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconWallet,
} from "@tabler/icons-react";
import { cn, formatMoney } from "@/lib/utils";
import { account } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Button, LinkButton } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import { Tooltip } from "@/components/ui/Popover";
import { useCustomerAuth } from "@/lib/customer/auth";
import { isActivePath, navGroups, navItems } from "./nav-items";

/**
 * Khung ứng dụng dùng chung (PROJECT_HANDOFF §7).
 * >=1200: sidebar cố định 224px · 992–1199: rail 80px có tooltip · <992: off-canvas.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-lv-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-control focus:bg-lv-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua điều hướng
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail border-r border-lv-border bg-lv-surface lg:block xl:w-sidebar">
        <SidebarContent pathname={pathname} compact />
      </aside>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Điều hướng">
        <SidebarContent pathname={pathname} compact={false} />
      </Drawer>

      <div className="lg:pl-rail xl:pl-sidebar">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} />
        <main id="main-content" className="mx-auto w-full max-w-shell px-gutter-m py-5 sm:py-6 xl:px-gutter">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function SidebarContent({ pathname, compact }: { pathname: string; compact: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-topbar shrink-0 items-center border-b border-lv-border px-4">
        <Link href="/" className="flex min-w-0 items-center" aria-label={demoBrand.name}>
          <AssetImage assetKey="brand.logoHorizontal" className="h-9 w-[150px]" rounded="none" showLabel />
        </Link>
      </div>

      <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            <p
              className={cn(
                "mb-1.5 px-2 text-small-strong uppercase tracking-wide text-lv-muted",
                compact ? "hidden xl:block" : "block",
              )}
            >
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {navItems
                .filter((item) => item.group === group.id)
                .map((item) => {
                  const active = isActivePath(pathname, item.href);
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
                        compact && "xl:justify-start",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-pill bg-lv-gold-600"
                        />
                      ) : null}
                      <Icon size={19} className="shrink-0" />
                      <span className={cn("truncate", compact ? "hidden xl:inline" : "inline")}>
                        {item.label}
                      </span>
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
          </div>
        ))}
      </nav>

      <div className={cn("shrink-0 border-t border-lv-border p-3", compact ? "hidden xl:block" : "block")}>
        <div className="space-y-3">
          <div className="rounded-card border border-lv-border-gold bg-lv-surface-soft p-3">
            <p className="flex items-center gap-1.5 text-small-strong text-lv-gold-700">
              <IconHeadset size={15} />
              Hỗ trợ {demoBrand.supportHours}
            </p>
            <p className="mt-1 text-small text-lv-muted">
              Kênh liên hệ chính thức chưa được cấu hình trong bản dựng này.
            </p>
            <LinkButton href="/api-docs" variant="secondary" size="sm" block className="mt-2">
              Xem tài liệu API
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
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

        <form
          role="search"
          className="hidden min-w-0 flex-1 items-center gap-2 rounded-control border border-lv-border bg-lv-bg px-3 py-2 focus-within:border-lv-gold-500 md:flex"
          onSubmit={(e) => e.preventDefault()}
        >
          <IconSearch size={17} className="shrink-0 text-lv-muted" aria-hidden />
          <input
            type="search"
            placeholder="Tìm dịch vụ, sản phẩm, mã đơn…"
            aria-label="Tìm kiếm"
            className="w-full bg-transparent text-body text-lv-text outline-none placeholder:text-lv-muted"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          {/* Số dư, nạp tiền và chuông chỉ có nghĩa với người đã đăng nhập. */}
          <WalletCorner />
          <AccountCorner />
        </div>
      </div>
    </header>
  );
}

/**
 * Góc tài khoản trên topbar.
 * Chưa đăng nhập -> hai nút Đăng nhập / Đăng ký.
 * Đã đăng nhập  -> tên thật của phiên, kèm nút đăng xuất.
 */
/** Số dư + nút nạp tiền + chuông thông báo; ẩn hẳn khi chưa đăng nhập. */
function WalletCorner() {
  const { session, ready } = useCustomerAuth();
  if (!ready || !session) return null;

  return (
    <>
      <div className="hidden items-center gap-2 rounded-control border border-lv-border-gold bg-lv-gold-50 px-3 py-1.5 sm:flex">
        <IconWallet size={17} className="text-lv-gold-700" aria-hidden />
        <span className="text-small text-lv-muted">Số dư</span>
        <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(account.balance)}</span>
      </div>

      <LinkButton href="/deposit" size="sm" icon={<IconPlus size={16} />} className="hidden sm:inline-flex">
        Nạp tiền
      </LinkButton>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Thông báo"
        className="relative h-10 w-10 p-0"
        icon={<IconBell size={19} />}
      >
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lv-danger" aria-hidden />
      </Button>
    </>
  );
}

function AccountCorner() {
  const { session, ready, logout } = useCustomerAuth();

  // Chưa đọc xong localStorage thì giữ chỗ, tránh nháy từ nút sang tên rồi ngược lại.
  if (!ready) return <span className="lv-skeleton h-10 w-24 rounded-control" />;

  if (!session) {
    return (
      <span className="flex items-center gap-2">
        <LinkButton href="/login" variant="secondary" size="sm">
          Đăng nhập
        </LinkButton>
        <LinkButton href="/register" size="sm" className="hidden sm:inline-flex">
          Đăng ký
        </LinkButton>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Link
        href="/account"
        className="flex items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-button hover:bg-lv-bg"
      >
        <AssetImage assetKey="account.defaultAvatar" className="h-8 w-8" rounded="full" label={session.name} />
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block truncate text-body-strong leading-tight text-lv-text">{session.name}</span>
          <span className="block truncate text-small text-lv-muted">{session.email}</span>
        </span>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Đăng xuất"
        title="Đăng xuất"
        className="h-10 w-10 p-0"
        icon={<IconLogout size={18} />}
        onClick={logout}
      />
    </span>
  );
}

function Footer() {
  return (
    <footer className="mt-8 border-t border-lv-border bg-lv-surface">
      <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-3 px-gutter-m py-5 xl:px-gutter">
        <div className="flex items-center gap-3">
          <AssetImage assetKey="brand.logoHorizontal" className="h-7 w-[132px]" rounded="none" showLabel />
        </div>
        <p className="text-small text-lv-muted">
          © {new Date().getUTCFullYear()} {demoBrand.name}.
        </p>
      </div>
    </footer>
  );
}
