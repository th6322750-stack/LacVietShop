import {
  IconBuildingStore,
  IconCash,
  IconChartHistogram,
  IconCreditCard,
  IconHistory,
  IconHome,
  IconPackages,
  IconShoppingBag,
  IconUserCircle,
  type Icon,
} from "@tabler/icons-react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
  group: "main" | "money" | "growth";
}

/**
 * Mô hình điều hướng của panel khách hàng.
 *
 * Trang "API Documentation" đang tạm ẩn: API cho khách chưa được cấp phát nên để
 * đó chỉ khiến khách tưởng gọi được. Bật lại bằng cách thêm lại mục
 * { href: "/api-docs", ... } ở đây và tạo lại src/app/(panel)/api-docs/page.tsx.
 */
export const navItems: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: IconHome, group: "main" },
  { href: "/services", label: "Dịch vụ / Tạo đơn", icon: IconBuildingStore, group: "main" },
  { href: "/products", label: "Sản phẩm Premium", icon: IconPackages, group: "main" },
  { href: "/progress", label: "Tiến độ đơn hàng", icon: IconChartHistogram, group: "main" },
  { href: "/purchased", label: "Sản phẩm đã mua", icon: IconShoppingBag, group: "main" },
  { href: "/deposit", label: "Nạp tiền", icon: IconCreditCard, group: "money" },
  { href: "/cashflows", label: "Dòng tiền & Giao dịch", icon: IconCash, group: "money" },
  { href: "/history", label: "Lịch sử hoạt động", icon: IconHistory, group: "money" },
  { href: "/account", label: "Tài khoản", icon: IconUserCircle, group: "growth" },
];

export const navGroups: { id: NavItem["group"]; label: string }[] = [
  { id: "main", label: "Dịch vụ" },
  { id: "money", label: "Tài chính" },
  { id: "growth", label: "Tài khoản" },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
