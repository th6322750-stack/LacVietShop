"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLogin2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useCustomerAuth } from "@/lib/customer/auth";
import { AuthShell } from "./AuthShell";

export function CustomerLoginView() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { login, session, ready } = useCustomerAuth();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const next = params.get("next") || "/";

  React.useEffect(() => {
    if (ready && session) router.replace(next);
  }, [ready, session, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(identifier, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.push({ tone: "success", title: "Đăng nhập thành công" });
    router.replace(next);
  }

  return (
    <AuthShell
      title="Đăng nhập"
      description="Dùng tên đăng nhập hoặc email của bạn"
      footer={
        <p className="text-center text-small text-lv-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-lv-gold-700 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <Label htmlFor="identifier" required>
            Tên đăng nhập hoặc email
          </Label>
          <Input
            id="identifier"
            autoComplete="username"
            placeholder="nguyenvana"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
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

        <Button type="submit" block size="lg" loading={submitting} icon={<IconLogin2 size={17} />}>
          {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>

        <div className="flex items-center justify-between text-small">
          <Link href="/forgot-password" className="text-lv-muted transition-colors duration-button hover:text-lv-gold-700">
            Quên mật khẩu?
          </Link>
          <Link href="/admin/login" className="text-lv-muted transition-colors duration-button hover:text-lv-gold-700">
            Đăng nhập quản trị
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
