/**
 * Tra cứu máy chủ dịch vụ ở phía máy chủ.
 *
 * Trang đặt đơn gửi lên mã máy chủ, TUYỆT ĐỐI không gửi giá. Giá phải được tính
 * lại ở đây từ danh mục sống cộng bảng giá hiện hành — nếu tin con số trình duyệt
 * gửi lên thì ai sửa vài dòng JavaScript là mua được giá một đồng.
 */
import { getLiveCatalog } from "@/lib/thatim/catalog";
import type { Platform, PlatformService, ServiceServer } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("src/lib/server/services.ts chỉ được dùng phía server.");
}

export interface FoundServer {
  platform: Platform;
  service: PlatformService;
  server: ServiceServer;
}

export async function findServer(serverId: string): Promise<FoundServer | null> {
  const catalog = await getLiveCatalog();
  for (const platform of catalog.platforms) {
    for (const service of platform.services) {
      const server = service.servers.find((s) => s.id === serverId);
      if (server) return { platform, service, server };
    }
  }
  return null;
}
