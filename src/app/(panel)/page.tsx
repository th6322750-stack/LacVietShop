import type { Metadata } from "next";
import Image from "next/image";
import {
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import { AssetImage } from "@/components/blocks/AssetImage";
import { SectionCard, StatCard } from "@/components/blocks/Cards";
import { PlatformTile, ProductCard } from "@/components/blocks/Commerce";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { platforms, products } from "@/lib/demo/catalog";
import { demoBrand } from "@/lib/demo/config";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: demoBrand.tagline,
};

/**
 * Icon riêng của Lạc Việt (bộ Mẫu 10). Ảnh đã có nền pastel sẵn nên thẻ KPI
 * không bọc thêm khung nữa, tránh hai lớp nền chồng nhau.
 */
const metricIcons = [
  "/assets/icons/nen_tang_phuc_vu.webp",
  "/assets/icons/dich_vu_dang_ban.webp",
  "/assets/icons/san_pham_premium.webp",
];

const commitments = [
  {
    title: "Nguồn tương tác thật",
    detail: "Ưu tiên nguồn người dùng Việt, hạn chế tụt và có bảo hành rõ ràng theo từng máy chủ.",
    icon: "/assets/icons/nguon_tuong_tac_that.webp",
  },
  {
    title: "Xử lý tự động",
    detail: "Đơn được đẩy vào hàng đợi ngay sau khi tạo, theo dõi tiến độ theo thời gian thực.",
    icon: "/assets/icons/xu_ly_tu_dong.webp",
  },
  {
    title: "Giá minh bạch",
    detail: "Đơn giá và giới hạn hiển thị rõ trước khi đặt, không phát sinh phí ẩn.",
    icon: "/assets/icons/gia_minh_bach.webp",
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

/**
 * Ba con số trên trang chủ. Đếm thẳng từ danh mục đang bán nên luôn đúng —
 * trước đây là số lượt/đơn/khách nghĩ ra, mà bịa số với khách thì không được.
 */
const catalogMetrics = [
  { key: "platforms", label: "Nền tảng phục vụ", value: platforms.length, suffix: "nền tảng" },
  {
    key: "services",
    label: "Dịch vụ đang bán",
    value: platforms.reduce((n, x) => n + x.services.length, 0),
    suffix: "dịch vụ",
  },
  { key: "products", label: "Sản phẩm premium", value: products.length, suffix: "sản phẩm" },
];

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
        <div className="relative p-6 sm:p-8 xl:p-10">
          <div className="max-w-3xl">
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
                  <Image src={c.icon} alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
                  <dt className="text-body-strong text-lv-navy-700">{c.title}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Quy mô danh mục — đếm thẳng từ danh mục đang bán, không phải số ước lượng. */}
      <section aria-label="Quy mô danh mục" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalogMetrics.map((m, i) => (
          <StatCard
            key={m.key}
            label={m.label}
            value={formatNumber(m.value)}
            suffix={m.suffix}
            iconBare
            icon={<Image src={metricIcons[i]} alt="" width={56} height={56} className="h-14 w-14" />}
          />
        ))}
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

    </div>
  );
}
