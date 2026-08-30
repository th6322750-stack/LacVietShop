import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
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
    "Nền tảng dịch vụ tăng trưởng số và tài khoản premium của Lạc Việt Media Agency. Bản dựng trình diễn giao diện.",
  // Dùng lại compact mark làm favicon theo .webby/ASSET_PATCH.md §A
  icons: { icon: [{ url: "/assets/brand/lac-viet-mark.svg", type: "image/svg+xml" }] },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className={inter.className}>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
