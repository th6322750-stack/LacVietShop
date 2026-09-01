"use client";

import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard } from "@/components/blocks/Cards";
import { LinkButton } from "@/components/ui/Button";

/**
 * Màn hình mời đăng nhập cho các trang gắn với tài khoản.
 *
 * Trang nào hiện đơn hàng, tiền hay thông tin cá nhân thì khi chưa đăng nhập
 * phải hiện đúng cái này — tuyệt đối không lấy dữ liệu mẫu ra lấp chỗ trống.
 */
export function SignInGate({
  title,
  description,
  next,
  reason,
}: {
  title: string;
  description: string;
  /** Đăng nhập xong quay lại đúng trang đang đứng. */
  next: string;
  reason: string;
}) {
  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: title }]}
      />
      <SectionCard title="Cần đăng nhập">
        <p className="text-body text-lv-navy-700">{reason}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/login?next=${encodeURIComponent(next)}`}>Đăng nhập</LinkButton>
          <LinkButton href={`/register?next=${encodeURIComponent(next)}`} variant="secondary">
            Tạo tài khoản
          </LinkButton>
        </div>
      </SectionCard>
    </div>
  );
}
