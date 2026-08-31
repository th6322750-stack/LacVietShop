"use client";

import * as React from "react";
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";
import { AssetImage } from "@/components/blocks/AssetImage";
import { InfoCard } from "@/components/blocks/Cards";
import { useCustomerAuth } from "@/lib/customer/auth";

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
  const { storageError } = useCustomerAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-lv-bg p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="lv-panel p-6">
          <div className="flex flex-col items-center text-center">
            <AssetImage assetKey="brand.markCompact" className="h-14 w-14" rounded="card" />
            <h1 className="mt-3 text-h2 text-lv-text">{title}</h1>
            <p className="mt-1 text-body text-lv-muted">{description}</p>
          </div>
          {children}
        </div>

        {storageError ? (
          <InfoCard title="Không lưu được dữ liệu" tone="danger" icon={<IconAlertTriangle size={16} />}>
            {storageError}
          </InfoCard>
        ) : null}

        {footer}

        <div className="lv-card p-4">
          <p className="text-body-strong text-lv-text">Bản dựng trình diễn</p>
          <p className="mt-1 text-small text-lv-muted">
            Hệ thống chưa có backend xác thực (gap <code className="lv-price">auth.provider</code>). Tài khoản bạn
            tạo chỉ nằm trong trình duyệt này: máy khác sẽ không đăng nhập được, không có xác minh email hay
            khôi phục mật khẩu thật. Đừng dùng mật khẩu bạn đang dùng ở nơi khác.
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
