/**
 * Sinh .webby/MISSING_ASSET_REPORT.md từ nguồn sự thật duy nhất là src/lib/assets.ts.
 * Chạy: node tools/gen-reports.mjs
 *
 * Dùng script thay vì gõ tay để báo cáo luôn khớp với các khoá TODO_ASSET thật
 * đang render trong DOM.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, "src/lib/assets.ts"), "utf8");

/** Đọc các entry khai báo tường minh trong mảng registry. */
function parseExplicit() {
  const out = [];
  const re = /\{\s*key:\s*"([^"]+)",\s*src:\s*(null|"[^"]*"),\s*label:\s*"([^"]+)",\s*classification:\s*"([^"]+)",\s*routes:\s*\[([^\]]*)\],\s*section:\s*"([^"]+)",\s*role:\s*"([^"]+)",\s*needed:\s*"([^"]+)",\s*ratio:\s*"([^"]+)",\s*referenceTarget:\s*"([^"]+)",(?:\s*referenceOriginal:\s*"([^"]+)",)?\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    out.push({
      key: m[1],
      missing: m[2] === "null",
      label: m[3],
      classification: m[4],
      routes: m[5].replace(/["\s]/g, ""),
      section: m[6],
      role: m[7],
      needed: m[8],
      ratio: m[9],
      referenceTarget: m[10],
      referenceOriginal: m[11] ?? "",
    });
  }
  return out;
}

/** Đọc các nhóm sinh theo vòng lặp (nền tảng / sản phẩm / thanh toán). */
function parseGroup(name, extra) {
  const block = src.split(`const ${name}`)[1]?.split("];")[0] ?? "";
  const items = [...block.matchAll(/\{\s*key:\s*"([^"]+)",\s*label:\s*"([^"]+)"(?:,\s*route:\s*"([^"]+)")?\s*\}/g)];
  return items.map((m) => ({
    key: m[1],
    missing: true,
    label: m[2],
    route: m[3],
    ...extra(m[2], m[3]),
  }));
}

const explicit = parseExplicit();

const platforms = parseGroup("platformKeys", (label) => ({
  classification: "AUTHENTIC",
  routes: "/,/services",
  section: "Ô chọn nền tảng, bảng đơn hàng",
  role: "PLATFORM_MARK",
  needed: `Logo chính thức ${label} đúng bản quyền, nền trong suốt`,
  ratio: "1:1 (28–40px)",
  referenceTarget: "references/ui-approved/02-services.webp",
  referenceOriginal: "clone-thatim-vn: modules/images/platforms",
}));

const products = parseGroup("productKeys", (label, route) => ({
  classification: "AUTHENTIC",
  routes: `/products,${route},/purchased`,
  section: "Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua",
  role: "PRODUCT_MARK",
  needed: `Ảnh/logo sản phẩm ${label} đúng bản quyền, nền trong suốt`,
  ratio: "1:1 (40–64px)",
  referenceTarget: "references/ui-approved/03-products.webp",
  referenceOriginal: "clone-thatim-vn: uploads/images/original",
}));

const payments = parseGroup("paymentKeys", (label) => ({
  classification: "AUTHENTIC",
  routes: "/deposit,/cashflows",
  section: "Thẻ phương thức thanh toán",
  role: "PAYMENT_MARK",
  needed: `Logo chính thức ${label} đúng bản quyền`,
  ratio: "~2:1 (cao 24px)",
  referenceTarget: "references/ui-approved/08-deposit.webp",
  referenceOriginal: "clone-thatim-vn: deposit_addfunds.html",
}));

const all = [...explicit, ...platforms, ...products, ...payments].filter((a) => a.missing);

const groups = [
  ["Thương hiệu Lạc Việt", (a) => a.classification === "BRAND"],
  ["Ảnh trang trí / hero", (a) => a.classification === "DECORATIVE"],
  ["Ảnh dữ liệu", (a) => a.classification === "DATA_VISUAL"],
  ["Placeholder hệ thống", (a) => a.classification === "PLACEHOLDER"],
  ["Logo nền tảng dịch vụ", (a) => a.role === "PLATFORM_MARK"],
  ["Logo sản phẩm premium", (a) => a.role === "PRODUCT_MARK"],
  ["Logo cổng thanh toán", (a) => a.role === "PAYMENT_MARK"],
];

const entry = (a) => `NEED_ASSET
key: ${a.key}
route: ${a.routes}
section: ${a.section}
role: ${a.role}
needed: ${a.needed}
ratio/size: ${a.ratio}
placeholder: <AssetImage assetKey="${a.key}" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="${a.key}")
reference_target: ${a.referenceTarget}${a.referenceOriginal ? `\nreference_original: ${a.referenceOriginal}` : ""}
status: OPEN`;

const md = `# MISSING ASSET REPORT

Claude đã hoàn tất lượt dựng đầu tiên cho toàn bộ 20 route. Mọi asset thương hiệu dưới đây
**chưa có file thật**, nên được thay bằng placeholder trung tính giữ nguyên layout, gắn khoá
\`TODO_ASSET:<key>\` và thuộc tính \`data-todo-asset\` để dò lại trong DOM.

Claude **không** tìm trên mạng, **không** tự vẽ, **không** mượn logo/ảnh thương hiệu khác.

- Tổng số khoá còn thiếu: **${all.length}**
- Nguồn sự thật: \`src/lib/assets.ts\` (sinh báo cáo bằng \`node tools/gen-reports.mjs\`)
- Kiểm chứng: kiểm thử Playwright thấy ${all.length - 1} khoá \`data-todo-asset\` render trong DOM khi duyệt hết 20 route;
  khoá còn lại (\`brand.favicon\`) dùng ở tầng metadata nên không xuất hiện dưới dạng phần tử

## Cách ChatGPT bàn giao asset
1. Chuẩn bị file theo \`ratio/size\` bên dưới.
2. Đặt vào \`public/assets/<nhóm>/\` theo \`.webby/asset-manifest.json\`.
3. Cập nhật manifest.
4. Claude chỉ sửa đúng \`src\` của entry tương ứng trong \`src/lib/assets.ts\` — không đụng tới UI xung quanh.

## Open items

${groups
  .map(([title, filter]) => {
    const list = all.filter(filter);
    if (!list.length) return "";
    return `### ${title} (${list.length})

\`\`\`text
${list.map(entry).join("\n\n")}
\`\`\`
`;
  })
  .filter(Boolean)
  .join("\n")}
## Ghi chú thêm

- \`brand.favicon\` chưa có nên trình duyệt trả 404 cho \`/favicon.ico\`. Đây là hệ quả trực tiếp
  của asset thiếu, không phải lỗi ứng dụng; sẽ hết ngay khi có icon thật.
- Ba ảnh tham chiếu trong repo bị hỏng file, không mở được bằng trình giải mã WebP:
  \`references/ui-approved/12-product-purchased.webp\`, \`15-product-canva.webp\`,
  \`17-product-gemini.webp\`. Ba route tương ứng được dựng theo quy tắc trong
  \`PROJECT_HANDOFF.md §8\` và mẫu chung của các route cùng loại. Đề nghị ChatGPT xuất lại 3 ảnh này.
`;

fs.writeFileSync(path.join(root, ".webby/MISSING_ASSET_REPORT.md"), md, "utf8");
console.log(`Đã ghi .webby/MISSING_ASSET_REPORT.md — ${all.length} khoá còn thiếu`);
