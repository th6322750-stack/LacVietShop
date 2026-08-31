"use client";

import * as React from "react";
import Link from "next/link";
import { IconMail } from "@tabler/icons-react";
import { InfoCard } from "@/components/blocks/Cards";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { AuthShell } from "./AuthShell";

/**
 * Màn quên mật khẩu.
 *
 * Không giả vờ đã gửi email: bản dựng chưa có backend gửi thư (gap auth.provider),
 * nên nói thẳng là chưa gửi được và chỉ hướng dẫn cách xử lý hiện tại.
 */
export function ForgotPasswordView() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <AuthShell
      title="Quên mật khẩu"
      description="Khôi phục mật khẩu cho tài khoản Lạc Việt"
      footer={
        <p className="text-center text-small text-lv-muted">
          Nhớ ra rồi?{" "}
          <Link href="/login" className="font-semibold text-lv-gold-700 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="mt-5 space-y-4"
        noValidate
      >
        <div>
          <Label htmlFor="email" required>
            Email đã đăng ký
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ban@vidu.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
          />
        </div>

        <Button type="submit" block size="lg" icon={<IconMail size={17} />} disabled={!email.trim()}>
          Gửi yêu cầu khôi phục
        </Button>

        {sent ? (
          <InfoCard title="Chưa gửi được email" tone="warning">
            Hệ thống chưa nối dịch vụ gửi thư nên yêu cầu này không đi đâu cả. Trong bản dựng hiện tại, tài
            khoản nằm trong trình duyệt của bạn: nếu quên mật khẩu, cách duy nhất là đăng ký một tài khoản mới.
            Khi có backend thật, đường dẫn đặt lại mật khẩu sẽ được gửi tới email trên.
          </InfoCard>
        ) : null}
      </form>
    </AuthShell>
  );
}
