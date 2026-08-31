"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
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

  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
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
            <Button type="submit" block size="lg" loading={submitting} icon={<IconLock size={17} />}>
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
          </form>
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
