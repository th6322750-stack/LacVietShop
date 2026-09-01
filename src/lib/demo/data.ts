import type {
  AccountProfile,
  ActivityItem,
  ApiEndpoint,
  Notice,
  Order,
  PaymentMethod,
  PurchasedItem,
  Transaction,
} from "@/types";

/**
 * DỮ LIỆU DEMO — sinh cố định (không random) để server và client render giống nhau.
 *
 * Bảo mật (PROJECT_HANDOFF §13): không sao chép bất kỳ token, CSRF, số dư, số điện thoại,
 * email hay trạng thái phiên nào từ repo tham chiếu. Toàn bộ giá trị dưới đây là hư cấu
 * cho mục đích trình diễn giao diện.
 */

export const account: AccountProfile = {
  displayName: "Nguyễn Văn A",
  username: "nguyenvana",
  emailMasked: "ngu•••••@demo.invalid",
  phoneMasked: "09•• ••• 123",
  // Khách lẻ thông thường — bậc giá mặc định của bảng giá 4 bậc.
  tier: "member",
  tierLabel: "Thành viên",
  balance: 2_450_000,
  totalDeposited: 18_750_000,
  totalSpent: 16_300_000,
  joinedAt: "2025-03-18T00:00:00.000Z",
  twoFactorEnabled: true,
  // Token trình diễn, không phải khoá thật; mặc định che (§13).
  apiTokenMasked: "lv_demo_••••••••••••4f2a",
};

/**
 * Số liệu trên trang chủ, đặt ở mức của một đơn vị mới mở.
 * Con số hàng chục nghìn khách nhìn là biết thổi phồng, phản tác dụng.
 */
export const homeMetrics = [
  { key: "orders", label: "Đơn hàng đã xử lý", value: 186, suffix: "đơn", trend: 12.4 },
  { key: "interactions", label: "Lượt tương tác đã giao", value: 47_200, suffix: "lượt", trend: 8.1 },
  { key: "customers", label: "Khách hàng đồng hành", value: 64, suffix: "khách", trend: 5.6 },
];

/** Danh sách trạng thái đơn dùng cho seed và cho bộ lọc. */
export const orderStatuses = ["completed", "running", "pending", "processing", "refunded", "canceled"] as const;

const orderSeeds: Array<[string, string, string, number, number, (typeof orderStatuses)[number], string]> = [
  ["Facebook", "Tăng like bài viết", "https://facebook.com/demo/posts/1024", 5_000, 11_500, "completed", "2026-08-30T09:12:00.000Z"],
  ["TikTok", "Tăng lượt xem video", "https://tiktok.com/@demo/video/778", 100_000, 37_000, "running", "2026-08-30T07:40:00.000Z"],
  ["Instagram", "Tăng người theo dõi", "https://instagram.com/demo", 1_000, 16_900, "processing", "2026-08-29T16:22:00.000Z"],
  ["YouTube", "Tăng lượt xem video", "https://youtube.com/watch?v=demo", 10_000, 210_000, "completed", "2026-08-29T11:05:00.000Z"],
  ["Shopee", "Tăng người theo dõi shop", "https://shopee.vn/demo-shop", 2_000, 50_000, "pending", "2026-08-28T20:31:00.000Z"],
  ["Zalo", "Tăng thành viên nhóm", "https://zalo.me/g/demo", 500, 48_000, "completed", "2026-08-28T14:18:00.000Z"],
  ["Facebook", "Tăng theo dõi trang cá nhân", "https://facebook.com/demo.profile", 3_000, 17_400, "refunded", "2026-08-27T09:44:00.000Z"],
  ["Telegram", "Tăng thành viên kênh", "https://t.me/demo_channel", 1_500, 96_000, "completed", "2026-08-26T18:02:00.000Z"],
  ["Spotify", "Tăng lượt nghe", "https://open.spotify.com/track/demo", 20_000, 740_000, "running", "2026-08-26T08:20:00.000Z"],
  ["Google Map", "Tăng đánh giá địa điểm", "Cửa hàng Demo — Quận 1", 20, 150_000, "processing", "2026-08-25T15:37:00.000Z"],
  ["Threads", "Tăng người theo dõi", "https://threads.net/@demo", 800, 20_800, "canceled", "2026-08-25T10:11:00.000Z"],
  ["TikTok", "Tăng tim video", "https://tiktok.com/@demo/video/901", 5_000, 5_500, "completed", "2026-08-24T19:29:00.000Z"],
];

