"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldMessage, Input, Label } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useCustomerAuth } from "@/lib/customer/auth";
import { AuthShell } from "./AuthShell";

const schema = z
  .object({
    name: z.string().trim().min(2, "Nhập họ tên đầy đủ."),
    username: z
      .string()
      .trim()
      .min(4, "Tên đăng nhập tối thiểu 4 ký tự.")
      .max(24, "Tên đăng nhập tối đa 24 ký tự.")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ dùng chữ không dấu, số và dấu gạch dưới."),
    email: z.string().trim().email("Email không hợp lệ."),
    phone: z
      .string()
      .trim()
      .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0."),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự."),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý điều khoản sử dụng." }) }),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Hai lần nhập mật khẩu không khớp.",
  });

type FormValues = z.input<typeof schema>;

export function RegisterView() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { register: createAccount, session, ready } = useCustomerAuth();
  const [submitting, setSubmitting] = React.useState(false);

  const next = params.get("next") || "/";

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onBlur" });

  React.useEffect(() => {
    if (ready && session) router.replace(next);
  }, [ready, session, router, next]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await createAccount({
      name: values.name,
      username: values.username,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    setSubmitting(false);

    if (!res.ok) {
      if (res.field) setError(res.field, { message: res.error });
      else toast.push({ tone: "error", title: "Không tạo được tài khoản", description: res.error });
      return;
    }
    toast.push({ tone: "success", title: "Đã tạo tài khoản", description: "Bạn đã được đăng nhập." });
    router.replace(next);
  }

  const password = watch("password") ?? "";

  return (
    <AuthShell
      title="Tạo tài khoản Lạc Việt"
      description="Điền thông tin bên dưới để bắt đầu đặt dịch vụ"
      footer={
        <p className="text-center text-small text-lv-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-lv-gold-700 hover:underline">
            Đăng nhập
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        <div>
          <Label htmlFor="name" required>
            Họ và tên
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            tone={errors.name ? "invalid" : "default"}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldMessage>{errors.name?.message}</FieldMessage>
        </div>

        <div>
          <Label htmlFor="username" required hint="dùng để đăng nhập">
            Tên đăng nhập
          </Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="nguyenvana"
            tone={errors.username ? "invalid" : "default"}
            aria-invalid={!!errors.username}
            {...register("username")}
          />
          <FieldMessage>{errors.username?.message}</FieldMessage>
        </div>

        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ban@vidu.com"
            tone={errors.email ? "invalid" : "default"}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldMessage>{errors.email?.message}</FieldMessage>
        </div>

        <div>
          <Label htmlFor="phone" required>
            Số điện thoại
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0912345678"
            tone={errors.phone ? "invalid" : "default"}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldMessage>{errors.phone?.message}</FieldMessage>
        </div>

        <div>
          <Label htmlFor="password" required hint="tối thiểu 8 ký tự">
            Mật khẩu
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            tone={errors.password ? "invalid" : "default"}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldMessage>{errors.password?.message}</FieldMessage>
          {password.length > 0 && !errors.password ? <PasswordMeter value={password} /> : null}
        </div>

        <div>
          <Label htmlFor="confirm" required>
            Nhập lại mật khẩu
          </Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            tone={errors.confirm ? "invalid" : "default"}
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
          <FieldMessage>{errors.confirm?.message}</FieldMessage>
        </div>

        <div>
          <Checkbox id="terms" label="Tôi đồng ý với điều khoản sử dụng và không dùng dịch vụ cho mục đích vi phạm pháp luật." {...register("terms")} />
          <FieldMessage>{errors.terms?.message}</FieldMessage>
        </div>

        <Button type="submit" block size="lg" loading={submitting} icon={<IconUserPlus size={17} />}>
          {submitting ? "Đang tạo tài khoản…" : "Đăng ký"}
        </Button>
      </form>
    </AuthShell>
  );
}

/** Thước đo sức mạnh mật khẩu — chỉ để nhắc, không chặn. */
function PasswordMeter({ value }: { value: string }) {
  const score =
    Number(value.length >= 8) +
    Number(value.length >= 12) +
    Number(/[A-Z]/.test(value)) +
    Number(/[0-9]/.test(value)) +
    Number(/[^A-Za-z0-9]/.test(value));

  const level = score <= 2 ? 0 : score === 3 ? 1 : score === 4 ? 2 : 3;
  const labels = ["Yếu", "Trung bình", "Khá", "Mạnh"];
  const colors = ["bg-lv-danger", "bg-lv-warning", "bg-lv-info", "bg-lv-success"];

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <span className="flex h-1.5 flex-1 gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-full flex-1 rounded-pill ${i <= level ? colors[level] : "bg-lv-border"}`} />
        ))}
      </span>
      <span className="text-small text-lv-muted">{labels[level]}</span>
    </div>
  );
}
