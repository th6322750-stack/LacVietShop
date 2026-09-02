import type { MetadataRoute } from "next";

/** Địa chỉ chuẩn của trang. Đổi được qua env khi chạy tên miền khác. */
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://lacviet.shop";

export default function robots(): MetadataRoute.Robots {
  return {
    // Cho bọ tìm kiếm vào trang công khai, chặn khu quản trị và API.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
