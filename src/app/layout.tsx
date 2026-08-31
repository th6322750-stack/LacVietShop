import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CustomerAuthProvider } from "@/lib/customer/auth";
import { demoBrand } from "@/lib/demo/config";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${demoBrand.name} — ${demoBrand.tagline}`,
    template: `%s · ${demoBrand.name}`,
  },
  description:
    "Nền tảng dịch vụ tăng trưởng số và tài khoản premium của Lạc Việt Media Agency.",
  // Dùng lại compact mark làm favicon theo .webby/ASSET_PATCH.md §A
  icons: { icon: [{ url: "/assets/brand/lac-viet-mark.svg", type: "image/svg+xml" }] },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * Layout gốc chỉ lo font, token và toast.
 * Khung điều hướng nằm ở từng nhóm route:
 *   (panel)/layout.tsx  -> AppShell cho khách hàng
 *   (auth)/layout.tsx   -> ba màn đăng ký / đăng nhập / quên mật khẩu
 *   admin/layout.tsx    -> AdminShell cho quản trị
 *
 * Phiên đăng nhập của khách bọc ở đây vì cả (panel) lẫn (auth) đều cần đọc.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={inter.className}>
        <ToastProvider>
          <CustomerAuthProvider>{children}</CustomerAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
