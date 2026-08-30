"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconDeviceFloppy,
  IconKey,
  IconLock,
  IconShieldCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, InfoCard } from "@/components/blocks/Cards";
import { AssetImage } from "@/components/blocks/AssetImage";
import { CopyButton } from "@/components/blocks/Media";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select, Switch } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { account, activity } from "@/lib/demo/data";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

const profileSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị tối thiểu 2 ký tự.").max(60),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().regex(/^0\d{9}$/u, "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0."),
  timezone: z.string(),
});

const passwordSchema = z
  .object({
    current: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự."),
    next: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự."),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Xác nhận mật khẩu chưa khớp." });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function AccountView() {
  const toast = useToast();
  const [twoFactor, setTwoFactor] = React.useState(account.twoFactorEnabled);
  const [emailNotice, setEmailNotice] = React.useState(true);
  const [orderNotice, setOrderNotice] = React.useState(true);
  const [marketing, setMarketing] = React.useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: account.displayName,
      // Giá trị thật được che (§13); người dùng nhập lại khi cần đổi.
      email: "",
      phone: "",
      timezone: "Asia/Ho_Chi_Minh",
    },
    mode: "onBlur",
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
    mode: "onBlur",
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thông tin tài khoản"
        description="Quản lý hồ sơ, bảo mật và tuỳ chọn hiển thị của tài khoản Lạc Việt."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Tài khoản" }]}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Cột hồ sơ 4/12 */}
        <div className="min-w-0 space-y-4 xl:col-span-4">
          <SectionCard>
            <div className="flex flex-col items-center text-center">
              <AssetImage assetKey="account.defaultAvatar" className="h-20 w-20" rounded="full" label={account.displayName} />
              <p className="mt-3 text-h3 text-lv-text">{account.displayName}</p>
              <p className="text-small text-lv-muted">@{account.username}</p>

              <div className="mt-4 w-full rounded-card border border-lv-border-gold bg-lv-gold-50 p-3 text-left">
                <p className="text-small text-lv-gold-700">Số dư khả dụng</p>
                <p className="lv-price text-metric text-lv-gold-700">{formatMoney(account.balance)}</p>
              </div>

              <dl className="mt-4 w-full space-y-2 text-left">
                <Row label="Email" value={account.emailMasked} />
                <Row label="Số điện thoại" value={account.phoneMasked} />
                <Row label="Tham gia" value={formatDate(account.joinedAt)} />
                <Row label="Tổng đã chi" value={formatMoney(account.totalSpent)} />
              </dl>
            </div>
          </SectionCard>

          <SectionCard title="Hoạt động gần đây" padded={false}>
            <ul className="divide-y divide-lv-border">
              {activity.slice(0, 5).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <p className="text-body-strong text-lv-text">{a.title}</p>
                  <p className="text-small text-lv-muted">{a.detail}</p>
                  <p className="mt-0.5 text-small text-lv-muted">{formatDateTime(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Cột cài đặt 8/12 */}
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <SectionCard title="Thông tin cá nhân" description="Cập nhật thông tin liên hệ của bạn.">
            <form
              onSubmit={profileForm.handleSubmit(() =>
                toast.push({
                  tone: "success",
                  title: "Đã lưu thông tin (DEMO)",
                  description: "Chưa kết nối backend nên thay đổi không được lưu lâu dài.",
                }),
              )}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="displayName" required>
                  Tên hiển thị
                </Label>
                <Input
                  id="displayName"
                  tone={profileForm.formState.errors.displayName ? "invalid" : "default"}
                  {...profileForm.register("displayName")}
                />
                <FieldMessage>{profileForm.formState.errors.displayName?.message}</FieldMessage>
              </div>
              <div>
                <Label htmlFor="email" hint={`hiện tại: ${account.emailMasked}`}>
                  Email mới
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nhap@email.com"
                  tone={profileForm.formState.errors.email ? "invalid" : "default"}
                  {...profileForm.register("email")}
                />
                <FieldMessage>{profileForm.formState.errors.email?.message}</FieldMessage>
              </div>
              <div>
                <Label htmlFor="phone" hint={`hiện tại: ${account.phoneMasked}`}>
                  Số điện thoại mới
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
              <div>
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select id="timezone" {...profileForm.register("timezone")}>
                  <option value="Asia/Ho_Chi_Minh">(GMT+7) Việt Nam</option>
                  <option value="Asia/Singapore">(GMT+8) Singapore</option>
                  <option value="Asia/Tokyo">(GMT+9) Tokyo</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" icon={<IconDeviceFloppy size={17} />}>
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard title="Bảo mật" description="Mật khẩu và xác thực hai lớp.">
            <form
              onSubmit={passwordForm.handleSubmit(() => {
                toast.push({
                  tone: "success",
                  title: "Đã đổi mật khẩu (DEMO)",
                  description: "Thao tác mô phỏng, không gửi tới hệ thống xác thực thật.",
                });
                passwordForm.reset();
              })}
              className="grid gap-4 sm:grid-cols-3"
            >
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
                <Button type="submit" variant="secondary" icon={<IconLock size={17} />}>
                  Đổi mật khẩu
                </Button>
              </div>
            </form>

            <div className="mt-5 space-y-4 border-t border-lv-border pt-5">
              <Switch
                id="twofa"
                checked={twoFactor}
                onCheckedChange={(v) => {
                  setTwoFactor(v);
                  toast.push({
                    tone: v ? "success" : "warning",
                    title: v ? "Đã bật xác thực hai lớp" : "Đã tắt xác thực hai lớp",
                    description: "Trạng thái mô phỏng trong bản dựng DEMO.",
                  });
                }}
                label="Xác thực hai lớp (2FA)"
                description="Yêu cầu mã từ ứng dụng xác thực mỗi khi đăng nhập trên thiết bị mới."
              />

              {twoFactor ? (
                <InfoCard title="2FA đang bật" tone="success" icon={<IconShieldCheck size={16} />}>
                  Mã khôi phục chỉ hiển thị một lần khi thiết lập. Không chia sẻ mã cho bất kỳ ai, kể cả
                  người tự xưng là nhân viên hỗ trợ.
                </InfoCard>
              ) : (
                <InfoCard title="Tài khoản chưa được bảo vệ hai lớp" tone="warning" icon={<IconShieldLock size={16} />}>
                  Bật 2FA để hạn chế rủi ro khi mật khẩu bị lộ.
                </InfoCard>
              )}

              <div className="rounded-card border border-lv-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-body-strong text-lv-text">
                      <IconKey size={16} className="text-lv-gold-600" />
                      Khoá API cá nhân
                    </p>
                    <p className="mt-0.5 text-small text-lv-muted">
                      Mặc định che. Chỉ hiển thị đầy đủ khi bạn tạo khoá mới.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="rounded-control border border-lv-border bg-lv-bg px-2 py-1 text-small text-lv-navy-700">
                      {account.apiTokenMasked}
                    </code>
                    <CopyButton value={account.apiTokenMasked} label="Chép" />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tuỳ chọn hiển thị" description="Cách bạn nhận thông báo từ hệ thống.">
            <div className="space-y-4">
              <Switch
                id="notice-email"
                checked={emailNotice}
                onCheckedChange={setEmailNotice}
                label="Nhận email thông báo"
                description="Biến động số dư, đơn hoàn thành và cảnh báo bảo mật."
              />
              <Switch
                id="notice-order"
                checked={orderNotice}
                onCheckedChange={setOrderNotice}
                label="Thông báo trạng thái đơn"
                description="Báo ngay khi đơn bắt đầu chạy hoặc hoàn thành."
              />
              <Switch
                id="notice-marketing"
                checked={marketing}
                onCheckedChange={setMarketing}
                label="Nhận thông tin ưu đãi"
                description="Chương trình khuyến mãi và sản phẩm mới."
              />
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
