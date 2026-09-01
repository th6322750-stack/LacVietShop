"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconDeviceFloppy, IconLock, IconShieldLock } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, InfoCard } from "@/components/blocks/Cards";
import { SignInGate } from "@/components/blocks/SignInGate";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useCustomerAuth } from "@/lib/customer/auth";
import { useLedger } from "@/lib/customer/ledger";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Thông tin tài khoản.
 *
 * Tất cả hiện ở đây là của tài khoản đang đăng nhập, lấy từ /api/auth/me. Trang
 * này từng hiện hồ sơ và số dư của một người dựng sẵn, kèm công tắc 2FA và khoá
 * API không nối vào đâu cả — đã bỏ hết, chỉ giữ những gì máy chủ làm thật:
 * đổi tên hiển thị / số điện thoại, và đổi mật khẩu.
 */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Tên hiển thị tối thiểu 2 ký tự.").max(60),
  phone: z.string().trim().regex(/^0\d{9}$/u, "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0."),
});

const passwordSchema = z
  .object({
    current: z.string().min(1, "Nhập mật khẩu hiện tại."),
    next: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự."),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Xác nhận mật khẩu chưa khớp." });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

/** Che bớt phần giữa: đủ để chủ tài khoản nhận ra, người ngó qua vai thì không. */
function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const head = name.slice(0, 3);
  return `${head}${"•".repeat(Math.max(3, name.length - 3))}@${domain}`;
}

