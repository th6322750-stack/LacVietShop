/**
 * Vòng đời đơn dịch vụ.
 *
 * Ba việc dùng chung cho cả khách lẫn quản trị:
 *   - đẩy đơn sang nhà cung cấp (lần đầu hoặc đẩy lại khi ví đã có tiền),
 *   - hỏi lại tiến độ,
 *   - huỷ và hoàn tiền.
 *
 * Đơn chưa đẩy được KHÔNG bị huỷ: nó nằm chờ ở trang quản trị để người chạy tay
 * hoặc đẩy lại sau. Tiền khách vẫn giữ, nhưng huỷ lúc nào cũng hoàn đủ.
 */
import { addBalance, findServiceOrder, listServiceOrders, updateServiceOrder, type ServiceOrder } from "./db";
import { addOrder, getOrderStatus } from "@/lib/thatim/client";
import { isThatimConfigured } from "@/lib/thatim/config";
import { autoPushEnabled } from "./ops";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/service-orders.ts chỉ được dùng phía server.");
}

/** Đơn đã chốt sổ thì không đụng vào nữa. */
export const FINAL: ServiceOrder["status"][] = ["completed", "canceled", "refunded"];

/** Trạng thái nhà cung cấp trả về, quy về từ vựng của mình. */
function mapStatus(raw: string): ServiceOrder["status"] {
  const s = raw.toLowerCase();
  if (s.includes("completed")) return "completed";
  if (s.includes("partial")) return "partial";
  if (s.includes("progress") || s.includes("processing")) return "running";
  if (s.includes("pending")) return "processing";
  if (s.includes("cancel")) return "canceled";
  return "processing";
}

/**
 * Đẩy một đơn sang nhà cung cấp.
 * Hỏng thì đơn vẫn nằm chờ ở trạng thái "pending" kèm lý do — không hoàn tiền,
 * không huỷ, để quản trị quyết định.
 */
export async function pushServiceOrder(id: string): Promise<{ ok: true; order: ServiceOrder } | { ok: false; error: string; order: ServiceOrder | null }> {
  const order = await findServiceOrder(id);
  if (!order) return { ok: false, error: "Không tìm thấy đơn.", order: null };
  if (order.providerOrderId) return { ok: true, order };
  if (FINAL.includes(order.status)) return { ok: false, error: "Đơn đã chốt, không đẩy được nữa.", order };

  if (!isThatimConfigured() || !(await autoPushEnabled())) {
    const why = !isThatimConfigured() ? "Chưa cấu hình khoá API." : "Quản trị đang tắt tự đẩy đơn.";
    const next = await updateServiceOrder(id, { status: "pending", note: `Chờ xử lý tay: ${why}` });
    return { ok: false, error: why, order: next };
  }

  const res = await addOrder({ service: order.apiServiceId, link: order.link, quantity: order.quantity });
  if (!res.ok) {
    const next = await updateServiceOrder(id, { status: "pending", note: `Chưa đẩy được: ${res.error}` });
    return { ok: false, error: res.error, order: next };
  }

  const next = await updateServiceOrder(id, {
    status: "processing",
    providerOrderId: String(res.data.order),
    note: null,
  });
  return { ok: true, order: next ?? order };
}

/** Hỏi lại tiến độ những đơn đã đẩy và chưa chốt sổ. */
export async function syncServiceOrders(accountId?: string) {
  const orders = await listServiceOrders(accountId);
  const live = orders.filter((o) => o.providerOrderId && !FINAL.includes(o.status));
  if (live.length === 0) return 0;

  let changed = 0;
  for (const o of live) {
    const res = await getOrderStatus(o.providerOrderId!);
    if (!res.ok) continue;

    const status = mapStatus(String(res.data.status ?? ""));
    const remains = Number(res.data.remains ?? o.remains) || 0;
    const startCount = Number(res.data.start_count ?? o.startCount) || 0;

    // Nhà cung cấp huỷ đơn thì tiền phải quay lại túi khách, không đợi ai nhắc.
    if (status === "canceled" && o.refunded === 0) {
      await addBalance(o.accountId, o.amount);
      await updateServiceOrder(o.id, {
        status: "refunded",
        refunded: o.amount,
        remains,
        startCount,
        note: "Nhà cung cấp huỷ đơn, đã hoàn tiền.",
      });
      changed++;
      continue;
    }

    if (status !== o.status || remains !== o.remains || startCount !== o.startCount) {
      await updateServiceOrder(o.id, { status, remains, startCount });
      changed++;
    }
  }
  return changed;
}

/** Huỷ đơn và hoàn đủ tiền. Đơn đã hoàn rồi thì không hoàn lần hai. */
export async function refundServiceOrder(id: string, note: string) {
  const order = await findServiceOrder(id);
  if (!order) return null;
  if (order.refunded > 0) return order;

  await addBalance(order.accountId, order.amount);
  return updateServiceOrder(id, { status: "refunded", refunded: order.amount, note });
}
