"use client";

import * as React from "react";
import { IconCrown, IconHeadset, IconRefresh, IconShieldCheck, IconSortDescending } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard } from "@/components/blocks/Cards";
import { ProductCard } from "@/components/blocks/Commerce";
import { AssetImage } from "@/components/blocks/AssetImage";
import { EmptyState } from "@/components/blocks/States";
import { FilterBar } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { products, productCategories } from "@/lib/demo/catalog";
import { cn, formatMoney } from "@/lib/utils";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

const sortLabels: Record<SortKey, string> = {
  popular: "Bán chạy nhất",
  "price-asc": "Giá thấp → cao",
  "price-desc": "Giá cao → thấp",
  rating: "Đánh giá cao nhất",
};

export function ProductsView() {
  const [category, setCategory] = React.useState("Tất cả");
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("popular");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "Tất cả" && p.category !== category) return false;
      if (q && !`${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.fromPrice - b.fromPrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.fromPrice - a.fromPrice);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => b.sold - a.sold);
    return sorted;
  }, [category, search, sort]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tài khoản Premium"
        description="Kho tài khoản bản quyền, kích hoạt nhanh và bảo hành theo thời hạn gói."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm Premium" }]}
      />

      {/* Banner hạng VIP */}
      <section className="relative overflow-hidden rounded-panel border border-lv-border-gold bg-lv-surface-soft">
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-12 lg:items-center">
          <div className="min-w-0 lg:col-span-8">
            <Badge tone="gold" icon={<IconCrown size={14} />}>
              Ưu đãi hạng {" "}
              <span className="font-bold">Đại lý</span>
            </Badge>
            <h2 className="mt-2 text-h2 text-lv-text">Giá tốt hơn khi bạn lên hạng</h2>
            <p className="mt-1.5 max-w-2xl text-body text-lv-muted">
              Mỗi cấp bậc có bảng giá riêng cho toàn bộ tài khoản premium. Nạp thêm để lên hạng và giữ mức
              giá tốt cho các đơn tiếp theo.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-4">
            <AssetImage assetKey="products.vipBanner" className="h-28 w-full sm:h-32" rounded="card" showLabel />
          </div>
        </div>
      </section>

      <SectionCard
        title="Danh mục sản phẩm"
        description={`${filtered.length} sản phẩm phù hợp bộ lọc.`}
        bodyClassName="space-y-4"
      >
        <FilterBar
          search={search}
          onSearch={setSearch}
          placeholder="Tìm theo tên sản phẩm…"
          right={
            <div className="flex items-center gap-2">
              <IconSortDescending size={16} className="text-lv-muted" aria-hidden />
              <Select
                aria-label="Sắp xếp"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-auto"
              >
                {Object.entries(sortLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          }
        />

        <div className="lv-scroll-x flex gap-2 pb-1">
          {productCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "shrink-0 rounded-pill border px-3.5 py-1.5 text-small-strong transition-colors duration-button",
                category === c
                  ? "border-lv-gold-500 bg-lv-gold-50 text-lv-gold-700"
                  : "border-lv-border text-lv-navy-700 hover:border-lv-border-gold",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Thử đổi từ khoá hoặc chọn danh mục khác."
            action={
              <Button
                variant="secondary"
                icon={<IconRefresh size={16} />}
                onClick={() => {
                  setSearch("");
                  setCategory("Tất cả");
                }}
              >
                Xoá bộ lọc
              </Button>
            }
          />
        ) : (
          // <768 một cột · 768–991 hai · 992–1399 ba · >=1400 bốn (§8)
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Dải cam kết */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: IconShieldCheck, title: "Bảo hành trọn thời hạn", detail: "Lỗi do nhà cung cấp được đổi mới miễn phí." },
          { icon: IconRefresh, title: "Kích hoạt nhanh", detail: "Phần lớn đơn hoàn tất trong 15 phút." },
          { icon: IconHeadset, title: "Hỗ trợ trong giờ làm việc", detail: "Kênh liên hệ chính thức đang được cấu hình." },
        ].map((item) => (
          <div key={item.title} className="lv-card flex items-start gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-lv-border-gold bg-lv-gold-50 text-lv-gold-700">
              <item.icon size={19} />
            </span>
            <div>
              <p className="text-body-strong text-lv-text">{item.title}</p>
              <p className="mt-0.5 text-small text-lv-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <p className="text-small text-lv-muted">
        Giá hiển thị là giá trình diễn theo cấp bậc hiện tại. Giá bán thật sẽ được cập nhật khi có bảng giá
        chính thức. Sản phẩm rẻ nhất hiện tại: {formatMoney(Math.min(...products.map((p) => p.fromPrice)))}.
      </p>
    </div>
  );
}
