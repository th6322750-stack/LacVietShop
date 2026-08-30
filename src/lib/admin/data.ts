import { platforms, products } from "@/lib/demo/catalog";
import type { OrderStatus, ProductSlug } from "@/types";

/**
 * DỮ LIỆU DEMO CHO TRANG QUẢN TRỊ.
 *
 * Sinh cố định bằng PRNG có hạt giống nên server và client render giống nhau và
 * kết quả không đổi giữa các lần build. Không có dữ liệu người dùng thật nào ở đây
 * (PROJECT_HANDOFF §13); mọi tên/email/số điện thoại đều là hư cấu.
 *
 * Khi có backend thật, thay tệp này bằng adapter đọc API — UI không phải sửa.
 */

// ---------------------------------------------------------------------------
// Tài khoản quản trị + phân quyền
// ---------------------------------------------------------------------------
export const ADMIN_PERMISSIONS = [
  "orders.status",
  "orders.refund",
  "orders.delete",
  "services.edit",
  "services.delete",
  "products.edit",
  "products.delete",
  "users.balance",
  "users.level",
  "users.lock",
  "export.csv",
  "data.reset",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export interface AdminAccount {
  id: number;
  username: string;
  /** Mật khẩu trình diễn — bản dựng tĩnh không có backend xác thực (gap auth.provider). */
  password: string;
  name: string;
  role: string;
  email: string;
  permissions: AdminPermission[];
}

export const adminAccounts: AdminAccount[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Quản trị viên",
    role: "Quản trị viên",
    email: "admin@lacviet.demo",
    permissions: [...ADMIN_PERMISSIONS],
  },
  {
    id: 2,
    username: "hotro",
    password: "hotro123",
    name: "Nhân viên hỗ trợ",
    role: "Hỗ trợ",
    email: "hotro@lacviet.demo",
    permissions: ["orders.status", "orders.refund", "export.csv"],
  },
  {
    id: 3,
    username: "ketoan",
    password: "ketoan123",
    name: "Kế toán",
    role: "Kế toán",
    email: "ketoan@lacviet.demo",
    permissions: ["users.balance", "users.level", "export.csv"],
  },
];

// ---------------------------------------------------------------------------
// PRNG có hạt giống
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260831);
const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

// ---------------------------------------------------------------------------
// Người dùng
// ---------------------------------------------------------------------------
export type MemberLevel = "Thành viên" | "Cộng tác viên" | "Đại lý" | "Nhà phân phối";
export const memberLevels: MemberLevel[] = ["Thành viên", "Cộng tác viên", "Đại lý", "Nhà phân phối"];

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  level: MemberLevel;
  balance: number;
  status: "active" | "locked";
  createdAt: string;
}

const HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô", "Dương", "Lý"];
const DEM = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Quang", "Thanh", "Ngọc", "Gia", "Hải"];
const TEN = ["An", "Bình", "Cường", "Dũng", "Giang", "Hà", "Hùng", "Khánh", "Linh", "Mai", "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Tuấn", "Uyên", "Vy", "Yến", "Đạt"];

