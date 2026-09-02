import type { MetadataRoute } from "next";
import { products } from "@/lib/demo/catalog";

/** Địa chỉ chuẩn của trang. Đổi được qua env khi chạy tên miền khác. */
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lacviet.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Trang công khai + trang cửa vào. Các trang sau đăng nhập không đưa vào.
  const staticPaths = ["", "/services", "/products", "/login", "/register", "/forgot-password"];
  const productPaths = products.map((p) => `/products/${p.slug}`);

  return [...staticPaths, ...productPaths].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
