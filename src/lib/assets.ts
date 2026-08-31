/**
 * Bộ phân giải asset — nguồn sự thật duy nhất cho ảnh thương hiệu.
 *
 * Quy tắc hợp đồng (.webby/asset-manifest.json, PROJECT_HANDOFF §11):
 * - asset chưa có thì KHÔNG tìm trên mạng, KHÔNG tự vẽ, KHÔNG mượn logo khác;
 * - render placeholder trung tính giữ nguyên layout, gắn khoá `TODO_ASSET:<key>`;
 * - mọi khoá thiếu được liệt kê ở đây và đổ ra .webby/MISSING_ASSET_REPORT.md.
 *
 * Khi ChatGPT giao asset thật: thêm `src` vào đúng entry bên dưới, không sửa UI xung quanh.
 */

export type AssetClassification = "BRAND" | "AUTHENTIC" | "DECORATIVE" | "DATA_VISUAL" | "PLACEHOLDER";

export interface AssetEntry {
  /** Khoá ổn định dùng trong code và trong báo cáo. */
  key: string;
  /** Đường dẫn public/ khi asset đã được giao. `null` = còn thiếu. */
  src: string | null;
  /** Nhãn hiển thị trong placeholder (không mạo danh asset thật). */
  label: string;
  classification: AssetClassification;
  /** Route dùng asset này — dùng cho báo cáo gap. */
  routes: string[];
  section: string;
  role: string;
  needed: string;
  ratio: string;
  referenceTarget: string;
  referenceOriginal?: string;
}

const registry: AssetEntry[] = [
  {
    key: "brand.logoHorizontal",
    src: "/assets/brand/lac-viet-logo-horizontal.webp",
    label: "Lạc Việt Media Agency",
    classification: "BRAND",
    routes: ["*"],
    section: "Sidebar desktop, footer, trang đăng nhập",
    role: "LOGO",
    needed: "Logo ngang chính thức, nền trong suốt, ưu tiên SVG/PNG @3x",
    ratio: "~3:1 (hiển thị cao 32–40px)",
    referenceTarget: "references/brand/lac-viet-logo-horizontal.webp",
  },
  {
    key: "brand.markCompact",
    src: "/assets/brand/lac-viet-mark.svg",
    label: "LV",
    classification: "BRAND",
    routes: ["*"],
    section: "Sidebar thu gọn (992–1199), topbar mobile",
    role: "LOGO",
    needed: "Dấu hiệu thương hiệu vuông, ưu tiên vector",
    ratio: "1:1 (36–40px)",
    referenceTarget: "references/ui-approved/01-home.webp",
  },
  {
    key: "brand.favicon",
    src: "/assets/brand/lac-viet-mark.svg",
    label: "LV",
    classification: "BRAND",
    routes: ["*"],
    section: "Favicon / PWA icon",
    role: "ICON",
    needed: "Icon app suy ra từ compact mark đã duyệt",
    ratio: "1:1 (32/180/512px)",
    referenceTarget: "references/brand/lac-viet-logo-horizontal.webp",
  },
  {
    key: "home.hero.brandVisual",
    src: "/assets/decor/home-hero.svg",
    label: "Hero Lạc Việt",
    classification: "DECORATIVE",
    routes: ["/"],
    section: "Hero trang chủ, cột phải",
    role: "HERO",
    needed: "Tranh trang trí thương hiệu (trống đồng / chim Lạc) trên nền sáng",
    ratio: "desktop ~2.8:1, mobile 16:9",
    referenceTarget: "references/ui-approved/01-home.webp",
  },
  {
    key: "decor.dongSonPattern",
    src: "/assets/decor/dong-son-pattern.svg",
    label: "Hoa văn Đông Sơn",
    classification: "DECORATIVE",
    routes: ["/", "/products"],
    section: "Nền watermark hero và banner",
    role: "BACKGROUND",
    needed: "Hoa văn Đông Sơn dạng vector, tile được, opacity thấp",
    ratio: "tile vuông",
    referenceTarget: "references/ui-approved/01-home.webp",
  },
  {
    key: "products.vipBanner",
    src: "/assets/decor/vip-banner.svg",
    label: "Banner VIP",
    classification: "DECORATIVE",
    routes: ["/products"],
    section: "Banner đầu trang Sản phẩm Premium",
    role: "BACKGROUND",
    needed: "Tranh banner hạng VIP tông vàng, tối thiểu FHD",
    ratio: "~3:1",
    referenceTarget: "references/ui-approved/03-products.webp",
  },
  {
    key: "product.vpn.hero",
    src: "/assets/decor/vpn-hero.svg",
    label: "VPN Quốc Tế",
    classification: "DECORATIVE",
    routes: ["/products/vpn"],
    section: "Hero trang sản phẩm VPN",
    role: "HERO",
    needed: "Tranh chủ đề bảo mật/VPN, tối thiểu FHD",
    ratio: "~2.4:1",
    referenceTarget: "references/ui-approved/20-product-vpn.webp",
  },
  {
    key: "deposit.realQr",
    src: null,
    label: "QR nạp tiền",
    classification: "DATA_VISUAL",
    routes: ["/deposit"],
    section: "Khối chuyển khoản ngân hàng",
    role: "DATA_VISUAL",
    needed: "QR sinh từ tài khoản nhận tiền thật đã được duyệt (chưa có cấu hình thanh toán)",
    ratio: "1:1",
    referenceTarget: "references/ui-approved/08-deposit.webp",
  },
  {
    key: "account.defaultAvatar",
    src: "/assets/placeholders/default-avatar.svg",
    label: "Ảnh đại diện",
    classification: "PLACEHOLDER",
    routes: ["/account", "*"],
    section: "Topbar, trang tài khoản, danh sách người giới thiệu",
    role: "PLACEHOLDER",
    needed: "Avatar mặc định theo bộ nhận diện, ưu tiên vector",
    ratio: "1:1",
    referenceTarget: "references/ui-approved/05-account.webp",
  },
];

