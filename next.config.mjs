/** @type {import('next').NextConfig} */

/**
 * Content-Security-Policy bảo thủ. Chỉ khoá các hướng an toàn mà không cần nonce:
 * chặn nhúng iframe (chống clickjacking), chặn cướp thẻ <base>, chặn plugin/đối
 * tượng, giới hạn nơi form gửi đến chính mình, ép nâng lên HTTPS. KHÔNG đặt
 * script-src/style-src chặt vì Next.js chèn script/style nội tuyến — muốn siết
 * cần cơ chế nonce ở middleware (việc về sau).
 */
const csp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Toàn bộ ảnh thương hiệu nằm trong public/assets. Chưa có nguồn ảnh ngoài nào được duyệt.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
