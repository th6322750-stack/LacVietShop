"use client";

import * as React from "react";
import { useCustomerAuth } from "./auth";

/**
 * Sổ tiền và nhật ký của KHÁCH HÀNG — toàn bộ lấy từ máy chủ.
 *
 * Trước đây các trang Dòng tiền, Lịch sử, Tài khoản đọc dữ liệu mẫu trong
 * src/lib/demo/data.ts nên khách chưa đăng nhập vẫn thấy đơn hàng, số dư và
 * giao dịch của một người không có thật. Với trang bán hàng thì đó là nói dối,
 * nên mọi con số ở đây phải đến từ hai nguồn thật:
 *
 *   - /api/deposits         → các lệnh nạp tiền, đã đối chiếu với SePay
 *   - /api/products/orders  → các đơn mua tài khoản premium
 *   - /api/orders           → các đơn dịch vụ tương tác
 *
 * Chưa đăng nhập thì không gọi gì cả và trả về rỗng; trang gọi hook sẽ hiện
 * màn hình mời đăng nhập.
 */

export interface Deposit {
  id: string;
  code: string;
  amount: number;
  status: "pending" | "success" | "canceled";
  method: string;
  createdAt: string;
  paidAt?: string | null;
  note?: string | null;
}

export interface ServiceOrder {
  id: string;
  platformName: string;
  serviceName: string;
  serverName: string;
  link: string;
  quantity: number;
  amount: number;
  status: "pending" | "processing" | "running" | "completed" | "partial" | "canceled" | "refunded";
  providerOrderId: string | null;
  startCount: number;
  remains: number;
  createdAt: string;
  refunded: number;
  note?: string | null;
}

export interface PurchaseOrder {
  id: string;
  productSlug: string;
  productName: string;
  packageName: string;
  amount: number;
  status: "pending" | "delivered" | "canceled";
  createdAt: string;
  deliveredAt?: string | null;
  note?: string | null;
}

/** Một dòng trong sổ tiền: nạp vào, mua hàng, hoặc hoàn tiền khi huỷ đơn. */
export interface LedgerEntry {
  id: string;
  kind: "deposit" | "purchase" | "refund";
  title: string;
  detail: string;
  amount: number;
  /** Dương là tiền vào, âm là tiền ra. */
  direction: 1 | -1;
  at: string;
}

export interface Ledger {
  ready: boolean;
  signedIn: boolean;
  loading: boolean;
  balance: number;
  deposits: Deposit[];
  orders: PurchaseOrder[];
  services: ServiceOrder[];
  entries: LedgerEntry[];
  reload: (sync?: boolean) => Promise<void>;
}

const KIND_LABEL: Record<LedgerEntry["kind"], string> = {
  deposit: "Nạp tiền",
  purchase: "Mua hàng",
  refund: "Hoàn tiền",
};

export function ledgerKindLabel(kind: LedgerEntry["kind"]) {
  return KIND_LABEL[kind];
}

/** Mã cổng nạp lưu trong cơ sở dữ liệu, đọc ra cho người thường hiểu. */
export function depositMethodLabel(method: string) {
  if (method === "bank") return "Chuyển khoản ngân hàng";
  if (method === "momo") return "Ví MoMo";
  return method;
}

/** Dựng sổ tiền theo thứ tự mới nhất trước. */
function buildEntries(deposits: Deposit[], orders: PurchaseOrder[], services: ServiceOrder[]): LedgerEntry[] {
  const out: LedgerEntry[] = [];

  for (const d of deposits) {
    // Chỉ tiền đã thực nhận mới là một dòng trong sổ; lệnh còn chờ chưa phải tiền.
    if (d.status !== "success") continue;
    out.push({
      id: `nap-${d.id}`,
      kind: "deposit",
      title: "Nạp tiền thành công",
      detail: `${depositMethodLabel(d.method)} · mã ${d.code}`,
      amount: d.amount,
      direction: 1,
      at: d.paidAt ?? d.createdAt,
    });
  }

  for (const o of orders) {
    out.push({
      id: `mua-${o.id}`,
      kind: "purchase",
      title: `Mua ${o.productName}`,
      detail: o.packageName,
      amount: o.amount,
      direction: -1,
      at: o.createdAt,
    });
    // Đơn bị huỷ thì tiền đã được trả lại, phải hiện thành một dòng riêng chứ
    // không lặng lẽ xoá dòng mua đi.
    if (o.status === "canceled") {
      out.push({
        id: `hoan-${o.id}`,
        kind: "refund",
        title: `Hoàn tiền đơn ${o.productName}`,
        detail: o.note?.trim() || o.packageName,
        amount: o.amount,
        direction: 1,
        at: o.deliveredAt ?? o.createdAt,
      });
    }
  }

  for (const o of services) {
    out.push({
      id: `dv-${o.id}`,
      kind: "purchase",
      title: `Đặt ${o.serviceName}`,
      detail: `${o.platformName} · ${o.quantity.toLocaleString("vi-VN")} · ${o.serverName}`,
      amount: o.amount,
      direction: -1,
      at: o.createdAt,
    });
    if (o.refunded > 0) {
      out.push({
        id: `dvhoan-${o.id}`,
        kind: "refund",
        title: `Hoàn tiền đơn ${o.serviceName}`,
        detail: o.note?.trim() || o.platformName,
        amount: o.refunded,
        direction: 1,
        at: o.createdAt,
      });
    }
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

export function useLedger(): Ledger {
  const { session, ready, refresh } = useCustomerAuth();
  const [deposits, setDeposits] = React.useState<Deposit[]>([]);
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [services, setServices] = React.useState<ServiceOrder[]>([]);
  const [loading, setLoading] = React.useState(false);

  const signedIn = Boolean(session);

  const reload = React.useCallback(
    async (sync = false) => {
      if (!signedIn) {
        setDeposits([]);
        setOrders([]);
        setServices([]);
        return;
      }
      setLoading(true);
      // sync=true mới hỏi lại nhà cung cấp; mỗi lượt mở trang đều hỏi thì vừa
      // chậm vừa gọi API của họ vô ích.
      const [nap, don, dv] = await Promise.all([
        fetch("/api/deposits")
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/products/orders")
          .then((r) => r.json())
          .catch(() => null),
        fetch(sync ? "/api/orders?sync=1" : "/api/orders")
          .then((r) => r.json())
          .catch(() => null),
      ]);
      setDeposits(nap?.ok ? (nap.deposits ?? []) : []);
      setOrders(don?.ok ? (don.orders ?? []) : []);
      setServices(dv?.ok ? (dv.orders ?? []) : []);
      setLoading(false);
      // Số dư đổi sau mỗi lần nạp/mua nên hỏi lại luôn cho thanh trên cùng khớp.
      await refresh();
    },
    [signedIn, refresh],
  );

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const entries = React.useMemo(() => buildEntries(deposits, orders, services), [deposits, orders, services]);

  return {
    ready,
    signedIn,
    loading,
    balance: session?.balance ?? 0,
    deposits,
    orders,
    services,
    entries,
    reload,
  };
}