function noAccent(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isoDaysAgo(days: number, hour = 9, minute = 0) {
  const base = Date.UTC(2026, 7, 31, hour, minute, 0);
  return new Date(base - days * 86_400_000).toISOString();
}

export const adminUsers: AdminUser[] = Array.from({ length: 42 }, (_, i) => {
  const name = `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`;
  return {
    id: i + 1,
    name,
    email: `${noAccent(name)}${between(10, 999)}@demo.invalid`,
    phone: `0${pick(["3", "5", "7", "8", "9"])}${String(between(10_000_000, 99_999_999))}`,
    level: pick<MemberLevel>(["Thành viên", "Thành viên", "Thành viên", "Cộng tác viên", "Cộng tác viên", "Đại lý", "Nhà phân phối"]),
    balance: pick([0, 15_000, 120_000, 350_000, 1_200_000, 4_500_000]) + between(0, 9_999),
    status: rand() < 0.07 ? "locked" : "active",
    createdAt: isoDaysAgo(between(1, 420)),
  };
});

// ---------------------------------------------------------------------------
// Dịch vụ (phẳng hoá từ catalog) — bảng giá 4 bậc
// ---------------------------------------------------------------------------
export interface AdminService {
  id: string;
  platformId: string;
  platformName: string;
  platformAssetKey: string;
  serviceName: string;
  serverName: string;
  code: string;
  /** Giá theo 4 cấp bậc, đồng/tương tác. */
  prices: [number, number, number, number];
  min: number;
  max: number;
  active: boolean;
}

export const adminServices: AdminService[] = platforms.flatMap((platform) =>
  platform.services.flatMap((service) =>
    service.servers.map((server) => {
      const base = server.pricePerUnit;
      return {
        id: server.id,
        platformId: platform.id,
        platformName: platform.name,
        platformAssetKey: platform.assetKey,
        serviceName: service.name,
        serverName: server.name,
        code: server.code,
        prices: [
          base,
          Math.round(base * 0.97 * 1000) / 1000,
          Math.round(base * 0.94 * 1000) / 1000,
          Math.round(base * 0.9 * 1000) / 1000,
        ] as [number, number, number, number],
        min: server.min,
        max: server.max,
        active: server.available,
      };
    }),
  ),
);

// ---------------------------------------------------------------------------
// Đơn hàng
// ---------------------------------------------------------------------------
export interface AdminOrder {
  id: number;
  code: string;
  userId: number;
  serviceId: string;
  platformName: string;
  serviceName: string;
  target: string;
  quantity: number;
  delivered: number;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

const statusPool: OrderStatus[] = [
  ...Array<OrderStatus>(56).fill("completed"),
  ...Array<OrderStatus>(14).fill("running"),
  ...Array<OrderStatus>(8).fill("processing"),
  ...Array<OrderStatus>(7).fill("pending"),
  ...Array<OrderStatus>(8).fill("refunded"),
  ...Array<OrderStatus>(7).fill("canceled"),
];

export const adminOrders: AdminOrder[] = Array.from({ length: 260 }, (_, i) => {
  const service = pick(adminServices);
  const user = pick(adminUsers);
  const levelIndex = memberLevels.indexOf(user.level);
  const price = service.prices[levelIndex] ?? service.prices[0];
  const quantity = Math.max(service.min, Math.min(service.max, pick([100, 200, 500, 1_000, 2_000, 5_000, 10_000]) * between(1, 3)));
  const status = pick(statusPool);
  const daysAgo = between(0, 29);
  return {
    id: 24_100 + i,
    code: `LV${260831 - daysAgo}${String(i).padStart(3, "0")}`,
    userId: user.id,
    serviceId: service.id,
    platformName: service.platformName,
    serviceName: service.serviceName,
    target: `https://${service.platformId}.com/demo/${between(100_000, 999_999)}`,
    quantity,
    delivered: status === "completed" ? quantity : status === "running" ? Math.round(quantity * 0.45) : 0,
    amount: Math.round(quantity * price),
    status,
    createdAt: isoDaysAgo(daysAgo, between(0, 23), between(0, 59)),
  };
}).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// ---------------------------------------------------------------------------
// Sản phẩm premium
// ---------------------------------------------------------------------------
export interface AdminProduct {
  slug: ProductSlug;
  name: string;
  assetKey: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  active: boolean;
}

export const adminProducts: AdminProduct[] = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  assetKey: p.assetKey,
  category: p.category,
  price: p.fromPrice,
  stock: pick([0, 5, 12, 28, 45, 90]),
  sold: p.sold,
  active: true,
}));

// ---------------------------------------------------------------------------
// Giao dịch
// ---------------------------------------------------------------------------
export type AdminTxType = "deposit" | "order" | "refund" | "commission" | "withdraw";

export interface AdminTransaction {
  id: number;
  userId: number;
  type: AdminTxType;
  amount: number;
  note: string;
  createdAt: string;
}

let txId = 9_000;
export const adminTransactions: AdminTransaction[] = [
  ...adminOrders.slice(0, 160).flatMap<AdminTransaction>((order) => {
    const rows: AdminTransaction[] = [
      {
        id: (txId += 1),
        userId: order.userId,
        type: "order",
        amount: -order.amount,
        note: `Đơn #${order.id} · ${order.platformName} · ${order.serviceName}`,
        createdAt: order.createdAt,
      },
    ];
    if (order.status === "refunded") {
      rows.push({
        id: (txId += 1),
        userId: order.userId,
        type: "refund",
        amount: order.amount,
        note: `Hoàn tiền đơn #${order.id}`,
        createdAt: order.createdAt,
      });
    }
    return rows;
  }),
  ...adminUsers.slice(0, 30).map<AdminTransaction>((user, i) => ({
    id: (txId += 1),
    userId: user.id,
    type: "deposit",
    amount: pick([50_000, 200_000, 500_000, 1_000_000, 2_000_000]),
    note: "Nạp tiền qua chuyển khoản ngân hàng",
    createdAt: isoDaysAgo(between(0, 29), 8 + (i % 12)),
  })),
].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// ---------------------------------------------------------------------------
// Nhãn trạng thái
// ---------------------------------------------------------------------------
export const orderStatusLabels: Record<OrderStatus, string> = {
  completed: "Hoàn thành",
  running: "Đang chạy",
  processing: "Đang xử lý",
  pending: "Đang chờ",
  refunded: "Đã hoàn tiền",
  canceled: "Đã huỷ",
};

export const txTypeLabels: Record<AdminTxType, string> = {
  deposit: "Nạp tiền",
  order: "Đặt đơn",
  refund: "Hoàn tiền",
  commission: "Hoa hồng",
  withdraw: "Rút tiền",
};
