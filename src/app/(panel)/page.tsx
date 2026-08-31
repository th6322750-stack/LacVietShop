import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconBolt,
  IconCoins,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { AssetImage } from "@/components/blocks/AssetImage";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { PlatformTile, ProductCard } from "@/components/blocks/Commerce";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { platforms, products } from "@/lib/demo/catalog";
import { homeMetrics, notices } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: demoBrand.tagline,
};

const metricIcons = [IconClipboardCheck, IconBolt, IconUsers];

const commitments = [
  {
    title: "Nguồn tương tác thật",
    detail: "Ưu tiên nguồn người dùng Việt, hạn chế tụt và có bảo hành rõ ràng theo từng máy chủ.",
    icon: IconShieldCheck,
  },
  {
    title: "Xử lý tự động",
    detail: "Đơn được đẩy vào hàng đợi ngay sau khi tạo, theo dõi tiến độ theo thời gian thực.",
    icon: IconBolt,
  },
  {
    title: "Giá minh bạch",
    detail: "Đơn giá và giới hạn hiển thị rõ trước khi đặt, không phát sinh phí ẩn.",
    icon: IconCoins,
  },
];

/**
 * Nền tảng đưa lên trang chủ: ưu tiên dịch vụ trong nước, xếp theo số nhóm dịch
 * vụ nhiều nhất. Đổ hết 23 nền tảng ra đây thì rối và tên bị cắt cụt.
 */
const featuredPlatforms = [...platforms]
  .sort((a, b) => {
    if (a.region !== b.region) return a.region === "vn" ? -1 : 1;
    return b.services.length - a.services.length;
  })
  .slice(0, 8);

export default function HomePage() {
  const featured = products.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero — nền sáng/ngà, không dùng shell tối (PROJECT_HANDOFF §8). */}
      <section className="relative overflow-hidden rounded-panel border border-lv-border-gold bg-lv-surface-soft">
        <AssetImage
          assetKey="decor.dongSonPattern"
          decorative
          rounded="none"
          className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-transparent !object-cover opacity-[0.06]"
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-12 lg:items-center xl:p-10">
          <div className="lg:col-span-7">
            <Badge tone="gold" icon={<IconSparkles size={14} />}>
              {demoBrand.name}
            </Badge>
            <h1 className="mt-3 text-h1-m text-lv-text xl:text-h1">{demoBrand.tagline}</h1>
            <p className="mt-3 max-w-xl text-body text-lv-muted">
              Nền tảng tăng trưởng số cho thương hiệu Việt: dịch vụ tăng tương tác đa nền tảng, kho tài
              khoản premium chính hãng và theo dõi tiến độ đơn trong cùng một bảng điều khiển.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton href="/services" size="lg" icon={<IconArrowRight size={18} />}>
                Tạo đơn ngay
              </LinkButton>
              <LinkButton href="/products" size="lg" variant="secondary">
                Xem tài khoản Premium
              </LinkButton>
            </div>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {commitments.map((c) => (
                <div key={c.title} className="flex items-center gap-2">
                  <c.icon size={18} className="text-lv-gold-600" aria-hidden />
                  <dt className="text-body-strong text-lv-navy-700">{c.title}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5">
            <AssetImage
              assetKey="home.hero.brandVisual"
              className="h-48 w-full sm:h-60 lg:h-64"
              rounded="panel"
              showLabel
            />
          </div>
        </div>
      </section>

      {/* 4 chỉ số */}
      <section aria-label="Chỉ số hoạt động" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {homeMetrics.map((m, i) => {
          const Icon = metricIcons[i];
          return (
            <StatCard
              key={m.key}
              label={m.label}
              value={formatNumber(m.value)}
              suffix={m.suffix}
              icon={<Icon size={20} />}
              trend={m.trend}
              tone={i % 2 === 0 ? "gold" : "navy"}
            />
          );
        })}
      </section>

      {/* Dịch vụ nổi bật theo nền tảng — chỉ 8 nền tảng trong nước nhiều dịch vụ
          nhất; xem đủ 23 nền tảng ở trang Dịch vụ. */}
      <SectionCard
        title="Dịch vụ nổi bật"
        description={`${featuredPlatforms.length} nền tảng được đặt nhiều nhất · xem đủ ${platforms.length} nền tảng ở trang Dịch vụ.`}
        action={
          <LinkButton href="/services" variant="secondary" size="sm">
            Tất cả dịch vụ
          </LinkButton>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {featuredPlatforms.map((p) => (
            <PlatformTile
              key={p.id}
              name={p.name}
              assetKey={p.assetKey}
              href={`/services?platform=${p.id}`}
              count={p.services.length}
            />
          ))}
        </div>
      </SectionCard>

      {/* Sản phẩm premium nổi bật */}
      <SectionCard
        title="Tài khoản Premium bán chạy"
        description="Kích hoạt nhanh, bảo hành theo thời hạn gói."
        action={
          <LinkButton href="/products" variant="secondary" size="sm">
            Xem tất cả
          </LinkButton>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Giới thiệu */}
        <SectionCard
          title={`Về ${demoBrand.name}`}
          className="lg:col-span-7"
          description="Đối tác truyền thông số đồng hành cùng thương hiệu Việt."
        >
          <p className="text-body text-lv-navy-700">
            Lạc Việt Media Agency cung cấp giải pháp tăng trưởng cho doanh nghiệp và nhà sáng tạo nội dung:
            từ tăng tương tác mạng xã hội, kho tài khoản premium chính hãng, tới theo dõi đơn hàng và
            dòng tiền theo thời gian thực.
          </p>
          <ul className="mt-4 space-y-3">
            {commitments.map((c) => (
              <li key={c.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-lv-border-gold bg-lv-gold-50 text-lv-gold-700">
                  <c.icon size={18} />
                </span>
                <span>
                  <span className="block text-body-strong text-lv-text">{c.title}</span>
                  <span className="block text-small text-lv-muted">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Thông báo mới nhất */}
        <SectionCard
          title="Thông báo mới nhất"
          className="lg:col-span-5"
          description="Cập nhật vận hành và chính sách."
        >
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="rounded-card border border-lv-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={n.tone === "success" ? "success" : n.tone === "warning" ? "warning" : "info"}>
                    {n.tone === "success" ? "Vận hành" : n.tone === "warning" ? "Lưu ý" : "Ưu đãi"}
                  </Badge>
                  {n.pinned ? <Badge tone="gold">Ghim</Badge> : null}
                  <span className="ml-auto text-small text-lv-muted">{formatDate(n.publishedAt)}</span>
                </div>
                <p className="mt-2 text-body-strong text-lv-text">{n.title}</p>
                <p className="mt-1 text-small text-lv-muted">{n.body}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/history"
            className="mt-3 inline-flex items-center gap-1 text-small-strong text-lv-gold-700 hover:underline"
          >
            Xem lịch sử hoạt động
            <IconArrowRight size={15} />
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
