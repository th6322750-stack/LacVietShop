/**
 * Đọc ảnh người dùng chọn, thu nhỏ vừa phải rồi trả về dạng data URL.
 *
 * Ảnh này là banner thông báo cho khách nên phải còn đọc được chữ trên đó. Mức
 * cũ 256px là di sản thời kho dữ liệu nằm trong localStorage (~5MB cho cả tên
 * miền); một tấm banner khuyến mãi co về 256px thì chữ nhoè hết, dán lên chẳng
 * ai đọc nổi. Nay thông báo nằm ở máy chủ nên nới lên 1280px.
 *
 * Vẫn phải có trần: cột dữ liệu chỉ nhận 400.000 ký tự. Nếu ảnh sau khi nén vẫn
 * quá dài thì hạ dần chất lượng rồi hạ kích thước, chứ không đẩy lên để máy chủ
 * từ chối và người dùng chẳng hiểu vì sao.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 1280;
/** Trần của cột imageSrc ở /api/announcement, chừa một ít cho an toàn. */
const MAX_DATAURL_CHARS = 380_000;

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
    let dataUrl = canvas.toDataURL("image/webp", 0.82);

    // Còn dài quá thì hạ chất lượng trước (mắt ít nhận ra), hết cách mới thu nhỏ.
    for (const q of [0.7, 0.6, 0.5]) {
      if (dataUrl.length <= MAX_DATAURL_CHARS) break;
      dataUrl = canvas.toDataURL("image/webp", q);
    }
    let canh = Math.max(width, height);
    while (dataUrl.length > MAX_DATAURL_CHARS && canh > 320) {
      canh = Math.round(canh * 0.8);
      const ti = canh / Math.max(width, height);
      const nho = document.createElement("canvas");
      nho.width = Math.max(1, Math.round(width * ti));
      nho.height = Math.max(1, Math.round(height * ti));
      const c2 = nho.getContext("2d");
      if (!c2) break;
      c2.drawImage(canvas, 0, 0, nho.width, nho.height);
      dataUrl = nho.toDataURL("image/webp", 0.7);
    }
    if (dataUrl.length > MAX_DATAURL_CHARS) {
      return { ok: false, error: "Ảnh quá nặng, thử ảnh đơn giản hoặc nhỏ hơn." };
    }

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
