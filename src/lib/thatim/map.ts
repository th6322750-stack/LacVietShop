/**
 * Chuyển danh sách dịch vụ thô của API nhà cung cấp thành cây danh mục của app
 * (nền tảng → nhóm dịch vụ → máy chủ), đúng cấu trúc mà giao diện đang dùng.
 *
 * Hàm thuần, không đụng tới khoá API, nên dùng được cả hai phía.
 *
 * Quy đổi giá: API trả USD cho 1.000 tương tác.
 *   đồng/tương tác = rate × usdToVnd ÷ 1000 × markup
 * Công thức này đã đối chiếu khớp từng đồng với bảng giá công bố của họ.
 */
import type { Platform, PlatformService, ServiceServer } from "@/types";
import type { ThatimService } from "./client";
import { getAsset } from "@/lib/assets";

/** Lỗi chính tả có sẵn bên nguồn — nắn lại để không phát hành ra giao diện mình. */
const NAME_FIXES: Record<string, string> = { "Googe Maps": "Google Maps" };

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const deEmoji = (v: string) =>
  v
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/** Thông số máy chủ nằm gọn trong tên, ngăn nhau bằng dấu "~". */
export function parseServerName(full: string) {
  const parts = full
    .split("~")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const title = deEmoji(parts[0] ?? "Máy chủ") || "Máy chủ";
  let speed: string | undefined;
  let refill: string | undefined;
  let sourceNote: string | undefined;
  const tags: string[] = [];

  for (const seg of parts.slice(1)) {
    const c = deEmoji(seg);
    if (!c) continue;
    if (!speed && /^Tốc\s*Độ/i.test(c)) {
      speed = c.replace(/^Tốc\s*Độ\s*/i, "").replace(/^:\s*/, "");
      continue;
    }
    if (!sourceNote && /^Nguồn\s*:/i.test(c)) {
      sourceNote = c.replace(/^Nguồn\s*:\s*/i, "");
      continue;
    }
    if (!refill && /bảo\s*hành|không\s*tụt|refill/i.test(c)) {
      refill = c;
      continue;
    }
    tags.push(c);
  }
  return { title, speed, refill, sourceNote, tags };
}

/**
 * Chọn khoá ảnh cho nền tảng. Nếu chưa có ảnh cho bản "… Global" thì dùng lại
 * mark của chính thương hiệu đó ở bản trong nước (cùng một logo).
 */
function assetKeyFor(name: string, slug: string) {
  const direct = `platform.${slug}`;
  if (getAsset(direct)?.src) return direct;
  const base = name.replace(/\s*global\s*$/i, "").trim();
  if (base && base !== name) {
    const fallback = `platform.${slugify(base)}`;
    if (getAsset(fallback)?.src) return fallback;
  }
  return direct;
}

export interface MapOptions {
  usdToVnd: number;
  markup: number;
  tierMultipliers: number[];
}

export function priceInVnd(rate: number, o: MapOptions) {
  // Làm tròn 5 chữ số thập phân: đơn giá có loại nhỏ tới 0,03 đồng/tương tác.
  return Math.round(((rate * o.usdToVnd) / 1000) * o.markup * 1e5) / 1e5;
}

export function mapServicesToPlatforms(services: ThatimService[], o: MapOptions): Platform[] {
  const byPlatform = new Map<string, { name: string; groups: Map<string, ThatimService[]> }>();

  for (const s of services) {
    const rawName = (s.platform ?? "Khác").trim();
    const name = NAME_FIXES[rawName] ?? rawName;
    const slug = slugify(name);
    let entry = byPlatform.get(slug);
    if (!entry) {
      entry = { name, groups: new Map() };
      byPlatform.set(slug, entry);
    }
    const category = (s.category ?? "Khác").trim();
    const group = entry.groups.get(category);
    if (group) group.push(s);
    else entry.groups.set(category, [s]);
  }

  const platforms: Platform[] = [];

  for (const [slug, entry] of byPlatform) {
    const services_: PlatformService[] = [];

    for (const [category, rows] of entry.groups) {
      // Giá rẻ lên trước — bên nguồn cũng xếp máy chủ theo giá trong từng nhóm.
      const sorted = [...rows].sort((a, b) => a.rate - b.rate);
      const supportsReaction = /cảm\s*xúc|reaction/i.test(category) || undefined;

      const servers: ServiceServer[] = sorted.map((row, i) => {
        const parsed = parseServerName(row.name);
        const base = priceInVnd(row.rate, o);
        return {
          id: `api-${row.service}`,
          code: String(row.service),
          apiServiceId: String(row.service),
          index: i + 1,
          name: parsed.title,
          fullName: deEmoji(row.name),
          pricePerUnit: base,
          pricesByTier: o.tierMultipliers.map((m) => Math.round(base * m * 1e5) / 1e5),
          min: Number(row.min) || 1,
          max: Number(row.max) || 1_000_000,
          ...(parsed.speed ? { speed: parsed.speed } : {}),
          ...(parsed.refill ? { refill: parsed.refill } : {}),
          ...(parsed.sourceNote ? { sourceNote: parsed.sourceNote } : {}),
          ...(row.limit_day && row.limit_day !== "Unlimited" ? { note: `Giới hạn ngày: ${row.limit_day}` } : {}),
          tags: parsed.tags,
          available: true,
          source: "api",
          ...(supportsReaction ? { supportsReaction } : {}),
        };
      });

      services_.push({
        id: `${slug}-${slugify(category)}`,
        name: category,
        slug: slugify(category),
        platformId: slug,
        servers,
      });
    }

    // Nhóm nhiều máy chủ lên trước cho dễ chọn.
    services_.sort((a, b) => b.servers.length - a.servers.length);

    platforms.push({
      id: slug,
      name: entry.name,
      slug,
      region: /global/i.test(entry.name) ? "global" : "vn",
      assetKey: assetKeyFor(entry.name, slug),
      services: services_,
    });
  }

  // Nền tảng nhiều máy chủ lên trước.
  platforms.sort(
    (a, b) =>
      b.services.reduce((s, x) => s + x.servers.length, 0) - a.services.reduce((s, x) => s + x.servers.length, 0),
  );
  return platforms;
}