function maskPhone(phone: string) {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}•••${phone.slice(-3)}`;
}

export function AccountView() {
  const toast = useToast();
  const { session, ready, refresh } = useCustomerAuth();
  const { orders } = useLedger();
  const [busy, setBusy] = React.useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
    mode: "onBlur",
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
    mode: "onBlur",
  });

  const { reset: resetProfile } = profileForm;
  React.useEffect(() => {
    if (session) resetProfile({ name: session.name, phone: session.phone });
  }, [session, resetProfile]);

  const totalSpent = orders.filter((o) => o.status !== "canceled").reduce((s, o) => s + o.amount, 0);
  const recent = orders.slice(0, 5);

  async function saveProfile(values: ProfileValues) {
    setBusy(true);
    const res = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setBusy(false);

    if (!res.ok) {
      toast.push({ tone: "error", title: "Không lưu được", description: String(res.error) });
      return;
    }
    await refresh();
    toast.push({ tone: "success", title: "Đã lưu thông tin" });
  }

  async function savePassword(values: PasswordValues) {
    setBusy(true);
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ current: values.current, next: values.next }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setBusy(false);

    if (!res.ok) {
      toast.push({ tone: "error", title: "Không đổi được mật khẩu", description: String(res.error) });
      return;
    }
    passwordForm.reset();
    toast.push({
      tone: "success",
      title: "Đã đổi mật khẩu",
      description: "Các thiết bị khác đã bị đăng xuất.",
    });
  }

  if (ready && !session) {
    return (
      <SignInGate
        title="Thông tin tài khoản"
        description="Hồ sơ và bảo mật của tài khoản Lạc Việt."
        next="/account"
        reason="Đăng nhập để xem và chỉnh thông tin tài khoản của bạn."
      />
    );
  }

  // Đang hỏi máy chủ: vẫn dựng tiêu đề trang, đừng trả về trang trắng.
  if (!session) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Thông tin tài khoản"
          description="Hồ sơ và bảo mật của tài khoản Lạc Việt."
          breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]}
        />
        <SectionCard title="Đang tải">
          <p className="text-small text-lv-muted">Đang đọc thông tin tài khoản.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thông tin tài khoản"
        description="Hồ sơ và bảo mật của tài khoản Lạc Việt."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-4">
          <SectionCard>
            <div className="flex flex-col items-center text-center">
              <AssetImage assetKey="account.defaultAvatar" className="h-20 w-20" rounded="full" label={session.name} />
              <p className="mt-3 text-h3 text-lv-text">{session.name}</p>
              <p className="text-small text-lv-muted">@{session.username}</p>

              <div className="mt-4 w-full rounded-card border border-lv-border-gold bg-lv-gold-50 p-3 text-left">
                <p className="text-small text-lv-gold-700">Số dư khả dụng</p>
                <p className="lv-price text-metric text-lv-gold-700">{formatMoney(session.balance)}</p>
              </div>

              <dl className="mt-4 w-full space-y-2 text-left">
                <Row label="Email" value={maskEmail(session.email)} />
                <Row label="Số điện thoại" value={maskPhone(session.phone)} />
                <Row label="Tham gia" value={formatDate(session.createdAt)} />
                <Row label="Tổng đã chi" value={formatMoney(totalSpent)} />
              </dl>
            </div>
          </SectionCard>

          <SectionCard title="Đơn gần đây" padded={false}>
            {recent.length ? (
              <ul className="divide-y divide-lv-border">
                {recent.map((o) => (
                  <li key={o.id} className="px-5 py-3">
                    <p className="text-body-strong text-lv-text">{o.productName}</p>
                    <p className="text-small text-lv-muted">
                      {o.packageName} · {formatMoney(o.amount)}
                    </p>
                    <p className="mt-0.5 text-small text-lv-muted">{formatDateTime(o.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-small text-lv-muted">Bạn chưa có đơn hàng nào.</p>
            )}
          </SectionCard>
        </div>

        <div className="min-w-0 space-y-5 xl:col-span-8">
          <SectionCard title="Thông tin cá nhân" description="Tên hiển thị và số liên hệ.">
            <form onSubmit={profileForm.handleSubmit(saveProfile)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name" required>
                  Tên hiển thị
                </Label>
                <Input
                  id="name"
                  tone={profileForm.formState.errors.name ? "invalid" : "default"}
                  {...profileForm.register("name")}
                />
                <FieldMessage>{profileForm.formState.errors.name?.message}</FieldMessage>
              </div>
              <div>
                <Label htmlFor="phone" required>
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="0xxxxxxxxx"
                  tone={profileForm.formState.errors.phone ? "invalid" : "default"}
                  {...profileForm.register("phone")}
                />
                <FieldMessage>{profileForm.formState.errors.phone?.message}</FieldMessage>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" loading={busy} icon={<IconDeviceFloppy size={17} />}>
                  Lưu thay đổi
                </Button>
                <p className="mt-2 text-small text-lv-muted">
                  Email đăng nhập là {session.email} — đổi email cần xác minh nên hãy liên hệ hỗ trợ.
                </p>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Bảo mật" description="Đổi mật khẩu đăng nhập.">
            <form onSubmit={passwordForm.handleSubmit(savePassword)} className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="current" required>
                  Mật khẩu hiện tại
                </Label>
                <Input
                  id="current"
                  type="password"
                  autoComplete="current-password"
                  tone={passwordForm.formState.errors.current ? "invalid" : "default"}
                  {...passwordForm.register("current")}
                />
                <FieldMessage>{passwordForm.formState.errors.current?.message}</FieldMessage>
              </div>
              <div>
                <Label htmlFor="next" required>
                  Mật khẩu mới
                </Label>
                <Input
                  id="next"
                  type="password"
                  autoComplete="new-password"
                  tone={passwordForm.formState.errors.next ? "invalid" : "default"}
                  {...passwordForm.register("next")}
                />
                <FieldMessage>{passwordForm.formState.errors.next?.message}</FieldMessage>
              </div>
              <div>
                <Label htmlFor="confirm" required>
                  Xác nhận mật khẩu
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  tone={passwordForm.formState.errors.confirm ? "invalid" : "default"}
                  {...passwordForm.register("confirm")}
                />
                <FieldMessage>{passwordForm.formState.errors.confirm?.message}</FieldMessage>
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" variant="secondary" loading={busy} icon={<IconLock size={17} />}>
                  Đổi mật khẩu
                </Button>
              </div>
            </form>

            <div className="mt-5 border-t border-lv-border pt-5">
              <InfoCard title="Giữ tài khoản an toàn" tone="warning" icon={<IconShieldLock size={16} />}>
                Đổi mật khẩu xong, mọi thiết bị khác sẽ bị đăng xuất. Không chia sẻ mật khẩu hay mã đặt lại cho bất
                kỳ ai, kể cả người tự xưng là nhân viên hỗ trợ.
              </InfoCard>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-lv-border pb-2 last:border-0">
      <dt className="text-small text-lv-muted">{label}</dt>
      <dd className="lv-price text-body-strong text-lv-text">{value}</dd>
    </div>
  );
}
