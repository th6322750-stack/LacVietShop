/**
 * Rút danh mục dịch vụ từ bản clone thatim.vn để dựng bộ chọn dịch vụ/máy chủ
 * bám đúng cấu trúc bên họ: nền tảng → nhóm dịch vụ → nhiều máy chủ, mỗi máy chủ
 * có MIN/MAX và bảng giá 4 bậc (Thành viên / Cộng tác viên / Đại lý / Nhà phân phối).
 *
 * Chạy:  node tools/build-services-catalog.mjs [đường-dẫn-clone]
 * Mặc định đọc C:\Users\Admin\Downloads\clone_thatim_vn
 *
 * Sinh ra:
 *   - src/lib/demo/services-catalog.ts     (nền tảng + dịch vụ + máy chủ)
 *   - public/assets/platforms/<slug>.webp  (logo nền tảng, copy nguyên tệp)
 *   - tools/.platform-assets.txt           (dòng dán vào src/lib/assets.ts)
 *
 * Chỉ nền tảng Tiktok mới có bảng máy chủ đầy đủ trong bản clone (25 máy chủ).
 * Các dịch vụ còn lại được cấp một máy chủ source: "demo" để luồng đặt đơn chạy
 * được; số liệu thật sẽ lấy từ API thatim.vn khi đấu nối.
 *
 * QUAN TRỌNG cho bước đấu API: mã máy chủ (code) ở đây do mình tự đánh, KHÔNG
 * phải service_id của thatim.vn. Trường apiServiceId để trống chính là chỗ điền
 * id thật khi có tài liệu API.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CLONE = process.argv[2] || "C:\\Users\\Admin\\Downloads\\clone_thatim_vn";

const read = (f) => fs.readFileSync(path.join(CLONE, f), "utf8");
const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const num = (v) => Number(String(v).replace(/[.,]/g, "")) || 0;

/** Bỏ emoji trang trí trong nhãn để chữ trong ô chọn không bị rối. */
const deEmoji = (v) =>
  v
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

function slugify(v) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Sửa lỗi chính tả có sẵn trong dữ liệu nguồn. Giữ nguyên mọi tên khác đúng như
 * bên họ; chỉ nắn những chỗ sai rõ ràng để không phát hành lỗi ra giao diện mình.
 */
const NAME_FIXES = { "Googe Maps": "Google Maps" };

// ---------------------------------------------------------------------------
// 1. Nền tảng + dịch vụ con
// ---------------------------------------------------------------------------
const indexHtml = read("index.html");
const platformsRaw = JSON.parse(indexHtml.match(/PLATFORM_SERVICES\s*=\s*(\{[\s\S]*?\})\s*;/)[1]);

// ---------------------------------------------------------------------------
// 2. Bậc giá (đọc từ cột giá bản mobile của bảng máy chủ)
// ---------------------------------------------------------------------------
const servicesHtml = read("services.html");

const tierLabels = [
  ...new Set([...servicesHtml.matchAll(/<span>([^<]{3,30}):<\/span>\s*<span class="dhAmount"/g)].map((m) => m[1].trim())),
].slice(0, 4);
const TIER_IDS = ["member", "collaborator", "agency", "distributor"];
const tiers = TIER_IDS.map((id, i) => ({ id, label: tierLabels[i] ?? id }));

