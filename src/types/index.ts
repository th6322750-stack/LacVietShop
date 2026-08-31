/** Kiểu dữ liệu dùng chung. Mọi dữ liệu hiện tại đến từ DEMO adapter (src/lib/demo). */

export type LoadState = "idle" | "loading" | "empty" | "error" | "ready";

export type OrderStatus =
  | "completed"
  | "running"
  | "pending"
  | "processing"
  | "refunded"
  | "canceled";

export type TransactionType = "deposit" | "order" | "refund" | "commission" | "withdraw";

export type MemberTier = "member" | "collaborator" | "agency" | "distributor";

export interface Money {
  amount: number;
  currency: "VND";
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  region: "vn" | "global";
  assetKey: string;
  services: PlatformService[];
}

export interface PlatformService {
  id: string;
  name: string;
  slug: string;
  platformId: string;
  servers: ServiceServer[];
}

export interface ServiceServer {
  id: string;
  /** Mã máy chủ hiển thị — do hệ thống mình đánh, không phải id của nhà cung cấp. */
  code: string;
  /** service_id thật của nhà cung cấp; điền khi đấu API thatim.vn, hiện để null. */
  apiServiceId: string | null;
  /** Số thứ tự máy chủ trong nhóm dịch vụ, đúng như bảng bên nguồn. */
  index: number;
  /** Tên rút gọn dùng cho ô chọn và bảng. */
  name: string;
  /** Tên đầy đủ nguyên văn, kèm mọi thông số ngăn bởi dấu "~". */
  fullName: string;
  pricePerUnit: number;
  /** Giá theo từng bậc thành viên, cùng thứ tự với serviceTiers. */
  pricesByTier: number[];
  min: number;
  max: number;
  /** Các thông số dưới đây chỉ có khi nguồn ghi rõ — không tự bịa. */
  speed?: string;
  refill?: string;
  startTime?: string;
  sourceNote?: string;
  note?: string;
  available: boolean;
  tags: string[];
  supportsReaction?: boolean;
  /**
   * "api"   = lấy trực tiếp từ API nhà cung cấp (có apiServiceId, đặt đơn thật được)
   * "clone" = thông số thật đọc từ bản chụp trang nhà cung cấp
   * "demo"  = chỗ dành sẵn chờ đấu API
   */
  source: "api" | "clone" | "demo";
}

export interface ProductPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  highlight?: boolean;
  badge?: string;
  bullets: string[];
  inStock: boolean;
}

export interface ProductVariant {
  slug: ProductSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  assetKey: string;
  heroAssetKey?: string;
  heroTone: "light" | "dark";
  accent: string;
  category: string;
  badges: string[];
  packages: ProductPackage[];
  benefits: { title: string; detail: string }[];
  requirements: string[];
  warranty: string[];
  fromPrice: number;
  sold: number;
  rating: number;
  /** Khối trưng bày mở rộng — chỉ render khi biến thể có dữ liệu (không gắn cứng theo slug). */
  keyFeatures?: string[];
  sampleSwatches?: { colors: string[]; caption: string };
  receiveNotes?: string[];
  reviewSummary?: { rating: number; note: string };
  showConsultCta?: boolean;
}

export type ProductSlug =
  | "youtube"
  | "capcut"
  | "canva"
  | "veo3"
  | "gemini"
  | "chatgpt"
  | "netflix"
  | "vpn";

export interface Order {
  id: string;
  code: string;
  platformName: string;
  serviceName: string;
  target: string;
  quantity: number;
  startCount: number;
  delivered: number;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  reference?: string;
}

export interface ActivityItem {
  id: string;
  kind: "order" | "login" | "security" | "payment" | "product";
  title: string;
  detail: string;
  createdAt: string;
  status?: "success" | "warning" | "danger" | "info";
}

export interface PurchasedItem {
  id: string;
  productSlug: ProductSlug;
  productName: string;
  packageName: string;
  purchasedAt: string;
  expiresAt: string;
  status: "active" | "expiring" | "expired";
  credential: { label: string; value: string; masked: boolean }[];
  warrantyNote: string;
}

export interface ChildPanel {
  id: string;
  subdomain: string;
  ownerName: string;
  plan: string;
  status: "active" | "pending" | "suspended";
  members: number;
  revenue: number;
  createdAt: string;
}

export interface ReferredUser {
  id: string;
  name: string;
  joinedAt: string;
  level: MemberTier;
  totalSpent: number;
  commission: number;
  status: "active" | "inactive";
}

export interface ApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  auth: boolean;
  rateLimit: string;
  params: { name: string; type: string; required: boolean; description: string }[];
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  tone: "info" | "success" | "warning";
  pinned?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  kind: "bank" | "ewallet" | "card" | "crypto";
  assetKey: string;
  detail: string;
  processingTime: string;
  feeNote: string;
  available: boolean;
}

export interface AccountProfile {
  displayName: string;
  username: string;
  emailMasked: string;
  phoneMasked: string;
  tier: MemberTier;
  tierLabel: string;
  balance: number;
  totalDeposited: number;
  totalSpent: number;
  joinedAt: string;
  twoFactorEnabled: boolean;
  apiTokenMasked: string;
}
