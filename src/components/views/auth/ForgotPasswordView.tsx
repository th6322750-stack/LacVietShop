"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconMail, IconShieldCheck } from "@tabler/icons-react";
import { InfoCard } from "@/components/blocks/Cards";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useCustomerAuth, type Delivery } from "@/lib/customer/auth";
import { AuthShell } from "./AuthShell";

/**
 * Quên mật khẩu, hai bước: nhập email nhận mã 6 số → nhập mã kèm mật khẩu mới.
 *
 * Dùng mã thay vì đường dẫn đặt lại vì mã gõ ở đâu cũng được, không phụ thuộc địa
 * chỉ web hiện tại, và sau này chuyển sang gửi qua Zalo/SMS thì không phải làm lại.
 */
export function ForgotPasswordView() {
  const router = useRouter();
  const toast = useToast();
  const { requestResetCode, resetPassword } = useCustomerAuth();

  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");
  const [delivery, setDelivery] = React.useState<Delivery | null>(null);
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Nhà cung cấp chặn gửi lại trong 60 giây; đếm ngược cho khách khỏi bấm liên tục.
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const res = await requestResetCode(email);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDelivery(res.delivery);
    setStep("code");
    setCooldown(60);
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Hai lần nhập mật khẩu không khớp.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await resetPassword(email, code, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.push({
      tone: "success",
      title: "Đã đổi mật khẩu",
      description: "Hãy đăng nhập bằng mật khẩu mới.",
    });
    router.replace("/login");
  }

  return (
    <AuthShell
      title="Quên mật khẩu"
      description={step === "email" ? "Nhập email để nhận mã đặt lại" : "Nhập mã vừa gửi và mật khẩu mới"}
      footer={
        <p className="text-center text-small text-lv-muted">
          Nhớ ra rồi?{" "}
          <Link href="/login" className="font-semibold text-lv-gold-700 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      }
    >
      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-5 space-y-4" noValidate>
          <div>
            <Label htmlFor="email" required>
              Email đã đăng ký
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="camonquykhach@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              tone={error ? "invalid" : "default"}
              autoFocus
            />
            <FieldMessage>{error}</FieldMessage>
          </div>

          <Button type="submit" block size="lg" loading={busy} icon={<IconMail size={17} />} disabled={!email.trim()}>
            {busy ? "Đang gửi…" : "Gửi mã đặt lại"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="mt-5 space-y-4" noValidate>
          <InfoCard title="Đã gửi mã" tone={delivery === "smtp" ? "success" : "warning"}>
            {delivery === "smtp" ? (
              <>
                Nếu email <strong>{email}</strong> có tài khoản, mã 6 số đã được gửi tới hộp thư đó. Mã có hiệu lực
                15 phút. Nhớ ngó cả mục Spam.
              </>
            ) : (
              <>
                Hệ thống chưa cấu hình gửi thư, nên mã được in ra cửa sổ đang chạy máy chủ thay vì gửi email. Điền
                <code className="lv-price"> SMTP_PASS </code> trong <code className="lv-price">.env.local</code> để
                gửi thật.
              </>
            )}
          </InfoCard>

          <div>
            <Label htmlFor="code" required hint="6 số">
              Mã đặt lại
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              className="lv-price text-center text-h3 tracking-[0.4em]"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="password" required hint="tối thiểu 8 ký tự">
              Mật khẩu mới
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
            />
          </div>

          <div>
            <Label htmlFor="confirm" required>
              Nhập lại mật khẩu mới
            </Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              tone={error ? "invalid" : "default"}
            />
            <FieldMessage>{error}</FieldMessage>
          </div>

          <Button
            type="submit"
            block
            size="lg"
            loading={busy}
            icon={<IconShieldCheck size={17} />}
            disabled={code.length !== 6 || !password || !confirm}
          >
            {busy ? "Đang đổi mật khẩu…" : "Đặt mật khẩu mới"}
          </Button>

          <div className="flex items-center justify-between text-small">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="flex items-center gap-1 text-lv-muted transition-colors duration-button hover:text-lv-gold-700"
            >
              <IconArrowLeft size={15} /> Đổi email khác
            </button>
            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={cooldown > 0 || busy}
              className="text-lv-muted transition-colors duration-button hover:text-lv-gold-700 disabled:opacity-60"
            >
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã"}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
