/**
 * Nạp danh mục dịch vụ sống từ API nhà cung cấp.
 *
 * Kết quả nhớ trong bộ đệm dữ liệu của Next, KHÔNG phải biến trong tiến trình.
 * Lý do: trên Vercel mỗi lượt truy cập có thể rơi vào một tiến trình mới, biến
 * nhớ tạm coi như vô dụng và lần nào cũng phải gọi lại API (mất 5–6 giây, khách
 * ngồi nhìn khung xám). Bộ đệm dữ liệu dùng chung cho mọi tiến trình nên chỉ lượt
 * đầu tiên chịu độ trễ đó.
 *
 * Đổi bảng giá thì gọi clearCatalogCache() để bỏ đệm, giá mới hiện ngay.
 *
 * API hỏng hoặc chưa cấu hình khoá → tự rơi về danh mục tĩnh dựng từ bản chụp
 * trang của họ, để trang đặt dịch vụ không bao giờ trắng.
 */
import { revalidateTag, unstable_cache } from "next/cache";
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

const CATALOG_TAG = "thatim-catalog";

/** Bỏ đệm để lượt lấy tiếp theo ra giá mới ngay. Gọi sau khi đổi bảng giá. */
export function clearCatalogCache() {
  cache = null;
  try {
    revalidateTag(CATALOG_TAG);
  } catch {
    // Ngoài route handler thì gọi được cũng không sao, bỏ qua.
  }
}

/** Lấy thẳng từ API, không qua đệm. */
async function loadFromApi(): Promise<LiveCatalog> {
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

const loadCached = unstable_cache(loadFromApi, [CATALOG_TAG], {
  revalidate: thatimConfig.cacheSeconds,
  tags: [CATALOG_TAG],
});

export async function getLiveCatalog(force = false): Promise<LiveCatalog> {
  if (force) {
    clearCatalogCache();
    return loadFromApi();
  }
  return loadCached();
}
