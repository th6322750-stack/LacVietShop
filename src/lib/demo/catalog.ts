import type { ProductVariant } from "@/types";
import { platforms } from "./services-catalog";

/**
 * Catalog DEMO.
 *
 * Nền tảng / dịch vụ / máy chủ: lấy nguyên cấu trúc bên thatim.vn qua bộ sinh
 * tools/build-services-catalog.mjs (xem ./services-catalog.ts). Không sửa tay ở
 * đây — sửa bộ sinh rồi chạy lại.
 *
 * Sản phẩm premium bên dưới vẫn là dữ liệu trình diễn, không phải bảng giá kinh
 * doanh thật (xem gap catalog.pricing trong .webby/FINAL_GAPS_REPORT.md).
 */

export { platforms, serviceTiers } from "./services-catalog";

export function findPlatform(id: string) {
  return platforms.find((p) => p.id === id);
}

export function allServers() {
  return platforms.flatMap((p) =>
    p.services.flatMap((s) => s.servers.map((server) => ({ platform: p, service: s, server }))),
  );
}


export const products: ProductVariant[] = [
  {
    slug: "youtube",
    name: "YouTube Premium",
    shortName: "YouTube",
    tagline: "Xem không quảng cáo, phát nền và tải offline",
    description:
      "Nâng cấp chính chủ trên email của bạn, giữ nguyên lịch sử xem và danh sách phát. Hỗ trợ cả YouTube Music Premium.",
    assetKey: "product.youtube",
    heroTone: "light",
    accent: "danger",
    category: "Giải trí",
    badges: ["Chính chủ", "Bảo hành trọn gói", "Kích hoạt nhanh"],
    fromPrice: 79_000,
    sold: 1_284,
    rating: 4.9,
    packages: [
      {
        id: "yt-1m",
        name: "Gói 1 tháng",
        duration: "1 tháng",
        price: 79_000,
        originalPrice: 99_000,
        bullets: ["Nâng cấp chính chủ", "Kèm YouTube Music", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "yt-6m",
        name: "Gói 6 tháng",
        duration: "6 tháng",
        price: 399_000,
        originalPrice: 594_000,
        highlight: true,
        badge: "Tiết kiệm 33%",
        bullets: ["Nâng cấp chính chủ", "Kèm YouTube Music", "Bảo hành trọn thời hạn"],
        inStock: true,
      },
      {
        id: "yt-12m",
        name: "Gói 12 tháng",
        duration: "12 tháng",
        price: 690_000,
        originalPrice: 1_188_000,
        badge: "Bán chạy",
        bullets: ["Nâng cấp chính chủ", "Kèm YouTube Music", "Ưu tiên hỗ trợ"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Không quảng cáo", detail: "Bỏ toàn bộ quảng cáo hiển thị và quảng cáo giữa video." },
      { title: "Phát nền & tải offline", detail: "Tắt màn hình vẫn nghe, tải video xem không cần mạng." },
      { title: "YouTube Music", detail: "Nghe nhạc không quảng cáo, tải bài hát về máy." },
    ],
    requirements: [
      "Cung cấp email Google chính chủ, chưa đăng ký Premium ở nơi khác",
      "Không đổi mật khẩu trong 24 giờ đầu sau khi nâng cấp",
    ],
    warranty: [
      "Bảo hành theo đúng thời hạn gói đã mua",
      "Lỗi rớt gói được nâng cấp lại miễn phí trong thời gian bảo hành",
      "Không hoàn tiền sau khi đã kích hoạt thành công, chỉ đổi/gia hạn",
    ],
  },
  {
    slug: "capcut",
    name: "CapCut Pro",
    shortName: "CapCut",
    tagline: "Mở khoá hiệu ứng Pro, xoá watermark, xuất 4K",
    description:
      "Tài khoản CapCut Pro dùng riêng, đăng nhập được 2 thiết bị, kèm kho hiệu ứng và template trả phí.",
    assetKey: "product.capcut",
    heroTone: "light",
    accent: "info",
    category: "Sáng tạo nội dung",
    badges: ["Dùng riêng", "2 thiết bị", "Kèm credit AI"],
    fromPrice: 59_000,
    sold: 942,
    rating: 4.8,
    packages: [
      {
        id: "cc-1m",
        name: "Gói 1 tháng",
        duration: "1 tháng",
        price: 59_000,
        bullets: ["Tài khoản dùng riêng", "Đăng nhập 2 thiết bị", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "cc-6m",
        name: "Gói 6 tháng",
        duration: "6 tháng",
        price: 289_000,
        originalPrice: 354_000,
        highlight: true,
        badge: "Phổ biến",
        bullets: ["Tài khoản dùng riêng", "Kèm 1.000 credit AI", "Bảo hành trọn thời hạn"],
        inStock: true,
      },
      {
        id: "cc-12m",
        name: "Gói 12 tháng",
        duration: "12 tháng",
        price: 499_000,
        originalPrice: 708_000,
        bullets: ["Tài khoản dùng riêng", "Kèm 1.600 credit AI", "Ưu tiên hỗ trợ"],
        inStock: false,
      },
    ],
    benefits: [
      { title: "Không watermark", detail: "Xuất video sạch, không logo CapCut ở góc." },
      { title: "Xuất 4K 60fps", detail: "Giữ nguyên chất lượng khi đăng lên nền tảng." },
      { title: "Kho template Pro", detail: "Dùng toàn bộ hiệu ứng, chuyển cảnh và bộ lọc trả phí." },
    ],
    requirements: [
      "Đăng nhập bằng tài khoản được cấp, không đổi mật khẩu",
      "Không dùng quá số thiết bị cho phép",
    ],
    warranty: [
      "Bảo hành 1-1 trong suốt thời hạn gói",
      "Cấp lại tài khoản mới nếu lỗi do nhà cung cấp",
      "Không bảo hành nếu tự ý đổi thông tin đăng nhập",
    ],
  },
  {
    slug: "canva",
    name: "Canva Pro",
    shortName: "Canva",
    tagline: "Kho template Pro, Magic Studio và 1TB lưu trữ",
    description:
      "Mời trực tiếp vào team Canva Pro trên email của bạn, giữ nguyên thiết kế đã có và dùng đủ tính năng trả phí.",
    assetKey: "product.canva",
    heroTone: "light",
    accent: "info",
    category: "Thiết kế",
    badges: ["Mời vào email của bạn", "Giữ nguyên thiết kế cũ", "1TB lưu trữ"],
    fromPrice: 89_000,
    sold: 1_105,
    rating: 4.9,
    packages: [
      {
        id: "cv-personal",
        name: "Gói cá nhân - 1 tháng",
        duration: "1 tháng",
        price: 89_000,
        bullets: ["1 tài khoản cá nhân", "Toàn bộ tính năng Pro", "Kho template premium"],
        inStock: true,
      },
      {
        id: "cv-team-small",
        name: "Gói nhóm nhỏ",
        duration: "1 tháng",
        price: 159_000,
        originalPrice: 199_000,
        highlight: true,
        badge: "Phổ biến nhất",
        bullets: ["Từ 2–5 thành viên", "Chia sẻ template & thương hiệu", "Quản lý đội nhóm dễ dàng"],
        inStock: true,
      },
      {
        id: "cv-studio",
        name: "Gói Studio Creator",
        duration: "1 tháng",
        price: 279_000,
        bullets: ["Không giới hạn thành viên", "Bộ thương hiệu nâng cao", "Quyền kiểm soát & phân quyền"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Template & tài nguyên Pro", detail: "Hàng triệu mẫu, ảnh, video và font bản quyền." },
      { title: "Magic Studio", detail: "Bộ công cụ AI xoá nền, mở rộng ảnh, viết nội dung." },
      { title: "Brand Kit", detail: "Đồng bộ logo, màu và font thương hiệu cho cả nhóm." },
    ],
    keyFeatures: [
      "AI Magic Studio",
      "Kho template premium",
      "Brand Kit",
      "Xóa nền & Magic Edit",
      "Lịch nội dung",
      "Cộng tác thời gian thực",
    ],
    sampleSwatches: {
      colors: ["#CFE7F0", "#0F1B3D", "#F3D8C7"],
      caption: "Bộ mẫu thiết kế & tài nguyên Pro",
    },
    receiveNotes: [
      "Tài khoản/gói được kích hoạt theo thông tin đơn.",
      "Không tự thay đổi thông tin khi đang trong thời gian bảo hành.",
      "Không sử dụng cho mục đích vi phạm chính sách nền tảng.",
    ],
    reviewSummary: {
      rating: 4.9,
      note: "Tổng hợp từ đánh giá DEMO để đối chiếu bố cục; dữ liệu production sẽ được thay sau.",
    },
    showConsultCta: true,
    requirements: ["Cung cấp email đang dùng Canva", "Chấp nhận lời mời trong vòng 24 giờ"],
    warranty: [
      "Bảo hành theo thời hạn gói",
      "Mời lại miễn phí nếu bị rớt team",
      "Không hỗ trợ nếu tự rời team",
    ],
  },
  {
    slug: "veo3",
    name: "Google Veo 3 AI",
    shortName: "Veo 3",
    tagline: "Dựng video AI chất lượng cao từ mô tả văn bản",
    description:
      "Tài khoản có quyền dùng Veo 3 để tạo video AI, kèm hạn mức tạo video mỗi tháng theo gói.",
    assetKey: "product.veo3",
    heroTone: "light",
    accent: "gold",
    category: "AI",
    badges: ["Hạn mức rõ ràng", "Kích hoạt trong ngày"],
    fromPrice: 150_000,
    sold: 486,
    rating: 4.7,
    packages: [
      {
        id: "veo-basic",
        name: "Gói cơ bản",
        duration: "1 tháng",
        price: 150_000,
        bullets: ["Hạn mức 100 video/tháng", "Độ dài tới 8 giây", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "veo-pro",
        name: "Gói chuyên nghiệp",
        duration: "1 tháng",
        price: 390_000,
        highlight: true,
        badge: "Đề xuất",
        bullets: ["Hạn mức 500 video/tháng", "Ưu tiên hàng đợi", "Xuất 1080p"],
        inStock: true,
      },
      {
        id: "veo-studio",
        name: "Gói studio",
        duration: "3 tháng",
        price: 990_000,
        bullets: ["Hạn mức 2.000 video", "Hỗ trợ riêng", "Ưu tiên tính năng mới"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Video từ mô tả", detail: "Nhập mô tả tiếng Việt, nhận video dựng sẵn." },
      { title: "Chuyển ảnh thành video", detail: "Đưa ảnh tĩnh vào và tạo chuyển động tự nhiên." },
      { title: "Hạn mức minh bạch", detail: "Xem số lượt còn lại trực tiếp trong tài khoản." },
    ],
    requirements: ["Cung cấp email Google", "Không chia sẻ tài khoản cho bên thứ ba"],
    warranty: ["Bảo hành theo thời hạn gói", "Bù hạn mức nếu hệ thống lỗi", "Không hoàn tiền phần hạn mức đã dùng"],
  },
  {
    slug: "gemini",
    name: "Google Gemini Pro",
    shortName: "Gemini",
    tagline: "Gemini Advanced kèm 2TB lưu trữ Google One",
    description:
      "Nâng cấp Gemini Advanced trên chính email của bạn, dùng được trong Gmail, Docs và Google One 2TB.",
    assetKey: "product.gemini",
    heroTone: "light",
    accent: "info",
    category: "AI",
    badges: ["Chính chủ", "Kèm 2TB Drive", "Dùng trong Gmail/Docs"],
    fromPrice: 120_000,
    sold: 733,
    rating: 4.8,
    packages: [
      {
        id: "gm-1m",
        name: "Gói 1 tháng",
        duration: "1 tháng",
        price: 120_000,
        bullets: ["Gemini Advanced", "2TB Google One", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "gm-3m",
        name: "Gói 3 tháng",
        duration: "3 tháng",
        price: 330_000,
        highlight: true,
        badge: "Tiết kiệm 8%",
        bullets: ["Gemini Advanced", "2TB Google One", "Bảo hành trọn thời hạn"],
        inStock: true,
      },
      {
        id: "gm-12m",
        name: "Gói 12 tháng",
        duration: "12 tháng",
        price: 1_190_000,
        bullets: ["Gemini Advanced", "2TB Google One", "Ưu tiên hỗ trợ"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Mô hình mạnh nhất", detail: "Truy cập bản Gemini cao cấp cho công việc phức tạp." },
      { title: "Tích hợp Workspace", detail: "Soạn thảo và tóm tắt ngay trong Gmail, Docs, Sheets." },
      { title: "2TB lưu trữ", detail: "Dùng chung cho Drive, Gmail và Google Photos." },
    ],
    requirements: ["Email Google chưa có gói One trả phí", "Không đổi mật khẩu trong 24 giờ đầu"],
    warranty: ["Bảo hành theo thời hạn gói", "Nâng cấp lại miễn phí nếu rớt gói", "Không hoàn tiền sau khi kích hoạt"],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT Plus + API Codex",
    shortName: "ChatGPT",
    tagline: "Tài khoản Plus dùng riêng kèm hạn mức API",
    description:
      "Tài khoản ChatGPT Plus dùng riêng, có thể kèm hạn mức API cho nhu cầu lập trình theo từng gói.",
    assetKey: "product.chatgpt",
    heroTone: "light",
    accent: "success",
    category: "AI",
    badges: ["Dùng riêng", "Kèm API tuỳ gói", "Đổi mật khẩu được"],
    fromPrice: 240_000,
    sold: 1_562,
    rating: 4.9,
    packages: [
      {
        id: "gpt-plus",
        name: "Plus 1 tháng",
        duration: "1 tháng",
        price: 240_000,
        bullets: ["Tài khoản dùng riêng", "Đổi mật khẩu được", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "gpt-plus-api",
        name: "Plus + API 1 tháng",
        duration: "1 tháng",
        price: 490_000,
        highlight: true,
        badge: "Cho lập trình viên",
        bullets: ["Tài khoản dùng riêng", "Hạn mức API kèm theo", "Hỗ trợ cấu hình"],
        inStock: true,
      },
      {
        id: "gpt-team",
        name: "Gói nhóm 3 người",
        duration: "1 tháng",
        price: 650_000,
        bullets: ["3 tài khoản riêng", "Quản lý tập trung", "Ưu tiên hỗ trợ"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Mô hình mới nhất", detail: "Dùng bản mô hình cao cấp, hàng đợi ưu tiên." },
      { title: "Hạn mức API", detail: "Gói kèm API cấp khoá riêng theo hạn mức đã ghi." },
      { title: "Bảo mật", detail: "Tài khoản dùng riêng, không chia sẻ phiên đăng nhập." },
    ],
    requirements: ["Không dùng chung tài khoản", "Không thay đổi email khôi phục"],
    warranty: ["Bảo hành 1-1 theo thời hạn", "Cấp tài khoản mới nếu lỗi nhà cung cấp", "Không bảo hành khi vi phạm điều khoản OpenAI"],
  },
  {
    slug: "netflix",
    name: "Netflix Ultra 4K",
    shortName: "Netflix",
    tagline: "Hồ sơ riêng, chất lượng 4K HDR, xem đa thiết bị",
    description:
      "Slot hồ sơ riêng trên gói Premium 4K, hỗ trợ cả TV, điện thoại và máy tính. Không dùng chung hồ sơ với người lạ.",
    assetKey: "product.netflix",
    heroTone: "dark",
    accent: "danger",
    category: "Giải trí",
    badges: ["Hồ sơ riêng", "4K HDR", "Bảo hành trọn gói"],
    fromPrice: 70_000,
    sold: 2_051,
    rating: 4.7,
    packages: [
      {
        id: "nf-1m",
        name: "Gói 1 tháng",
        duration: "1 tháng",
        price: 70_000,
        bullets: ["1 hồ sơ riêng", "4K HDR", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "nf-3m",
        name: "Gói 3 tháng",
        duration: "3 tháng",
        price: 199_000,
        highlight: true,
        badge: "Bán chạy",
        bullets: ["1 hồ sơ riêng", "4K HDR", "Bảo hành trọn thời hạn"],
        inStock: true,
      },
      {
        id: "nf-6m",
        name: "Gói 6 tháng",
        duration: "6 tháng",
        price: 379_000,
        bullets: ["1 hồ sơ riêng", "4K HDR", "Ưu tiên hỗ trợ"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Chất lượng 4K HDR", detail: "Xem phim ở độ phân giải cao nhất Netflix hỗ trợ." },
      { title: "Hồ sơ riêng", detail: "Lịch sử xem và danh sách của bạn không bị người khác động vào." },
      { title: "Xem mọi thiết bị", detail: "TV, điện thoại, máy tính bảng và trình duyệt." },
    ],
    requirements: ["Không đổi mật khẩu hồ sơ", "Không thêm thiết bị vượt giới hạn gói"],
    warranty: ["Bảo hành trong toàn bộ thời hạn", "Đổi slot mới nếu lỗi", "Không bảo hành khi tự ý đổi thông tin"],
  },
  {
    slug: "vpn",
    name: "Combo VPN Quốc Tế",
    shortName: "VPN",
    tagline: "HMA + NordVPN + Proton + Surfshark + PIA",
    description:
      "Combo tài khoản VPN quốc tế cho nhu cầu bảo mật và truy cập nội dung theo vùng, kèm hướng dẫn cài đặt.",
    assetKey: "product.vpn",
    heroAssetKey: "product.vpn.hero",
    heroTone: "light",
    accent: "info",
    category: "Bảo mật",
    badges: ["5 dịch vụ", "Đa nền tảng", "Hướng dẫn cài đặt"],
    fromPrice: 20_000,
    sold: 618,
    rating: 4.6,
    packages: [
      {
        id: "vpn-1m",
        name: "Gói 1 tháng",
        duration: "1 tháng",
        price: 20_000,
        bullets: ["Chọn 1 trong 5 dịch vụ", "Bảo hành 30 ngày"],
        inStock: true,
      },
      {
        id: "vpn-6m",
        name: "Gói 6 tháng",
        duration: "6 tháng",
        price: 99_000,
        highlight: true,
        badge: "Tiết kiệm",
        bullets: ["Chọn 2 dịch vụ", "Bảo hành trọn thời hạn"],
        inStock: true,
      },
      {
        id: "vpn-combo",
        name: "Combo đủ 5 dịch vụ",
        duration: "12 tháng",
        price: 349_000,
        bullets: ["Đủ 5 dịch vụ", "Hỗ trợ cài đặt", "Ưu tiên hỗ trợ"],
        inStock: true,
      },
    ],
    benefits: [
      { title: "Bảo mật kết nối", detail: "Mã hoá lưu lượng khi dùng Wi-Fi công cộng." },
      { title: "Nhiều vùng máy chủ", detail: "Chuyển vùng để truy cập nội dung theo khu vực." },
      { title: "Đa nền tảng", detail: "Windows, macOS, Android, iOS và trình duyệt." },
    ],
    requirements: ["Không chia sẻ tài khoản ra ngoài", "Tuân thủ pháp luật khi sử dụng"],
    warranty: ["Bảo hành theo thời hạn gói", "Đổi tài khoản khi lỗi đăng nhập", "Không bảo hành khi vi phạm điều khoản nhà cung cấp"],
  },
];

export function findProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const productCategories = ["Tất cả", "AI", "Giải trí", "Sáng tạo nội dung", "Thiết kế", "Bảo mật"];
