/**
 * Công tắc vận hành.
 *
 * Hiện chỉ có một cái: có tự đẩy đơn dịch vụ sang nhà cung cấp hay không.
 *
 * Trước đây việc này do biến môi trường THATIM_ALLOW_ORDERS quyết định — muốn
 * đổi phải sửa tệp rồi khởi động lại máy chủ. Ví nhà cung cấp hết tiền lúc nửa
 * đêm thì quản trị không tự tắt được. Nay công tắc nằm trong cơ sở dữ liệu, bật
 * tắt ngay trên trang quản trị; biến môi trường chỉ còn là giá trị mặc định cho
 * lần chạy đầu tiên.
 *
 * Tắt KHÔNG có nghĩa là ngừng bán: khách vẫn đặt được, tiền vẫn trừ, đơn nằm ở
 * hàng đợi để người trực chạy tay. Đó là điều đã thống nhất với chủ hệ thống.
 */
import { getOps, putOps, type OpsSettings } from "./db";
import { thatimConfig } from "@/lib/thatim/config";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/ops.ts chỉ được dùng phía server.");
}

export type { OpsSettings };

export async function readOps(): Promise<OpsSettings> {
  const stored = await getOps();
  if (stored) return stored;
  return {
    autoPushOrders: thatimConfig.allowOrders,
    updatedAt: new Date().toISOString(),
  };
}

/** Có được phép đẩy đơn sang nhà cung cấp lúc này không. */
export async function autoPushEnabled() {
  return (await readOps()).autoPushOrders;
}

export async function writeOps(patch: { autoPushOrders: boolean }, by: string) {
  const next: OpsSettings = {
    autoPushOrders: patch.autoPushOrders,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  await putOps(next);
  return next;
}
