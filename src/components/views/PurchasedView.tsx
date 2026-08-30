"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconCircleCheck,
  IconClockExclamation,
  IconEye,
  IconEyeOff,
  IconHeadset,
  IconRefresh,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard } from "@/components/blocks/Cards";
import { AssetImage } from "@/components/blocks/AssetImage";
import { EmptyState } from "@/components/blocks/States";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { CopyButton } from "@/components/blocks/Media";
import { purchasedItems } from "@/lib/demo/data";
import { findProduct } from "@/lib/demo/catalog";
import { demoBrand } from "@/lib/demo/config";
import { cn, daysUntil, formatDate } from "@/lib/utils";
import type { PurchasedItem } from "@/types";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang dùng" },
  { id: "expiring", label: "Sắp hết hạn" },
  { id: "expired", label: "Đã hết hạn" },
];

export function PurchasedView() {
  const [tab, setTab] = React.useState("all");

  const counts = React.useMemo(
    () => ({
      all: purchasedItems.length,
      active: purchasedItems.filter((i) => i.status === "active").length,
      expiring: purchasedItems.filter((i) => i.status === "expiring").length,
      expired: purchasedItems.filter((i) => i.status === "expired").length,
    }),
    [],
  );

  const items = purchasedItems.filter((i) => (tab === "all" ? true : i.status === tab));
  const activeIncludingRenewal = counts.active + counts.expiring;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sản phẩm đã mua"
        description="Quản lý tài khoản premium đang dùng, hạn sử dụng và thông tin bảo hành."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm đã mua" }]}
        action={
          <LinkButton href="/products" variant="secondary">
            Mua thêm sản phẩm
          </LinkButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Đang hoạt động"
          value={activeIncludingRenewal}
          suffix="mục"
          tone="success"
          icon={<IconCircleCheck size={20} />}
          hint="Bao gồm sản phẩm đang dùng và sắp đến kỳ gia hạn"
        />
        <StatCard
          label="Sắp gia hạn"
          value={counts.expiring}
          suffix="mục"
          tone="gold"
          icon={<IconClockExclamation size={20} />}
          hint="Nên gia hạn trước ngày hết hạn để giữ nguyên tài khoản"
        />
      </div>

      <Tabs
        ariaLabel="Trạng thái sản phẩm"
        value={tab}
        onChange={setTab}
        items={tabs.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
      />

      {items.length === 0 ? (
        <SectionCard>
          <EmptyState
            title="Chưa có sản phẩm nào ở trạng thái này"
            description="Khi bạn mua tài khoản premium, sản phẩm sẽ xuất hiện tại đây."
            action={<LinkButton href="/products">Xem sản phẩm</LinkButton>}
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <PurchasedCard key={item.id} item={item} />
          ))}

          {tab === "all" ? (
            <SupportCard
              title="Gặp vấn đề với tài khoản?"
              description="Nếu gặp lỗi đăng nhập, rớt gói hoặc cần đối soát bảo hành, gửi yêu cầu ngay tại đây."
              channels={demoBrand.supportChannels.map((c) => ({ label: c.label, value: c.value }))}
              action={
                <Button variant="secondary" block icon={<IconHeadset size={16} />}>
                  Gửi yêu cầu hỗ trợ
                </Button>
              }
            />
          ) : null}
        </div>
      )}

      <SectionCard title="Quy tắc sử dụng">
        <ul className="grid gap-2 text-small text-lv-navy-700 md:grid-cols-2">
          <li>· Không chia sẻ thông tin đăng nhập cho bên thứ ba.</li>
          <li>· Không tự ý đổi mật khẩu hoặc email khôi phục khi chưa được hướng dẫn.</li>
          <li>· Giữ nguyên số thiết bị đăng nhập theo mô tả của gói.</li>
          <li>· Báo lỗi ngay trong thời gian bảo hành để được xử lý miễn phí.</li>
        </ul>
      </SectionCard>
    </div>
  );
}

function PurchasedCard({ item }: { item: PurchasedItem }) {
  const toast = useToast();
  const [revealed, setRevealed] = React.useState(false);
  const product = findProduct(item.productSlug);
  const remaining = daysUntil(item.expiresAt);

  const statusBadge =
    item.status === "active" ? (
      <Badge tone="success">Đang dùng</Badge>
    ) : item.status === "expiring" ? (
      <Badge tone="warning">Còn {Math.max(0, remaining)} ngày</Badge>
    ) : (
      <Badge tone="danger">Đã hết hạn</Badge>
    );

  return (
    <article
      className={cn(
        "lv-card p-5",
        item.status === "expired" && "opacity-90",
        item.status === "expiring" && "border-lv-warning/40",
      )}
    >
      <div className="flex items-start gap-3">
        <AssetImage assetKey={product?.assetKey ?? "brand.markCompact"} className="h-12 w-12 shrink-0" rounded="card" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-card-title text-lv-text">{item.productName}</h3>
            {statusBadge}
          </div>
          <p className="mt-0.5 text-small text-lv-muted">{item.packageName}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-card border border-lv-border bg-lv-bg p-3">
        <div>
          <dt className="text-small text-lv-muted">Ngày mua</dt>
          <dd className="text-body-strong text-lv-text">{formatDate(item.purchasedAt)}</dd>
        </div>
        <div>
          <dt className="text-small text-lv-muted">Hết hạn</dt>
          <dd className="text-body-strong text-lv-text">{formatDate(item.expiresAt)}</dd>
        </div>
      </dl>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-label text-lv-navy-700">Thông tin tài khoản</p>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="inline-flex items-center gap-1 text-small-strong text-lv-gold-700 hover:underline"
            aria-pressed={revealed}
          >
            {revealed ? <IconEyeOff size={15} /> : <IconEye size={15} />}
            {revealed ? "Ẩn bớt" : "Hiện thông tin"}
          </button>
        </div>
        {item.credential.map((c) => (
          <div key={c.label} className="flex items-center justify-between gap-3 rounded-control border border-lv-border px-3 py-2">
            <span className="text-small text-lv-muted">{c.label}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-body-strong text-lv-text">
                {/* Giá trị nhạy cảm mặc định che (§13). */}
                {c.masked && !revealed ? "••••••••••" : c.value}
              </span>
              {revealed ? <CopyButton value={c.value} label="Chép" /> : null}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-small text-lv-muted">{item.warrantyNote}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          icon={<IconRefresh size={16} />}
          onClick={() =>
            toast.push({
              tone: "success",
              title: "Đã tạo yêu cầu gia hạn",
              description: "Yêu cầu mô phỏng bằng dữ liệu DEMO.",
            })
          }
        >
          Gia hạn
        </Button>
        {product ? (
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-8 items-center rounded-control border border-lv-border px-3 text-small-strong text-lv-navy-700 transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50"
          >
            Xem sản phẩm
          </Link>
        ) : null}
      </div>
    </article>
  );
}
