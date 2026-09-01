/**
 * Nội dung trang sản phẩm sau khi trộn catalog tĩnh với phần quản trị đã sửa.
 *
 * Trang khách và trang quản trị đọc CÙNG một nguồn này, nên sửa xong là hiện
 * đúng ngay, không có chuyện hai bên lệch nhau.
 */
import { products } from "@/lib/demo/catalog";
import { listProductContent } from "./db";
import { mergedPackages } from "./products";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/content.ts chỉ được dùng phía server.");
}

export async function productPageContent(slug: string) {
  const base = products.find((p) => p.slug === slug);
  if (!base) return null;

  const [contents, packages] = await Promise.all([listProductContent(), mergedPackages()]);
  const c = contents.find((x) => x.slug === slug);

  return {
    slug,
    name: c?.name || base.name,
    tagline: c?.tagline || base.tagline,
    description: c?.description || base.description,
    badges: c?.badges?.length ? c.badges : base.badges,
    /** Có bản sửa của quản trị hay không — để giao diện biết đang dùng bản nào. */
    customized: Boolean(c),
    packages: packages
      .filter((p) => p.slug === slug)
      .map((p) => ({
        id: p.packageId,
        name: p.packageName,
        duration: p.duration,
        price: p.price,
        originalPrice: p.originalPrice,
        bullets: p.bullets,
        highlight: p.highlight,
        badge: p.badge,
        inStock: p.active && (p.format.length === 0 || p.available > 0),
        available: p.available,
        pileBased: p.format.length > 0,
      })),
  };
}
