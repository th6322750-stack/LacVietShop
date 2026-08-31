"use client";

import * as React from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconHeadset,
  IconShieldCheck,
  IconShoppingCartPlus,
  IconStarFilled,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, InfoCard } from "@/components/blocks/Cards";
import { OrderSummaryRow, PackageCard } from "@/components/blocks/Commerce";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { account } from "@/lib/demo/data";
import { commerceAdapter } from "@/lib/demo/config";
import { cn, formatMoney, formatNumber } from "@/lib/utils";
import type { ProductVariant } from "@/types";

/**
 * MỘT template dùng chung cho cả 8 sản phẩm premium (HANDOFF.json → productArchitecture).
 * Biến thể chỉ khác ở cấu hình dữ liệu: hero, gói, quyền lợi, FAQ, tông màu.
 */
export function ProductDetail({ product }: { product: ProductVariant }) {
  const toast = useToast();
  // Khối trưng bày mở rộng bật theo DỮ LIỆU của biến thể, không theo slug.
  const hasShowcase = Boolean(product.keyFeatures?.length);
  const firstAvailable = product.packages.find((p) => p.inStock) ?? product.packages[0];
  const [packageId, setPackageId] = React.useState(
    (product.packages.find((p) => p.highlight && p.inStock) ?? firstAvailable).id,
  );
  const [tab, setTab] = React.useState("benefits");
  const [submitting, setSubmitting] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<string | null>(product.faqs[0]?.question ?? null);

  const pkg = product.packages.find((p) => p.id === packageId) ?? firstAvailable;
  const notEnoughBalance = pkg.price > account.balance;
  const darkHero = product.heroTone === "dark";

  async function buy() {
    if (!pkg.inStock) return;
    if (notEnoughBalance) {
      toast.push({
        tone: "error",
        title: "Số dư không đủ",
        description: `Cần thêm ${formatMoney(pkg.price - account.balance)} để mua gói này.`,
      });
      return;
    }
    setSubmitting(true);
    const res = await commerceAdapter.submitOrder({
      serverId: pkg.id,
      quantity: 1,
      target: `${product.name} · ${pkg.name}`,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.push({ tone: "error", title: "Không đặt được đơn", description: res.error });
      return;
    }
    toast.push({
      tone: "success",
      title: `Đã tạo đơn ${res.orderCode}`,
      description: "Bộ phận xử lý sẽ kích hoạt gói cho bạn.",
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={product.name}
        breadcrumb={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm Premium", href: "/products" },
          { label: product.shortName },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          {/* Hero — Netflix dùng nền tối, shell vẫn sáng (§4) */}
          <section
            className={cn(
              "overflow-hidden rounded-panel border",
              darkHero ? "border-lv-navy-900 bg-lv-navy-950" : "border-lv-border-gold bg-lv-surface-soft",
            )}
          >
            <div className="relative grid gap-4 p-5 sm:p-6 lg:grid-cols-12 lg:items-center">
              {product.heroAssetKey ? (
                <AssetImage
                  assetKey={product.heroAssetKey}
                  decorative
                  rounded="none"
                  className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-transparent !object-cover opacity-10"
                />
              ) : null}
              <div className="relative min-w-0 lg:col-span-8">
                <div className="flex items-center gap-3">
                  <AssetImage assetKey={product.assetKey} className="h-14 w-14 shrink-0" rounded="card" />
                  <div className="min-w-0">
                    <h2
                      className={cn(
                        "line-clamp-3 text-h2 sm:line-clamp-2",
                        darkHero ? "text-white" : "text-lv-text",
                      )}
                    >
                      {product.name}
                    </h2>
                    <p className={cn("mt-0.5 text-body", darkHero ? "text-white/70" : "text-lv-muted")}>
                      {product.tagline}
                    </p>
                  </div>
                </div>
                <p className={cn("mt-3 line-clamp-3 text-body", darkHero ? "text-white/80" : "text-lv-navy-700")}>
                  {product.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.badges.map((b) => (
                    <Badge key={b} tone={darkHero ? "navy" : "gold"} className={darkHero ? "border-white/20" : ""}>
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative min-w-0 lg:col-span-4">
                <div
                  className={cn(
                    "rounded-card border p-4",
                    darkHero ? "border-white/15 bg-white/5" : "border-lv-border bg-lv-surface",
                  )}
                >
                  <p className={cn("text-small", darkHero ? "text-white/60" : "text-lv-muted")}>Chỉ từ</p>
                  <p className="lv-price text-h2 text-lv-gold-500">{formatMoney(product.fromPrice)}</p>
                  <p
                    className={cn(
                      "mt-2 flex items-center gap-2 text-small",
                      darkHero ? "text-white/70" : "text-lv-muted",
                    )}
                  >
                    <span className="flex items-center gap-1 text-lv-warning">
                      <IconStarFilled size={13} />
                      {product.rating.toFixed(1).replace(".", ",")}
                    </span>
                    · Đã bán {formatNumber(product.sold)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Gói sản phẩm */}
          <SectionCard title="Chọn gói phù hợp" description="Chọn thời hạn phù hợp với nhu cầu của bạn.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Chọn gói">
              {product.packages.map((p) => (
                <PackageCard key={p.id} pkg={p} selected={p.id === pkg.id} onSelect={() => setPackageId(p.id)} />
              ))}
            </div>

            {product.packages.some((p) => !p.inStock) ? (
              <p className="mt-3 flex items-center gap-1.5 text-small text-lv-warning">
                <IconAlertTriangle size={15} />
                Một số gói đang tạm hết hàng, sẽ mở bán lại khi có nguồn.
              </p>
            ) : null}
          </SectionCard>

          {hasShowcase ? (
            <>
              <div className="grid gap-4 lg:grid-cols-12">
                <SectionCard title="Tính năng chính" className="lg:col-span-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(product.keyFeatures ?? []).map((item) => (
                      <p key={item} className="flex items-center gap-2 text-small text-lv-navy-700">
                        <IconCheck size={15} className="shrink-0 text-lv-success" />
                        {item}
                      </p>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Mẫu quyền lợi" className="lg:col-span-4">
                  <div className="grid grid-cols-3 gap-2">
                    {(product.sampleSwatches?.colors ?? []).map((color) => (
                      <div
                        key={color}
                        className="aspect-[1.1/1] rounded-control border border-lv-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-center text-small-strong text-lv-gold-700">
                    {product.sampleSwatches?.caption}
                  </p>
                </SectionCard>

                <SectionCard title="Lưu ý khi nhận tài khoản" className="lg:col-span-3">
                  <ul className="space-y-2 text-small text-lv-muted">
                    {(product.receiveNotes ?? []).map((note) => (
                      <li key={note}>· {note}</li>
                    ))}
                  </ul>
                </SectionCard>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <SectionCard title="Đánh giá khách hàng" className="lg:col-span-4">
                  <div className="flex items-end gap-2">
                    <span className="text-[34px] font-bold leading-none text-lv-gold-700">
                      {(product.reviewSummary?.rating ?? product.rating).toFixed(1).replace(".", ",")}
                    </span>
                    <span className="pb-1 text-body text-lv-muted">/5</span>
                  </div>
                  <div className="mt-3 flex gap-1 text-lv-warning" aria-label="5 trên 5 sao">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <IconStarFilled key={index} size={18} />
                    ))}
                  </div>
                  <p className="mt-3 text-small text-lv-muted">{product.reviewSummary?.note}</p>
                </SectionCard>

                <SectionCard title="Câu hỏi thường gặp" className="lg:col-span-8">
                  <div className="space-y-3">
                    {product.faqs.map((f) => {
                      const open = openFaq === f.question;
                      return (
                        <div key={f.question} className="rounded-card border border-lv-border">
                          <button
                            type="button"
                            onClick={() => setOpenFaq(open ? null : f.question)}
                            aria-expanded={open}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                          >
                            <span className="text-body-strong text-lv-text">{f.question}</span>
                            <IconChevronDown
                              size={17}
                              className={cn("shrink-0 text-lv-muted transition-transform duration-button", open && "rotate-180")}
                            />
                          </button>
                          {open ? <p className="px-4 pb-3 text-small text-lv-muted">{f.answer}</p> : null}
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>
            </>
          ) : (
            <>
              {/* Tabs nội dung */}
              <SectionCard title="Thông tin chi tiết" padded={false}>
                <div className="px-5">
                  <Tabs
                    ariaLabel="Thông tin sản phẩm"
                    value={tab}
                    onChange={setTab}
                    items={[
                      { id: "benefits", label: "Quyền lợi" },
                      { id: "requirements", label: "Yêu cầu khi mua" },
                      { id: "warranty", label: "Chính sách bảo hành" },
                    ]}
                  />
                </div>
                <div className="p-5">
                  <TabPanel id="benefits" active={tab === "benefits"}>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {product.benefits.map((b) => (
                        <div key={b.title} className="rounded-card border border-lv-border p-4">
                          <p className="flex items-center gap-2 text-body-strong text-lv-text">
                            <IconCheck size={16} className="text-lv-success" />
                            {b.title}
                          </p>
                          <p className="mt-1 text-small text-lv-muted">{b.detail}</p>
                        </div>
                      ))}
                    </div>
                  </TabPanel>

                  <TabPanel id="requirements" active={tab === "requirements"}>
                    <ul className="space-y-2">
                      {product.requirements.map((r) => (
                        <li key={r} className="flex gap-2 text-body text-lv-navy-700">
                          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lv-gold-500" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </TabPanel>

                  <TabPanel id="warranty" active={tab === "warranty"}>
                    <ul className="space-y-2">
                      {product.warranty.map((w) => (
                        <li key={w} className="flex gap-2 text-body text-lv-navy-700">
                          <IconShieldCheck size={16} className="mt-0.5 shrink-0 text-lv-gold-600" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </TabPanel>
                </div>
              </SectionCard>

              {/* FAQ */}
              <SectionCard title="Câu hỏi thường gặp">
                <div className="grid gap-3 lg:grid-cols-2">
                  {product.faqs.map((f) => {
                    const open = openFaq === f.question;
                    return (
                      <div key={f.question} className="rounded-card border border-lv-border">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(open ? null : f.question)}
                          aria-expanded={open}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="text-body-strong text-lv-text">{f.question}</span>
                          <IconChevronDown
                            size={17}
                            className={cn("shrink-0 text-lv-muted transition-transform duration-button", open && "rotate-180")}
                          />
                        </button>
                        {open ? <p className="px-4 pb-3 text-small text-lv-muted">{f.answer}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </>
          )}
        </div>

        {/* Aside đặt hàng, dính khi cuộn */}
        <aside className="min-w-0 xl:col-span-4">
          <div className="space-y-4 xl:sticky xl:top-[88px]">
            <SectionCard title="Thông tin đơn hàng">
              <div className="flex items-center gap-3 rounded-card border border-lv-border bg-lv-bg p-3">
                <AssetImage assetKey={product.assetKey} className="h-10 w-10" rounded="control" />
                <div className="min-w-0">
                  <p className="truncate text-body-strong text-lv-text">{product.shortName}</p>
                  <p className="truncate text-small text-lv-muted">{pkg.name}</p>
                </div>
              </div>

              <div className="mt-3 divide-y divide-lv-border">
                <OrderSummaryRow label="Gói" value={pkg.name} />
                <OrderSummaryRow label="Thời hạn" value={pkg.duration} />
                <OrderSummaryRow label="Giá gói" value={formatMoney(pkg.price)} />
                {pkg.originalPrice ? (
                  <OrderSummaryRow
                    label="Tiết kiệm"
                    value={`- ${formatMoney(pkg.originalPrice - pkg.price)}`}
                    tone="gold"
                  />
                ) : null}
                <OrderSummaryRow label="Tổng thanh toán" value={formatMoney(pkg.price)} strong tone="gold" />
              </div>

              <div className="mt-3 flex items-center justify-between rounded-card border border-lv-border-gold bg-lv-gold-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-small text-lv-gold-700">
                  <IconWallet size={15} /> Số dư khả dụng
                </span>
                <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(account.balance)}</span>
              </div>

              {notEnoughBalance ? (
                <p className="mt-2 text-small text-lv-danger" role="alert">
                  Số dư không đủ, cần thêm {formatMoney(pkg.price - account.balance)}.
                </p>
              ) : null}

              <Button
                block
                size="lg"
                className="mt-4"
                onClick={buy}
                loading={submitting}
                disabled={!pkg.inStock}
                icon={<IconShoppingCartPlus size={18} />}
              >
                {pkg.inStock ? "Mua ngay" : "Tạm hết hàng"}
              </Button>

              {product.showConsultCta ? (
                <Button
                  block
                  variant="secondary"
                  className="mt-2"
                  icon={<IconHeadset size={17} />}
                  onClick={() =>
                    toast.push({
                      tone: "success",
                      title: "Đã ghi nhận yêu cầu tư vấn",
                      description: "Bộ phận tư vấn sẽ liên hệ lại với bạn.",
                    })
                  }
                >
                  Nhận tư vấn
                </Button>
              ) : null}

              <p className="mt-2 text-center text-small text-lv-muted">
                Đơn hàng mô phỏng bằng dữ liệu DEMO.
              </p>
            </SectionCard>

            <InfoCard title="Lưu ý trước khi mua" tone="gold" icon={<IconAlertTriangle size={16} />}>
              Đọc kỹ mục “Yêu cầu khi mua”. Cung cấp sai thông tin có thể làm chậm thời gian kích hoạt.
            </InfoCard>
          </div>
        </aside>
      </div>
    </div>
  );
}
