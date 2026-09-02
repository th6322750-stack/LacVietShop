/**
 * Lột dữ liệu nội bộ nhà cung cấp khỏi máy chủ trước khi trả ra trình duyệt.
 *
 * Mã dịch vụ nguồn, giá vốn và cờ bán-dưới-vốn KHÔNG được ra khỏi máy chủ. Dùng
 * chung cho mọi đường công khai (danh mục và danh sách máy chủ theo dịch vụ).
 */
import type { Platform, ServiceServer } from "@/types";

/** Một máy chủ đã lột trường nội bộ — chỉ còn cái khách cần. */
export type PublicServer = Omit<ServiceServer, "apiServiceId" | "code" | "costPerUnit" | "belowCost">;

export function stripServer(server: ServiceServer): PublicServer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiServiceId, code, costPerUnit, belowCost, ...pub } = server;
  return pub;
}

export function stripCatalog(platforms: Platform[]) {
  return platforms.map((p) => ({
    ...p,
    services: p.services.map((s) => ({ ...s, servers: s.servers.map(stripServer) })),
  }));
}
