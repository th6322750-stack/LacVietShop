"use client";

import * as React from "react";
import Link from "next/link";
import { IconCircleCheck, IconClock, IconHeadset, IconPackageExport, IconRefresh, IconX } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard, InfoCard } from "@/components/blocks/Cards";
import { AssetImage } from "@/components/blocks/AssetImage";
import { EmptyState } from "@/components/blocks/States";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { CopyButton } from "@/components/blocks/Media";
import { findProduct } from "@/lib/demo/catalog";
import { demoBrand } from "@/lib/demo/config";
import { useCustomerAuth } from "@/lib/customer/auth";
import { formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Sản phẩm đã mua.
 *
 * Đơn premium là hàng bên mình giao tay nên có hai trạng thái khách cần thấy rõ:
 * đang chờ giao (đã trả tiền, chưa có thông tin tài khoản) và đã giao (hiện đủ
 * thông tin đăng nhập). Không giả vờ có hàng khi chưa giao.
 */

interface Credential {
  label: string;
  value: string;
}

interface Order {
  id: string;
  productSlug: string;
  productName: string;
  packageName: string;
  amount: number;
  status: "pending" | "delivered" | "canceled";
  createdAt: string;
  deliveredAt?: string | null;
  credentials: Credential[];
  note?: string | null;
}

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "delivered", label: "Đã nhận" },
  { id: "pending", label: "Chờ giao" },
  { id: "canceled", label: "Đã huỷ" },
];

