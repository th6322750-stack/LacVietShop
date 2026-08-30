import {
  IconApi,
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

/** Mô hình điều hướng — 12 route chính; 8 trang sản phẩm nằm dưới /products. */
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
  { href: "/api-docs", label: "API Documentation", icon: IconApi, group: "growth" },
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
