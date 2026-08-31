# MISSING ASSET REPORT

Claude đã hoàn tất lượt dựng đầu tiên cho toàn bộ 20 route. Mọi asset thương hiệu dưới đây
**chưa có file thật**, nên được thay bằng placeholder trung tính giữ nguyên layout, gắn khoá
`TODO_ASSET:<key>` và thuộc tính `data-todo-asset` để dò lại trong DOM.

Claude **không** tìm trên mạng, **không** tự vẽ, **không** mượn logo/ảnh thương hiệu khác.

- Tổng số khoá còn thiếu: **6**
- Nguồn sự thật: `src/lib/assets.ts` (sinh báo cáo bằng `node tools/gen-reports.mjs`)
- Kiểm chứng: kiểm thử Playwright thấy 5 khoá `data-todo-asset` render trong DOM khi duyệt hết 20 route;
  khoá còn lại (`brand.favicon`) dùng ở tầng metadata nên không xuất hiện dưới dạng phần tử

## Cách ChatGPT bàn giao asset
1. Chuẩn bị file theo `ratio/size` bên dưới.
2. Đặt vào `public/assets/<nhóm>/` theo `.webby/asset-manifest.json`.
3. Cập nhật manifest.
4. Claude chỉ sửa đúng `src` của entry tương ứng trong `src/lib/assets.ts` — không đụng tới UI xung quanh.

## Open items

### Ảnh dữ liệu (1)

```text
NEED_ASSET
key: deposit.realQr
route: /deposit
section: Khối chuyển khoản ngân hàng
role: DATA_VISUAL
needed: QR sinh từ tài khoản nhận tiền thật đã được duyệt (chưa có cấu hình thanh toán)
ratio/size: 1:1
placeholder: <AssetImage assetKey="deposit.realQr" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="deposit.realQr")
reference_target: references/ui-approved/08-deposit.webp
status: OPEN
```

### Logo nền tảng dịch vụ (3)

```text
NEED_ASSET
key: platform.linkedin-global
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức LinkedIn Global đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.linkedin-global" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.linkedin-global")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.bigo-global
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Bigo Global đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.bigo-global" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.bigo-global")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.discord-global
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Discord Global đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.discord-global" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.discord-global")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN
```

### Logo cổng thanh toán (2)

```text
NEED_ASSET
key: payment.vietinbank
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức VietinBank đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.vietinbank" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.vietinbank")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN

NEED_ASSET
key: payment.momo
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức MoMo đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.momo" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.momo")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN
```

## Ghi chú thêm

- Lượt vá asset (`.webby/ASSET_PATCH.md`) đã áp dụng: 8 asset Lạc Việt do ChatGPT chuẩn bị +
  18 mark nền tảng/sản phẩm lấy đúng file nguồn đã khoá trong `clone-thatim-vn`.
  Số khoá thiếu giảm từ 34 xuống 6.
- 8 khoá còn lại đều thuộc nhóm thanh toán và **cố ý để trống** cho tới khi duyệt
  `payment.gateway` / `payment.receivingAccount` (`.webby/ASSET_PATCH.md §D`).
  Không dựng QR giả.
- `brand.favicon` đã dùng lại `/assets/brand/lac-viet-mark.svg`; `/favicon.ico` không còn 404.
- Sửa reference: ba file SVG mới đã thay ba WebP hỏng. Lỗi XML ở
  `15-product-canva-fixed.svg` (3 dấu `&` chưa escape) đã được ChatGPT xử lý ở commit
  `66dfa3d`; Claude kiểm lại: cả ba file parse hợp lệ, 0 dấu `&` chưa escape.
  Không còn vướng mắc nào về tính toàn vẹn của tài liệu tham chiếu.
