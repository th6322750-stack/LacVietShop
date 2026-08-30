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
  code: string;
  name: string;
  pricePerUnit: number;
  min: number;
  max: number;
  speed: string;
  refill: string;
  startTime: string;
  note?: string;
  available: boolean;
  tags: string[];
  supportsReaction?: boolean;
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

export interface ProductFaq {
  question: string;
  answer: string;
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
  faqs: ProductFaq[];
  fromPrice: number;
  sold: number;
  rating: number;
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