export function PurchasedView() {
  const { session, ready } = useCustomerAuth();
  const [tab, setTab] = React.useState("all");
  const [orders, setOrders] = React.useState<Order[] | null>(null);

  const load = React.useCallback(async () => {
    if (!session) return;
    const res = await fetch("/api/products/orders")
      .then((r) => r.json())
      .catch(() => null);
    setOrders(res?.ok ? (res.orders ?? []) : []);
  }, [session]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Còn đơn chờ giao thì hỏi lại định kỳ để khách thấy ngay khi được giao.
  const hasPending = Boolean(orders?.some((o) => o.status === "pending"));
  React.useEffect(() => {
    if (!hasPending) return;
    const t = setInterval(() => void load(), 15_000);
    return () => clearInterval(t);
  }, [hasPending, load]);

  if (ready && !session) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Sản phẩm đã mua"
          description="Tài khoản premium bạn đã mua và thông tin đăng nhập."
          breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm đã mua" }]}
        />
        <SectionCard title="Cần đăng nhập">
          <p className="text-body text-lv-navy-700">Đơn hàng gắn với tài khoản của bạn, đăng nhập để xem.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/login?next=/purchased">Đăng nhập</LinkButton>
            <LinkButton href="/register?next=/purchased" variant="secondary">
              Tạo tài khoản
            </LinkButton>
          </div>
        </SectionCard>
      </div>
    );
  }

  const all = orders ?? [];
  const counts = {
    all: all.length,
    delivered: all.filter((o) => o.status === "delivered").length,
    pending: all.filter((o) => o.status === "pending").length,
    canceled: all.filter((o) => o.status === "canceled").length,
  };
  const shown = tab === "all" ? all : all.filter((o) => o.status === tab);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sản phẩm đã mua"
        description="Tài khoản premium bạn đã mua và thông tin đăng nhập."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm đã mua" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void load()}>
            Làm mới
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng đơn" value={String(counts.all)} suffix="đơn" tone="navy" icon={<IconPackageExport size={20} />} />
        <StatCard label="Đã nhận" value={String(counts.delivered)} suffix="đơn" tone="success" icon={<IconCircleCheck size={20} />} />
        <StatCard label="Chờ giao" value={String(counts.pending)} suffix="đơn" tone="gold" icon={<IconClock size={20} />} />
        <StatCard label="Đã huỷ" value={String(counts.canceled)} suffix="đơn" tone="info" icon={<IconX size={20} />} />
      </div>

      {counts.pending > 0 ? (
        <InfoCard title="Có đơn đang chờ giao" tone="warning" icon={<IconClock size={16} />}>
          Tài khoản premium được giao tay nên cần chút thời gian. Trang này tự cập nhật, giao xong thông tin đăng
          nhập sẽ hiện ngay bên dưới.
        </InfoCard>
      ) : null}

      <Tabs
        ariaLabel="Lọc đơn premium"
        value={tab}
        onChange={setTab}
        items={tabs.map((t) => ({ ...t, count: counts[t.id as keyof typeof counts] }))}
      />

      {orders === null ? (
        <div className="lv-card p-6">
          <span className="lv-skeleton block h-24 w-full rounded-card" />
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          title="Chưa có đơn nào ở mục này"
          description="Mua tài khoản premium ở trang Sản phẩm Premium."
          action={<LinkButton href="/products">Xem sản phẩm</LinkButton>}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      <SupportCard
        title="Cần hỗ trợ đơn premium?"
        description={`Khung giờ trực: ${demoBrand.supportHours}.`}
        channels={demoBrand.supportChannels.map((c) => ({ label: c.label, value: c.value }))}
        action={
          <Button variant="secondary" block icon={<IconHeadset size={16} />}>
            Gửi yêu cầu bảo hành
          </Button>
        }
      />
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const product = findProduct(order.productSlug);

  return (
    <SectionCard
      title={order.productName}
      description={order.packageName}
      action={
        order.status === "delivered" ? (
          <Badge tone="success">Đã nhận</Badge>
        ) : order.status === "pending" ? (
          <Badge tone="warning">Chờ giao</Badge>
        ) : (
          <Badge tone="danger">Đã huỷ</Badge>
        )
      }
    >
      <div className="flex items-start gap-3">
        <AssetImage
          assetKey={product?.assetKey ?? "brand.logoHorizontal"}
          className="h-12 w-12 shrink-0"
          rounded="card"
        />
        <div className="min-w-0 flex-1 text-small text-lv-muted">
          <p>
            Đặt lúc {formatDateTime(order.createdAt)} ·{" "}
            <span className="lv-price text-body-strong text-lv-text">{formatMoney(order.amount)}</span>
          </p>
          {order.deliveredAt ? <p className="mt-0.5">Giao lúc {formatDateTime(order.deliveredAt)}</p> : null}
          {product ? (
            <p className="mt-0.5">
              <Link href={`/products/${product.slug}`} className="text-lv-gold-700 hover:underline">
                Xem chi tiết gói
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      {order.status === "delivered" ? (
        <div className="mt-4 space-y-2">
          {order.credentials.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-3 rounded-control border border-lv-border bg-lv-bg px-3 py-2"
            >
              <span className="shrink-0 text-small text-lv-muted">{c.label}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="lv-price truncate text-body-strong text-lv-text">{c.value}</span>
                <CopyButton value={c.value} label={c.label} />
              </span>
            </div>
          ))}
          {order.note ? (
            <p className="rounded-control border border-lv-border-gold bg-lv-gold-50 px-3 py-2 text-small text-lv-gold-700">
              {order.note}
            </p>
          ) : null}
        </div>
      ) : order.status === "pending" ? (
        <p className="mt-4 rounded-control border border-lv-warning/35 bg-lv-warning/[0.07] px-3 py-2 text-small text-lv-navy-700">
          Đã thanh toán, đang chuẩn bị tài khoản cho bạn. Thông tin đăng nhập sẽ hiện ngay tại đây.
        </p>
      ) : (
        <p className="mt-4 rounded-control border border-lv-border bg-lv-bg px-3 py-2 text-small text-lv-muted">
          Đơn đã huỷ, tiền đã hoàn lại vào số dư. {order.note ?? ""}
        </p>
      )}
    </SectionCard>
  );
}