// ---------------------------------------------------------------------------
// 3. Máy chủ có thông số thật
// ---------------------------------------------------------------------------
/** Thông số máy chủ bên thatim nằm gọn trong tên, ngăn nhau bằng dấu "~". */
function parseServerName(full) {
  const parts = full
    .split("~")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const title = deEmoji(parts[0] ?? "Máy chủ") || "Máy chủ";
  let speed;
  let refill;
  let sourceNote;
  const tags = [];

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

const realServers = new Map(); // nhãn nhóm dịch vụ -> danh sách máy chủ

{
  const parts = servicesHtml.split(/id="service-collapse-(\d+)"/);
  for (let i = 1; i < parts.length; i += 2) {
    const body = parts[i + 1].split('id="service-collapse-')[0];
    const head = parts[i - 1].slice(-1400);
    const labels = [...head.matchAll(/fw-bold[^>]*>([^<]{4,60})</g)].map((m) => m[1].trim());
    const label = labels.length ? labels[labels.length - 1] : `Nhóm ${parts[i]}`;

    const rows = body.match(/<tr class="server-row">[\s\S]*?<\/tr>/g) ?? [];
    const servers = rows.map((row, idx) => {
      const text = strip(row);
      const nameMatch = row.match(/text-wrap[^>]*>([\s\S]*?)<\/div>/);
      const fullName = nameMatch ? strip(nameMatch[1]) : "Máy chủ";
      const prices = [...row.matchAll(/data-amount="([\d.]+)"/g)].map((m) => Number(m[1])).slice(0, 4);
      const indexMatch = row.match(/avtar-xs[^>]*>\s*(\d+)\s*</);
      return {
        index: indexMatch ? Number(indexMatch[1]) : idx + 1,
        fullName,
        ...parseServerName(fullName),
        prices: prices.length === 4 ? prices : Array(4).fill(prices[0] ?? 1),
        min: num(text.match(/MIN:\s*([\d,.]+)/)?.[1] ?? 100),
        max: num(text.match(/MAX:\s*([\d,.]+)/)?.[1] ?? 1000000),
      };
    });
    if (servers.length) realServers.set(label, servers);
  }
}

// ---------------------------------------------------------------------------
// 4. Ảnh nền tảng
// ---------------------------------------------------------------------------
const outDir = path.join(ROOT, "public/assets/platforms");
fs.mkdirSync(outDir, { recursive: true });
const assetOf = new Map();

for (const p of Object.values(platformsRaw)) {
  const name = NAME_FIXES[p.name] ?? p.name;
  const slug = slugify(name);
  const src = (p.image || "").replace(/^\//, "");
  if (!src) continue;
  const from = path.join(CLONE, src.replace(/\//g, path.sep));
  if (!fs.existsSync(from)) continue;
  const ext = path.extname(from) || ".webp";
  const file = `${slug}${ext}`;
  fs.copyFileSync(from, path.join(outDir, file));
  assetOf.set(p.name, { key: `platform.${slug}`, src: `/assets/platforms/${file}`, label: name });
}

// ---------------------------------------------------------------------------
// 5. Dựng cây dữ liệu
// ---------------------------------------------------------------------------
const allReal = [...realServers.values()].flat();
// Tỷ lệ giảm giá giữa các bậc, lấy trung bình từ dữ liệu thật để máy chủ DEMO
// không có bảng giá lệch kiểu khác với bên họ.
const tierRatios = [0, 1, 2, 3].map((i) => {
  const rs = allReal.map((s) => s.prices[i] / s.prices[0]).filter((v) => Number.isFinite(v) && v > 0);
  return rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 1;
});
const realPrices = allReal.map((s) => s.prices[0]).sort((a, b) => a - b);
const median = realPrices[Math.floor(realPrices.length / 2)] ?? 2;

let seed = 20260901;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (list) => list[Math.floor(rand() * list.length)];

let serverSeq = 47000;
let realCount = 0;
let demoCount = 0;

const built = Object.values(platformsRaw).map((p) => {
  const name = NAME_FIXES[p.name] ?? p.name;
  const slug = slugify(name);
  const asset = assetOf.get(p.name);
  let cloneServers = 0;

  const services = (p.services ?? []).map((svc) => {
    // Bảng máy chủ thật trong clone chỉ có ở nền tảng Tiktok. Nhiều nền tảng
    // trùng tên dịch vụ ("Tăng Lượt Xem Video"…) nên phải khớp theo cả nền tảng,
    // nếu không máy chủ Tiktok sẽ dính nhầm sang YouTube, Facebook…
    const matched = p.name === "Tiktok" ? realServers.get(svc.name) : null;
    const supportsReaction = /cảm\s*xúc|reaction/i.test(svc.name) || undefined;

    const servers = (matched ?? [null]).map((real) => {
      serverSeq += 1;
      if (real) {
        realCount += 1;
        cloneServers += 1;
        return {
          id: `srv-${serverSeq}`,
          code: String(serverSeq),
          apiServiceId: null,
          index: real.index,
          name: real.title,
          fullName: real.fullName,
          pricePerUnit: real.prices[0],
          // Danh mục dự phòng là bản chụp giá công bố nên giá bán = giá vốn.
          costPerUnit: real.prices[0],
          pricesByTier: real.prices,
          min: real.min,
          max: real.max,
          ...(real.speed ? { speed: real.speed } : {}),
          ...(real.refill ? { refill: real.refill } : {}),
          ...(real.sourceNote ? { sourceNote: real.sourceNote } : {}),
          tags: real.tags,
          available: true,
          source: "clone",
          ...(supportsReaction ? { supportsReaction } : {}),
        };
      }
      demoCount += 1;
      const base = Number((median * (0.4 + rand() * 3.2)).toFixed(2));
      return {
        id: `srv-${serverSeq}`,
        code: String(serverSeq),
        apiServiceId: null,
        index: 1,
        name: `Máy chủ 1 — ${svc.name}`,
        fullName: `Máy chủ 1 — ${svc.name}`,
        pricePerUnit: base,
        costPerUnit: base,
        pricesByTier: tierRatios.map((r) => Number((base * r).toFixed(3))),
        min: pick([50, 100, 200, 500, 1000]),
        max: pick([50000, 100000, 500000, 1000000]),
        tags: [],
        available: true,
        source: "demo",
        ...(supportsReaction ? { supportsReaction } : {}),
      };
    });

    return {
      id: `${slug}-${slugify(svc.name)}`,
      name: svc.name,
      slug: slugify(svc.name),
      platformId: slug,
      servers,
    };
  });

  return {
    id: slug,
    name,
    slug,
    region: /global/i.test(p.name) ? "global" : "vn",
    assetKey: asset?.key ?? `platform.${slug}`,
    services,
    _clone: cloneServers,
  };
});

// Nền tảng có số liệu thật xếp trước để người dùng gặp ngay dữ liệu đầy đủ;
// phần còn lại giữ đúng thứ tự bên nguồn.
built.sort((a, b) => b._clone - a._clone);
const platforms = built.map(({ _clone, ...rest }) => rest);

// ---------------------------------------------------------------------------
// 6. Ghi tệp
// ---------------------------------------------------------------------------
const totalServers = realCount + demoCount;
const header = `import type { Platform } from "@/types";

/**
 * TỰ ĐỘNG SINH — không sửa tay. Chạy lại: node tools/build-services-catalog.mjs
 *
 * Nguồn: bản clone thatim.vn (index.html → PLATFORM_SERVICES, services.html → bảng máy chủ).
 * Cấu trúc bám đúng bên họ: nền tảng → nhóm dịch vụ → nhiều máy chủ, mỗi máy chủ
 * có MIN/MAX và bảng giá theo 4 bậc thành viên.
 *
 * ${platforms.length} nền tảng · ${platforms.reduce((s, p) => s + p.services.length, 0)} dịch vụ · ${totalServers} máy chủ.
 *
 * server.source:
 *   "clone" = thông số thật đọc từ bản clone (${realCount} máy chủ, đều thuộc Tiktok —
 *             chỉ nền tảng này có bảng máy chủ trong bản chụp)
 *   "demo"  = chỗ dành sẵn để luồng đặt đơn chạy được (${demoCount} máy chủ);
 *             số liệu thật lấy từ API thatim.vn khi đấu nối.
 *
 * server.code do mình tự đánh, KHÔNG phải service_id của thatim.vn.
 * server.apiServiceId là chỗ điền id thật khi đấu API — hiện để null toàn bộ.
 */

/** Bậc giá đọc từ bảng giá bên nguồn. */
export const serviceTiers = ${JSON.stringify(tiers, null, 2)} as const;

export const platforms: Platform[] = ${JSON.stringify(platforms, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, "src/lib/demo/services-catalog.ts"), header, "utf8");

const assetLines = [...assetOf.values()]
  .map((a) => `  { key: "${a.key}", label: ${JSON.stringify(a.label)}, src: "${a.src}" },`)
  .join("\n");
fs.writeFileSync(path.join(ROOT, "tools/.platform-assets.txt"), assetLines, "utf8");

console.log(`bậc giá: ${tiers.map((t) => t.label).join(" / ")}`);
console.log(`nền tảng: ${platforms.length}`);
console.log(`dịch vụ : ${platforms.reduce((s, p) => s + p.services.length, 0)}`);
console.log(`máy chủ : ${totalServers} (thật từ clone: ${realCount}, DEMO: ${demoCount})`);
console.log(`ảnh copy: ${assetOf.size} → public/assets/platforms/`);
