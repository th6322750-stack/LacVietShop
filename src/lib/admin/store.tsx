"use client";

import * as React from "react";
import {
  adminOrders,
  adminProducts,
  adminServices,
  adminTransactions,
  adminUsers,
  type AdminOrder,
  type AdminProduct,
  type AdminService,
  type AdminTransaction,
  type AdminUser,
  type MemberLevel,
} from "./data";
import type { OrderStatus } from "@/types";

/**
 * Kho dữ liệu quản trị.
 *
 * Khởi tạo từ seed cố định (SSR và client giống nhau), sau khi mount thì nạp bản
 * đã chỉnh trong localStorage nếu có. Mọi thao tác ghi đều lưu lại nên F5 vẫn còn.
 * Đây là adapter DEMO — khi có backend thật chỉ cần thay phần thân các hàm ghi.
 */

const KEY = "lacviet_admin_db_v1";

interface AdminDb {
  orders: AdminOrder[];
  users: AdminUser[];
  services: AdminService[];
  products: AdminProduct[];
  transactions: AdminTransaction[];
}

function seed(): AdminDb {
  return {
    orders: adminOrders,
    users: adminUsers,
    services: adminServices,
    products: adminProducts,
    transactions: adminTransactions,
  };
}

interface StoreContextValue extends AdminDb {
  hydrated: boolean;
  setOrderStatus: (id: number, status: OrderStatus) => void;
  deleteOrder: (id: number) => void;
  updateService: (id: string, patch: Partial<AdminService>) => void;
  deleteService: (id: string) => void;
  updateProduct: (slug: string, patch: Partial<AdminProduct>) => void;
  deleteProduct: (slug: string) => void;
  adjustBalance: (userId: number, amount: number, note: string) => void;
  setUserLevel: (userId: number, level: MemberLevel) => void;
  toggleUserLock: (userId: number) => void;
  reset: () => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = React.useState<AdminDb>(seed);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDb(JSON.parse(raw) as AdminDb);
    } catch {
      /* dữ liệu hỏng hoặc bị chặn -> dùng seed */
    }
    setHydrated(true);
  }, []);

  const persist = React.useCallback((next: AdminDb) => {
    setDb(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
  }, []);

  const nextTxId = (list: AdminTransaction[]) => list.reduce((m, t) => Math.max(m, t.id), 0) + 1;

  const value = React.useMemo<StoreContextValue>(
    () => ({
      ...db,
      hydrated,

      setOrderStatus(id, status) {
        const order = db.orders.find((o) => o.id === id);
        if (!order) return;
        const wasRefunded = order.status === "refunded";
        const orders = db.orders.map((o) =>
          o.id === id ? { ...o, status, delivered: status === "completed" ? o.quantity : o.delivered } : o,
        );

        // Hoàn tiền: cộng lại số dư cho khách và ghi một giao dịch.
        if (status === "refunded" && !wasRefunded) {
          const users = db.users.map((u) =>
            u.id === order.userId ? { ...u, balance: u.balance + order.amount } : u,
          );
          const transactions = [
            {
              id: nextTxId(db.transactions),
              userId: order.userId,
              type: "refund" as const,
              amount: order.amount,
              note: `Hoàn tiền đơn #${order.id}`,
              createdAt: new Date().toISOString(),
            },
            ...db.transactions,
          ];
          persist({ ...db, orders, users, transactions });
          return;
        }
        persist({ ...db, orders });
      },

      deleteOrder(id) {
        persist({ ...db, orders: db.orders.filter((o) => o.id !== id) });
      },

      updateService(id, patch) {
        persist({ ...db, services: db.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
      },

      deleteService(id) {
        persist({ ...db, services: db.services.filter((s) => s.id !== id) });
      },

      updateProduct(slug, patch) {
        persist({ ...db, products: db.products.map((p) => (p.slug === slug ? { ...p, ...patch } : p)) });
      },

      deleteProduct(slug) {
        persist({ ...db, products: db.products.filter((p) => p.slug !== slug) });
      },

      adjustBalance(userId, amount, note) {
        const users = db.users.map((u) => (u.id === userId ? { ...u, balance: u.balance + amount } : u));
        const transactions = [
          {
            id: nextTxId(db.transactions),
            userId,
            type: amount >= 0 ? ("deposit" as const) : ("withdraw" as const),
            amount,
            note,
            createdAt: new Date().toISOString(),
          },
          ...db.transactions,
        ];
        persist({ ...db, users, transactions });
      },

      setUserLevel(userId, level) {
        persist({ ...db, users: db.users.map((u) => (u.id === userId ? { ...u, level } : u)) });
      },

      toggleUserLock(userId) {
        persist({
          ...db,
          users: db.users.map((u) =>
            u.id === userId ? { ...u, status: u.status === "locked" ? "active" : "locked" } : u,
          ),
        });
      },

      reset() {
        persist(seed());
      },
    }),
    [db, hydrated, persist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAdminStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useAdminStore phải nằm trong <AdminStoreProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Thống kê
// ---------------------------------------------------------------------------
const PAID: OrderStatus[] = ["completed", "running", "processing", "pending"];

export function revenueOf(orders: AdminOrder[]) {
  return orders.reduce((sum, o) => (PAID.includes(o.status) ? sum + o.amount : sum), 0);
}

export function revenueByDay(orders: AdminOrder[], days = 30) {
  const map = new Map<string, { day: string; revenue: number; orders: number }>();
  for (const o of orders) {
    const key = o.createdAt.slice(0, 10);
    const row = map.get(key) ?? { day: key, revenue: 0, orders: 0 };
    row.orders += 1;
    if (PAID.includes(o.status)) row.revenue += o.amount;
    map.set(key, row);
  }
  const out: { day: string; revenue: number; orders: number }[] = [];
  const base = Date.UTC(2026, 7, 31);
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(base - i * 86_400_000).toISOString().slice(0, 10);
    const row = map.get(key) ?? { day: key, revenue: 0, orders: 0 };
    out.push({ ...row, day: key.slice(5) });
  }
  return out;
}

export function statusCounts(orders: AdminOrder[]) {
  const counts: Partial<Record<OrderStatus, number>> = {};
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return counts;
}

export function topServices(orders: AdminOrder[], limit = 10) {
  const map = new Map<string, { name: string; platform: string; orders: number; revenue: number }>();
  for (const o of orders) {
    const row = map.get(o.serviceId) ?? { name: o.serviceName, platform: o.platformName, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue += o.amount;
    map.set(o.serviceId, row);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
