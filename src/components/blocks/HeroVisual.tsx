import Image from "next/image";

/**
 * Khối hình bên phải hero trang chủ.
 *
 * Bốn lớp và vị trí lấy nguyên từ public/assets/decor/hero/hero-assets.manifest.json;
 * sửa vị trí thì sửa ở manifest trước rồi mới sửa ở đây, đừng để hai nơi lệch nhau.
 *
 * Thứ tự từ sau ra trước:
 *   1. nền hero            — CSS của <section>
 *   2. hoa văn mờ toàn nền — CSS của <section>
 *   3. trống Đông Sơn      z10, mờ, nằm sau cùng trong khối này
 *   4. chim Lạc            z30, là điểm nhìn chính
 *   5. dải sóng vàng       z40, neo mép dưới phải
 *   6. ánh lấp lánh        z50, phủ nhẹ lên trên
 *
 * Cả bốn đều là trang trí: alt rỗng và aria-hidden, để trình đọc màn hình bỏ qua
 * chứ không đọc ra một tràng vô nghĩa. Chữ, nút và cam kết bên trái vẫn là HTML
 * thật, không nướng vào ảnh.
 */

const BASE = "/assets/decor/hero";

export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-52 w-full select-none sm:h-60 lg:h-64 xl:h-72"
    >
      {/* Trống Đông Sơn — nền mờ sau lưng chim. */}
      <Image
        src={`${BASE}/hero-dongson-bg.webp`}
        alt=""
        width={260}
        height={260}
        priority={false}
        className="absolute right-[4%] top-[8%] z-10 h-auto w-[88%] opacity-[0.14] sm:opacity-[0.18] lg:opacity-[0.22]"
      />

      {/* Chim Lạc — điểm nhìn chính, giữ đúng tỷ lệ gốc. */}
      <Image
        src={`${BASE}/hero-bird-main.webp`}
        alt=""
        width={260}
        height={260}
        priority
        className="absolute right-[10%] top-[16%] z-30 h-auto w-[52%] drop-shadow-[0_10px_24px_rgba(201,121,0,0.18)]"
      />

      {/* Dải sóng vàng — neo mép dưới phải, không bao giờ chồm sang phần chữ. */}
      <Image
        src={`${BASE}/hero-wave-gold.webp`}
        alt=""
        width={519}
        height={173}
        className="absolute bottom-[-4%] right-[-6%] z-40 h-auto w-[105%]"
      />

      {/* Ánh lấp lánh — phủ cuối, để nhẹ tay. Màn nhỏ thì giảm thêm cho đỡ rối. */}
      <Image
        src={`${BASE}/hero-sparkles.webp`}
        alt=""
        width={519}
        height={173}
        className="absolute right-[-2%] top-[6%] z-50 h-auto w-full opacity-[0.28] sm:opacity-[0.34] lg:opacity-[0.42]"
      />
    </div>
  );
}