export const orders: Order[] = orderSeeds.map(([platform, service, target, quantity, amount, status, createdAt], i) => {
  const delivered =
    status === "completed" ? quantity : status === "running" ? Math.round(quantity * 0.42) : 0;
  return {
    id: `ORD-${9120 + i}`,
    code: `LV${240830 + i}`,
    platformName: platform,
    serviceName: service,
    target,
    quantity,
    startCount: 1_200 + i * 137,
    delivered,
    amount,
    status,
    createdAt,
    updatedAt: createdAt,
    note: i % 4 === 0 ? "Chạy đều tay, không cần gấp." : undefined,
  };
});

export const orderStatusLabels: Record<Order["status"], string> = {
  completed: "Hoàn thành",
  running: "Đang chạy",
  pending: "Đang chờ",
  processing: "Đang xử lý",
  refunded: "Đã hoàn tiền",
  canceled: "Đã huỷ",
};

const txSeeds: Array<[Transaction["type"], number, string, string]> = [
  ["deposit", 2_000_000, "Nạp tiền qua chuyển khoản ngân hàng", "2026-08-30T08:02:00.000Z"],
  ["order", -11_500, "Đơn LV240830 · Facebook · Tăng like bài viết", "2026-08-30T09:12:00.000Z"],
  ["order", -37_000, "Đơn LV240831 · TikTok · Tăng lượt xem video", "2026-08-30T07:40:00.000Z"],
  ["commission", 148_000, "Hoa hồng affiliate tháng 8", "2026-08-29T23:59:00.000Z"],
  ["order", -16_900, "Đơn LV240832 · Instagram · Tăng người theo dõi", "2026-08-29T16:22:00.000Z"],
  ["refund", 17_400, "Hoàn tiền đơn LV240836", "2026-08-29T10:05:00.000Z"],
  ["deposit", 5_000_000, "Nạp tiền qua ví điện tử", "2026-08-28T13:44:00.000Z"],
  ["order", -210_000, "Đơn LV240833 · YouTube · Tăng lượt xem video", "2026-08-29T11:05:00.000Z"],
  ["withdraw", -1_200_000, "Rút hoa hồng về ngân hàng", "2026-08-27T09:10:00.000Z"],
  ["order", -740_000, "Đơn LV240838 · Spotify · Tăng lượt nghe", "2026-08-26T08:20:00.000Z"],
  ["deposit", 3_000_000, "Nạp tiền qua chuyển khoản ngân hàng", "2026-08-25T19:26:00.000Z"],
  ["order", -150_000, "Đơn LV240839 · Google Map · Tăng đánh giá", "2026-08-25T15:37:00.000Z"],
];

let runningBalance = account.balance;
export const transactions: Transaction[] = txSeeds.map(([type, amount, description, createdAt], i) => {
  const balanceAfter = runningBalance;
  runningBalance -= amount;
  return {
    id: `TX-${5400 + i}`,
    type,
    amount,
    balanceAfter,
    description,
    createdAt,
    reference: `REF-${88120 + i}`,
  };
});

/** Chuỗi số dư 30 ngày cho biểu đồ Dòng tiền (giá trị trình diễn). */
export const balanceSeries = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 1_200_000 + i * 46_000;
  const wave = Math.round(Math.sin(i / 3.1) * 240_000);
  return {
    day: `${String(day).padStart(2, "0")}/08`,
    balance: base + wave,
    spent: 120_000 + Math.round(Math.abs(Math.cos(i / 2.4)) * 260_000),
  };
});

export const spendingByCategory = [
  { name: "Tăng tương tác", value: 9_450_000, color: "#C97900" },
  { name: "Tài khoản premium", value: 4_180_000, color: "#0F1B3D" },
  { name: "Dịch vụ quốc tế", value: 1_920_000, color: "#D99A16" },
  { name: "Khác", value: 750_000, color: "#667085" },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "vietinbank",
    name: "VietinBank",
    kind: "bank",
    assetKey: "payment.vietinbank",
    detail: "Chuyển khoản 24/7",
    processingTime: "1 – 5 phút",
    feeNote: "Miễn phí",
    available: true,
  },
  {
    id: "momo",
    name: "MoMo",
    kind: "ewallet",
    assetKey: "payment.momo",
    detail: "Sắp hỗ trợ",
    processingTime: "Đang tích hợp",
    feeNote: "",
    // Chưa nối cổng MoMo thật; để true thì chọn nó vẫn ra QR VietinBank, khách
    // chuyển sai kênh. Tắt cho tới khi có tích hợp thật.
    available: false,
  },
];

