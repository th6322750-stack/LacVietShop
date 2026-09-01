/**
 * Hàng premium — nghiệp vụ phía máy chủ.
 *
 * Khác hẳn dịch vụ tương tác: dịch vụ thì đẩy thẳng sang API nhà cung cấp, còn
 * tài khoản premium là hàng của mình. Khách trả tiền xong đơn nằm chờ, quản trị
 * viên điền thông tin tài khoản rồi mới thành đã giao.
 *
 * Giá và tồn kho lấy từ catalog tĩnh, cho phép quản trị ghi đè qua bảng
 * product_settings ở máy chủ — không dùng localStorage, vì giá phải giống nhau
 * với mọi khách.
 */
import { products } from "@/lib/demo/catalog";
import { listProductSettings, stockCounts, type ProductSetting } from "./db";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/products.ts chỉ được dùng phía server.");
}

export const settingKey = (slug: string, packageId: string) => `${slug}/${packageId}`;

export interface MergedPackage {
  slug: string;
  productName: string;
  packageId: string;
  packageName: string;
  duration: string;
  /** Giá bán thực tế: bản ghi đè nếu có, không thì giá trong catalog. */
  price: number;
  catalogPrice: number;
  /** Giới hạn bán thủ công; null = không giới hạn. */
  stock: number | null;
  active: boolean;
  /** Các cột của một món hàng, dùng để tách dòng khi nạp kho. */
  format: string[];
  /** Số món còn sẵn trong kho — mua là giao ngay, không phải chờ người. */
  available: number;
  /** Gói phổ biến, trang khách làm nổi lên. */
  highlight: boolean;
  /** Nhãn nhỏ trên thẻ gói. */
  badge: string | null;
  /** Các dòng mô tả trong thẻ gói. */
  bullets: string[];
  /** Giá gạch ngang, lấy từ catalog. */
  originalPrice: number | null;
  /** Có bản ghi đè của quản trị hay không. */
  customized: boolean;
}

/** Ghép catalog tĩnh với cấu hình của quản trị. */
export async function mergedPackages(): Promise<MergedPackage[]> {
  const [list, counts] = await Promise.all([listProductSettings(), stockCounts()]);
  const settings = new Map(list.map((s: ProductSetting) => [s.key, s]));

  return products.flatMap((p) =>
    p.packages.map((pk) => {
      const key = settingKey(p.slug, pk.id);
      const s = settings.get(key);
      return {
        slug: p.slug,
        productName: p.name,
        packageId: pk.id,
        packageName: s?.name || pk.name,
        duration: s?.duration || pk.duration,
        price: s?.price ?? pk.price,
        catalogPrice: pk.price,
        stock: s?.stock ?? null,
        active: s?.active ?? pk.inStock,
        format: s?.format ?? [],
        available: counts[key] ?? 0,
        highlight: s?.highlight ?? Boolean(pk.highlight),
        badge: s?.badge ?? pk.badge ?? null,
        bullets: s?.bullets?.length ? s.bullets : pk.bullets,
        originalPrice: pk.originalPrice ?? null,
        customized: Boolean(s),
      };
    }),
  );
}

export async function findPackage(slug: string, packageId: string) {
  const all = await mergedPackages();
  return all.find((x) => x.slug === slug && x.packageId === packageId) ?? null;
}