/** Logo nền tảng — 23 mark copy nguyên tệp từ bản clone thatim.vn qua tools/build-services-catalog.mjs. */
const platformKeys: { key: string; label: string; src: string | null }[] = [
  { key: "platform.instagram-global", label: "Instagram Global", src: "/assets/platforms/instagram-global.webp" },
  { key: "platform.whatsapp-global", label: "Whatsapp Global", src: "/assets/platforms/whatsapp-global.webp" },
  { key: "platform.twitter-global", label: "Twitter Global", src: "/assets/platforms/twitter-global.webp" },
  { key: "platform.youtube", label: "Youtube", src: "/assets/platforms/youtube.webp" },
  { key: "platform.threads-global", label: "Threads Global", src: "/assets/platforms/threads-global.webp" },
  { key: "platform.soundcloud-global", label: "Soundcloud Global", src: "/assets/platforms/soundcloud-global.webp" },
  { key: "platform.reddit-global", label: "Reddit Global", src: "/assets/platforms/reddit-global.webp" },
  { key: "platform.lazada-global", label: "Lazada Global", src: "/assets/platforms/lazada-global.png" },
  { key: "platform.spotify-global", label: "Spotify Global", src: "/assets/platforms/spotify-global.webp" },
  { key: "platform.telegram-global", label: "Telegram Global", src: "/assets/platforms/telegram-global.webp" },
  { key: "platform.tiktok", label: "Tiktok", src: "/assets/platforms/tiktok.webp" },
  { key: "platform.facebook-global", label: "Facebook Global", src: "/assets/platforms/facebook-global.webp" },
  { key: "platform.facebook", label: "Facebook", src: "/assets/platforms/facebook.webp" },
  { key: "platform.instagram", label: "Instagram", src: "/assets/platforms/instagram.webp" },
  { key: "platform.shopee", label: "Shopee", src: "/assets/platforms/shopee.webp" },
  { key: "platform.threads", label: "Threads", src: "/assets/platforms/threads.webp" },
  { key: "platform.spotify", label: "Spotify", src: "/assets/platforms/spotify.webp" },
  { key: "platform.website-traffic", label: "Website traffic", src: "/assets/platforms/website-traffic.webp" },
  { key: "platform.tiktok-global", label: "Tiktok Global", src: "/assets/platforms/tiktok-global.webp" },
  { key: "platform.youtube-global", label: "Youtube Global", src: "/assets/platforms/youtube-global.webp" },
  { key: "platform.google-maps", label: "Google Maps", src: "/assets/platforms/google-maps.webp" },
  { key: "platform.twitter", label: "Twitter", src: "/assets/platforms/twitter.webp" },
  { key: "platform.zalo", label: "Zalo", src: "/assets/platforms/zalo.webp" },
  // Ba nền tảng chỉ xuất hiện trong API, bản chụp trang không có logo. Để trống
  // theo đúng quy ước TODO_ASSET — không lấy mark của thương hiệu khác thay vào.
  { key: "platform.linkedin-global", label: "LinkedIn Global", src: null },
  { key: "platform.bigo-global", label: "Bigo Global", src: null },
  { key: "platform.discord-global", label: "Discord Global", src: null },
];

