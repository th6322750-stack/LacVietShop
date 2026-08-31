"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconArrowBackUp, IconLock } from "@tabler/icons-react";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
import { adminAccounts } from "@/lib/admin/data";
import { useAdminSession } from "@/lib/admin/session";

export function LoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const { session, ready, login } = useAdminSession();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const next = params.get("next") || "/admin";

  React.useEffect(() => {
    if (ready && session) router.replace(next);
  }, [ready, session, router, next]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = login(username, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-lv-bg p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="lv-panel p-6">
          <div className="flex flex-col items-center text-center">
            <AssetImage assetKey="brand.logoHorizontal" className="h-11 w-[190px]" rounded="none" showLabel />
            <h1 className="mt-3 text-h2 text-lv-text">
              Lạc Việt <span className="text-lv-gold-700">Admin</span>
            </h1>
            <p className="mt-1 text-body text-lv-muted">Đăng nhập để vào bảng điều khiển quản trị</p>
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="username" required>
                Tài khoản
              </Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                tone={error ? "invalid" : "default"}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password" required>
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                tone={error ? "invalid" : "default"}
              />
              <FieldMessage>{error}</FieldMessage>
            </div>
            <Button type="submit" block size="lg" icon={<IconLock size={17} />}>
              Đăng nhập
            </Button>
          </form>
        </div>

        <div className="lv-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-body-strong text-lv-text">Tài khoản dùng thử</p>
            <Badge tone="gold">bấm để điền</Badge>
          </div>
          <div className="mt-2 space-y-2">
            {adminAccounts.map((a) => (
              <button
                key={a.username}
                type="button"
                onClick={() => {
                  setUsername(a.username);
                  setPassword(a.password);
                  setError(null);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-card border border-lv-border px-3 py-2 text-left transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50"
              >
                <span>
                  <span className="block text-body-strong text-lv-text">
                    {a.username} / {a.password}
                  </span>
                  <span className="block text-small text-lv-muted">
                    {a.role} · {a.permissions.length} quyền
                  </span>
                </span>
                <IconArrowBackUp size={16} className="shrink-0 -scale-x-100 text-lv-muted" />
              </button>
            ))}
          </div>
          <p className="mt-3 text-small text-lv-muted">
            Bản dựng này chưa có backend xác thực: phiên đăng nhập chỉ nằm trong trình duyệt và mật khẩu
            nằm trong mã nguồn. Đây là lớp phân vai trò khi thao tác, không phải bảo mật thật
            (gap <code>auth.provider</code>).
          </p>
        </div>

        <p className="text-center">
          <Link href="/" className="text-small text-lv-muted transition-colors duration-button hover:text-lv-gold-700">
            ← Về trang khách hàng
          </Link>
        </p>
      </div>
    </div>
  );
}
