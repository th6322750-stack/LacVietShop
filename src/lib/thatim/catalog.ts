/**
 * Nạp danh mục dịch vụ sống từ API nhà cung cấp.
 *
 * Chỉ đệm phần CHẬM là lời gọi API nhà cung cấp, dùng bộ đệm dữ liệu của Next
 * (chung cho mọi tiến trình). Trên Vercel mỗi lượt truy cập có thể rơi vào một
 * tiến trình mới nên biến nhớ trong tiến trình coi như vô dụng — không đệm thì
 * lần nào cũng mất 5–6 giây, khách ngồi nhìn khung xám.
 *
 * Bảng giá thì KHÔNG đệm: đọc lại mỗi lượt rồi áp lên danh mục. Đọc bảng giá là
 * một truy vấn nhỏ, còn đệm nó thì đổi giá xong vẫn có lượt thấy giá cũ — với
 * tiền bạc thì sai đó không chấp nhận được.
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

/** Bỏ đệm danh mục nhà cung cấp. Chỉ cần khi bên họ đổi dịch vụ, không phải khi đổi giá. */
export function clearCatalogCache() {
  cache = null;
  try {
    revalidateTag(CATALOG_TAG);
  } catch {
    // Ngoài route handler thì gọi được cũng không sao, bỏ qua.
  }
}

/** Danh sách dịch vụ thô từ nhà cung cấp — đây mới là phần chậm cần đệm. */
async function fetchServices() {
  const res = await getServices();
  return res.ok ? { ok: true as const, data: res.data } : { ok: false as const, error: res.error };
}

const fetchServicesCached = unstable_cache(fetchServices, [CATALOG_TAG], {
  revalidate: thatimConfig.cacheSeconds,
  tags: [CATALOG_TAG],
});

export async function getLiveCatalog(force = false): Promise<LiveCatalog> {
  if (!isThatimConfigured()) {
    return fallbackCatalog("Chưa cấu hình THATIM_API_KEY.");
  }
  if (force) clearCatalogCache();

  const res = force ? await fetchServices() : await fetchServicesCached();
  if (!res.ok) {
    // Còn bản nhớ tạm cũ thì dùng tiếp, hơn là tụt về danh mục tĩnh.
    if (cache) return { ...cache.value, error: res.error };
    return fallbackCatalog(res.error);
  }

  // Bảng giá đọc mới mỗi lượt: đổi giá là hiện ngay, không có lượt nào thấy giá cũ.
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