for (const p of platformKeys) {
  registry.push({
    key: p.key,
    src: p.src,
    label: p.label,
    classification: "AUTHENTIC",
    routes: ["/", "/services"],
    section: "Ô chọn nền tảng, bảng đơn hàng",
    role: "PLATFORM_MARK",
    needed: `Logo chính thức ${p.label} đúng bản quyền, nền trong suốt`,
    ratio: "1:1 (28–40px)",
    referenceTarget: "references/ui-approved/02-services.webp",
    referenceOriginal: "clone-thatim-vn: modules/images/platforms",
  });
}

/** Ảnh sản phẩm premium — 8 mark, nguồn khoá trong .webby/ASSET_PATCH.md §C. */
const productKeys: { key: string; label: string; route: string; src: string | null }[] = [
  { key: "product.youtube", label: "YouTube Premium", route: "/products/youtube", src: "/assets/products/youtube.webp" },
  { key: "product.capcut", label: "CapCut Pro", route: "/products/capcut", src: "/assets/products/capcut.webp" },
  { key: "product.canva", label: "Canva Pro", route: "/products/canva", src: "/assets/products/canva.webp" },
  { key: "product.veo3", label: "Google Veo 3 AI", route: "/products/veo3", src: "/assets/products/veo3.webp" },
  { key: "product.gemini", label: "Google Gemini Pro", route: "/products/gemini", src: "/assets/products/gemini.webp" },
  { key: "product.chatgpt", label: "ChatGPT Plus", route: "/products/chatgpt", src: "/assets/products/chatgpt.webp" },
  { key: "product.netflix", label: "Netflix Ultra 4K", route: "/products/netflix", src: "/assets/products/netflix.webp" },
  { key: "product.vpn", label: "Combo VPN Quốc Tế", route: "/products/vpn", src: "/assets/products/vpn.webp" },
];

for (const p of productKeys) {
  registry.push({
    key: p.key,
    src: p.src,
    label: p.label,
    classification: "AUTHENTIC",
    routes: ["/products", p.route, "/purchased"],
    section: "Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua",
    role: "PRODUCT_MARK",
    needed: `Ảnh/logo sản phẩm ${p.label} đúng bản quyền, nền trong suốt`,
    ratio: "1:1 (40–64px)",
    referenceTarget: "references/ui-approved/03-products.webp",
    referenceOriginal: "clone-thatim-vn: uploads/images/original",
  });
}

/** Cổng thanh toán — 7 mark, CỐ Ý để trống tới khi duyệt cấu hình thanh toán thật (§D). */
const paymentKeys: { key: string; label: string; src: string | null }[] = [
  { key: "payment.bidv", label: "BIDV", src: null },
  { key: "payment.momo", label: "MoMo", src: null },
];

for (const p of paymentKeys) {
  registry.push({
    key: p.key,
    src: p.src,
    label: p.label,
    classification: "AUTHENTIC",
    routes: ["/deposit", "/cashflows"],
    section: "Thẻ phương thức thanh toán",
    role: "PAYMENT_MARK",
    needed: `Logo chính thức ${p.label} đúng bản quyền`,
    ratio: "~2:1 (cao 24px)",
    referenceTarget: "references/ui-approved/08-deposit.webp",
    referenceOriginal: "clone-thatim-vn: deposit_addfunds.html",
  });
}

const byKey = new Map(registry.map((a) => [a.key, a]));

export function getAsset(key: string): AssetEntry | undefined {
  return byKey.get(key);
}

export function isAssetMissing(key: string) {
  const entry = byKey.get(key);
  return !entry || entry.src === null;
}

export function assetLabel(key: string) {
  return byKey.get(key)?.label ?? key;
}

/** Danh sách khoá còn thiếu — dùng để dựng .webby/MISSING_ASSET_REPORT.md. */
export function missingAssets(): AssetEntry[] {
  return registry.filter((a) => a.src === null);
}

export function allAssets(): AssetEntry[] {
  return registry;
}
