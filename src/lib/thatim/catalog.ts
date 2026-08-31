/**
 * Nạp danh mục dịch vụ sống từ API nhà cung cấp, nhớ tạm trong bộ nhớ tiến trình.
 *
 * API hỏng hoặc chưa cấu hình khoá → tự rơi về danh mục tĩnh dựng từ bản chụp
 * trang của họ, để trang đặt dịch vụ không bao giờ trắng.
 */
import type { Platform } from "@/types";
import { getServices } from "./client";
import { mapServicesToPlatforms } from "./map";
import { thatimConfig, isThatimConfigured, tierMultipliers } from "./config";
import { readRules, sellingPrice } from "@/lib/server/pricing";
import { platforms as fallbackPlatforms } from "@/lib/demo/services-catalog";

if (typeof window !== "undefined") {
  throw new Error("src/lib/thatim/catalog.ts chỉ được dùng phía server.");
}

export interface LiveCatalog {
  /** "api" = danh mục thật; "fallback" = danh mục tĩnh dự phòng. */
  source: "api" | "fallback";
  platforms: Platform[];
  fetchedAt: string;
  platformCount: number;
  serviceCount: number;
  serverCount: number;
  /** Lý do phải dùng dự phòng, nếu có. */
  error?: string;
}

let cache: { at: number; value: LiveCatalog } | null = null;

function summarize(platforms: Platform[]) {
  return {
    platformCount: platforms.length,
    serviceCount: platforms.reduce((s, p) => s + p.services.length, 0),
    serverCount: platforms.reduce((s, p) => s + p.services.reduce((n, x) => n + x.servers.length, 0), 0),
  };
}

function fallbackCatalog(error?: string): LiveCatalog {
  return {
    source: "fallback",
    platforms: fallbackPlatforms,
    fetchedAt: new Date().toISOString(),
    ...summarize(fallbackPlatforms),
    ...(error ? { error } : {}),
  };
}

export function cachedCatalog() {
  return cache?.value ?? null;
}

export function clearCatalogCache() {
  cache = null;
}

export async function getLiveCatalog(force = false): Promise<LiveCatalog> {
  if (!force && cache && Date.now() - cache.at < thatimConfig.cacheSeconds * 1000) {
    return cache.value;
  }
  if (!isThatimConfigured()) {
    return fallbackCatalog("Chưa cấu hình THATIM_API_KEY.");
  }

  const res = await getServices();
  if (!res.ok) {
    // Còn bản nhớ tạm cũ thì dùng tiếp, hơn là tụt về danh mục tĩnh.
    if (cache) return { ...cache.value, error: res.error };
    return fallbackCatalog(res.error);
  }

  const rules = await readRules();
  const platforms = mapServicesToPlatforms(res.data, {
    usdToVnd: thatimConfig.usdToVnd,
    tierMultipliers,
    price: (cost, apiServiceId) => sellingPrice(cost, apiServiceId, rules),
  });

  const value: LiveCatalog = {
    source: "api",
    platforms,
    fetchedAt: new Date().toISOString(),
    ...summarize(platforms),
  };
  cache = { at: Date.now(), value };
  return value;
}