export const recentDeposits = [
  { id: "DP-2201", method: "VietinBank", amount: 2_000_000, status: "success", createdAt: "2026-08-30T08:02:00.000Z" },
  { id: "DP-2198", method: "MoMo", amount: 5_000_000, status: "success", createdAt: "2026-08-28T13:44:00.000Z" },
  { id: "DP-2190", method: "VietinBank", amount: 3_000_000, status: "success", createdAt: "2026-08-25T19:26:00.000Z" },
  { id: "DP-2187", method: "MoMo", amount: 500_000, status: "pending", createdAt: "2026-08-24T10:12:00.000Z" },
  { id: "DP-2180", method: "VietinBank", amount: 1_200_000, status: "failed", createdAt: "2026-08-22T21:03:00.000Z" },
] as const;

export const activity: ActivityItem[] = [
  {
    id: "AC-1",
    kind: "order",
    title: "Đơn LV240830 hoàn thành",
    detail: "Facebook · Tăng like bài viết · 5.000 lượt",
    createdAt: "2026-08-30T09:41:00.000Z",
    status: "success",
  },
  {
    id: "AC-2",
    kind: "payment",
    title: "Nạp tiền thành công",
    detail: "Chuyển khoản VietinBank · 2.000.000 ₫",
    createdAt: "2026-08-30T08:02:00.000Z",
    status: "success",
  },
  {
    id: "AC-3",
    kind: "security",
    title: "Bật xác thực hai lớp",
    detail: "Ứng dụng xác thực · thiết bị Chrome trên Windows",
    createdAt: "2026-08-29T21:15:00.000Z",
    status: "info",
  },
  {
    id: "AC-4",
    kind: "product",
    title: "Kích hoạt Canva Pro 12 tháng",
    detail: "Đã gửi lời mời vào email đăng ký",
    createdAt: "2026-08-29T14:30:00.000Z",
    status: "success",
  },
  {
    id: "AC-5",
    kind: "login",
    title: "Đăng nhập mới",
    detail: "Thiết bị lạ · đã xác minh bằng mã 2FA",
    createdAt: "2026-08-28T07:52:00.000Z",
    status: "warning",
  },
  {
    id: "AC-6",
    kind: "order",
    title: "Đơn LV240836 được hoàn tiền",
    detail: "Facebook · Tăng theo dõi · hoàn 17.400 ₫",
    createdAt: "2026-08-27T09:44:00.000Z",
    status: "warning",
  },
];

export const notices: Notice[] = [
  {
    id: "N-1",
    title: "Toàn bộ máy chủ hoạt động bình thường",
    body: "Các dịch vụ tăng tương tác và tài khoản premium đang chạy ổn định. Thời gian xử lý trung bình dưới 10 phút.",
    publishedAt: "2026-08-30T06:00:00.000Z",
    tone: "success",
    pinned: true,
  },
  {
    id: "N-2",
    title: "Ưu đãi nạp tiền tháng 9",
    body: "Nạp từ 5.000.000 ₫ nhận thêm 3% số dư khuyến mãi, áp dụng cho mọi khách hàng.",
    publishedAt: "2026-08-29T09:00:00.000Z",
    tone: "info",
  },
  {
    id: "N-3",
    title: "Nhắc nhở về nội dung hợp pháp",
    body: "Nghiêm cấm dùng dịch vụ cho mục đích lừa đảo, bôi nhọ hoặc vi phạm pháp luật. Tài khoản vi phạm sẽ bị khoá vĩnh viễn.",
    publishedAt: "2026-08-27T15:00:00.000Z",
    tone: "warning",
  },
];

