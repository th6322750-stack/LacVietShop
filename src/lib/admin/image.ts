/**
 * Đọc ảnh người dùng chọn và thu nhỏ về khổ vuông trước khi lưu.
 *
 * Bản dựng DEMO lưu dữ liệu trong localStorage (~5MB cho cả tên miền), nên ảnh
 * gốc vài MB sẽ làm tràn và mất dữ liệu. Thu nhỏ về tối đa 256px, xuất WebP
 * chất lượng 0.82 → mỗi ảnh thường 8–25KB.
 *
 * Khi có backend thật, thay hàm này bằng lệnh tải tệp lên và trả về URL.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 256;

export interface ImageResult {
  ok: true;
  dataUrl: string;
  bytes: number;
}

export interface ImageError {
  ok: false;
  error: string;
}

export async function readProductImage(file: File): Promise<ImageResult | ImageError> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Tệp không phải ảnh." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Ảnh lớn hơn 5MB, chọn ảnh nhỏ hơn." };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, error: "Trình duyệt không dựng được ảnh." };
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    // WebP gọn hơn PNG nhiều; trình duyệt nào không hỗ trợ sẽ tự trả về PNG.
    const dataUrl = canvas.toDataURL("image/webp", 0.82);
    return { ok: true, dataUrl, bytes: Math.round((dataUrl.length * 3) / 4) };
  } catch {
    return { ok: false, error: "Không đọc được tệp ảnh này." };
  }
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
