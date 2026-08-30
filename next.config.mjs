/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Toàn bộ ảnh thương hiệu nằm trong public/assets. Chưa có nguồn ảnh ngoài nào được duyệt.
    remotePatterns: [],
  },
};

export default nextConfig;
