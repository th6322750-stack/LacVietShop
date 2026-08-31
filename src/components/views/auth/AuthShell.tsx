import * as React from "react";
import Link from "next/link";
import { AssetImage } from "@/components/blocks/AssetImage";

/** Khung chung cho ba màn đăng ký / đăng nhập / quên mật khẩu. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lv-bg p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="lv-panel p-6">
          <div className="flex flex-col items-center text-center">
            <AssetImage assetKey="brand.logoHorizontal" className="h-11 w-[190px]" rounded="none" showLabel />
            <h1 className="mt-3 text-h2 text-lv-text">{title}</h1>
            <p className="mt-1 text-body text-lv-muted">{description}</p>
          </div>
          {children}
        </div>

        {footer}

        <div className="lv-card p-4">
          <p className="text-body-strong text-lv-text">Bản dựng đang kiểm thử</p>
          <p className="mt-1 text-small text-lv-muted">
            Tài khoản lưu trên máy chủ chạy cục bộ, chưa có xác minh email hay số điện thoại. Đừng dùng lại mật
            khẩu bạn đang dùng ở nơi khác.
          </p>
        </div>

        <p className="text-center">
          <Link href="/" className="text-small text-lv-muted transition-colors duration-button hover:text-lv-gold-700">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