export const purchasedItems: PurchasedItem[] = [
  {
    id: "PR-901",
    productSlug: "canva",
    productName: "Canva Pro",
    packageName: "Gói nhóm nhỏ",
    purchasedAt: "2026-08-29T14:30:00.000Z",
    expiresAt: "2027-08-29T14:30:00.000Z",
    status: "active",
    credential: [
      { label: "Email nhận lời mời", value: "ngu•••••@demo.invalid", masked: true },
      { label: "Trạng thái", value: "Đã tham gia team", masked: false },
    ],
    warrantyNote: "Bảo hành trọn thời hạn gói.",
  },
  {
    id: "PR-892",
    productSlug: "chatgpt",
    productName: "ChatGPT Plus + API Codex",
    packageName: "Plus + API 1 tháng",
    purchasedAt: "2026-08-12T10:00:00.000Z",
    expiresAt: "2026-09-12T10:00:00.000Z",
    status: "expiring",
    credential: [
      { label: "Tài khoản", value: "lv-demo-••••@demo.invalid", masked: true },
      { label: "Mật khẩu", value: "••••••••••", masked: true },
      { label: "Khoá API", value: "sk-demo-••••••••••••", masked: true },
    ],
    warrantyNote: "Còn 13 ngày bảo hành. Gia hạn trước hạn để giữ nguyên tài khoản.",
  },
  {
    id: "PR-870",
    productSlug: "netflix",
    productName: "Netflix Ultra 4K",
    packageName: "Gói 3 tháng",
    purchasedAt: "2026-06-02T09:20:00.000Z",
    expiresAt: "2026-09-02T09:20:00.000Z",
    status: "expiring",
    credential: [
      { label: "Hồ sơ", value: "Hồ sơ 3 — Demo", masked: false },
      { label: "Mật khẩu", value: "••••••••", masked: true },
    ],
    warrantyNote: "Sắp hết hạn trong 3 ngày.",
  },
  {
    id: "PR-812",
    productSlug: "youtube",
    productName: "YouTube Premium",
    packageName: "Gói 6 tháng",
    purchasedAt: "2026-01-15T08:00:00.000Z",
    expiresAt: "2026-07-15T08:00:00.000Z",
    status: "expired",
    credential: [{ label: "Email nâng cấp", value: "ngu•••••@demo.invalid", masked: true }],
    warrantyNote: "Đã hết hạn. Mua lại để tiếp tục sử dụng.",
  },
];







export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "ep-balance",
    method: "GET",
    path: "/api/v1/balance",
    summary: "Xem số dư tài khoản",
    auth: true,
    rateLimit: "60 lần/phút",
    params: [],
  },
  {
    id: "ep-services",
    method: "GET",
    path: "/api/v1/services",
    summary: "Lấy danh sách dịch vụ và bảng giá",
    auth: true,
    rateLimit: "30 lần/phút",
    params: [{ name: "platform", type: "string", required: false, description: "Lọc theo nền tảng, ví dụ `facebook`." }],
  },
  {
    id: "ep-order-create",
    method: "POST",
    path: "/api/v1/orders",
    summary: "Tạo đơn hàng mới",
    auth: true,
    rateLimit: "20 lần/phút",
    params: [
      { name: "server_id", type: "string", required: true, description: "Mã máy chủ dịch vụ." },
      { name: "link", type: "string", required: true, description: "Liên kết hoặc ID mục tiêu." },
      { name: "quantity", type: "number", required: true, description: "Số lượng cần tăng." },
      { name: "note", type: "string", required: false, description: "Ghi chú nội bộ." },
    ],
  },
  {
    id: "ep-order-status",
    method: "GET",
    path: "/api/v1/orders/{id}",
    summary: "Xem trạng thái một đơn",
    auth: true,
    rateLimit: "60 lần/phút",
    params: [{ name: "id", type: "string", required: true, description: "Mã đơn hàng." }],
  },
  {
    id: "ep-order-refill",
    method: "POST",
    path: "/api/v1/orders/{id}/refill",
    summary: "Yêu cầu bảo hành / bù hụt",
    auth: true,
    rateLimit: "10 lần/phút",
    params: [{ name: "id", type: "string", required: true, description: "Mã đơn hàng." }],
  },
  {
    id: "ep-webhook",
    method: "POST",
    path: "/api/v1/webhooks",
    summary: "Đăng ký địa chỉ nhận callback",
    auth: true,
    rateLimit: "5 lần/phút",
    params: [
      { name: "url", type: "string", required: true, description: "Địa chỉ HTTPS nhận sự kiện." },
      { name: "events", type: "string[]", required: true, description: "Danh sách sự kiện cần nhận." },
    ],
  },
];

export const apiUsageSeries = Array.from({ length: 30 }, (_, i) => ({
  day: `${String(i + 1).padStart(2, "0")}/08`,
  calls: 420 + Math.round(Math.abs(Math.sin(i / 2.2)) * 980),
}));

export const apiStatus = {
  environment: "DEMO",
  state: "operational" as const,
  latency: "148 ms",
  uptime: "99,96%",
  version: "v1",
  callsThisMonth: 24_856,
  quota: 60_000,
};
