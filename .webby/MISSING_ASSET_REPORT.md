# MISSING ASSET REPORT

Claude đã hoàn tất lượt dựng đầu tiên cho toàn bộ 20 route. Mọi asset thương hiệu dưới đây
**chưa có file thật**, nên được thay bằng placeholder trung tính giữ nguyên layout, gắn khoá
`TODO_ASSET:<key>` và thuộc tính `data-todo-asset` để dò lại trong DOM.

Claude **không** tìm trên mạng, **không** tự vẽ, **không** mượn logo/ảnh thương hiệu khác.

- Tổng số khoá còn thiếu: **8**
- Nguồn sự thật: `src/lib/assets.ts` (sinh báo cáo bằng `node tools/gen-reports.mjs`)
- Kiểm chứng: kiểm thử Playwright thấy 7 khoá `data-todo-asset` render trong DOM khi duyệt hết 20 route;
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

### Logo cổng thanh toán (7)

```text
NEED_ASSET
key: payment.vietcombank
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức Vietcombank đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.vietcombank" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.vietcombank")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN

NEED_ASSET
key: payment.techcombank
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức Techcombank đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.techcombank" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.techcombank")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN

NEED_ASSET
key: payment.mbbank
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức MB Bank đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.mbbank" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.mbbank")
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

NEED_ASSET
key: payment.zalopay
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức ZaloPay đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.zalopay" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.zalopay")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN

NEED_ASSET
key: payment.viettelmoney
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức Viettel Money đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.viettelmoney" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.viettelmoney")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN

NEED_ASSET
key: payment.usdt
route: /deposit,/cashflows
section: Thẻ phương thức thanh toán
role: PAYMENT_MARK
needed: Logo chính thức USDT (TRC20) đúng bản quyền
ratio/size: ~2:1 (cao 24px)
placeholder: <AssetImage assetKey="payment.usdt" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="payment.usdt")
reference_target: references/ui-approved/08-deposit.webp
reference_original: clone-thatim-vn: deposit_addfunds.html
status: OPEN
```

## Ghi chú thêm

- Lượt vá asset (`.webby/ASSET_PATCH.md`) đã áp dụng: 8 asset Lạc Việt do ChatGPT chuẩn bị +
  18 mark nền tảng/sản phẩm lấy đúng file nguồn đã khoá trong `clone-thatim-vn`.
  Số khoá thiếu giảm từ 34 xuống 8.
- 8 khoá còn lại đều thuộc nhóm thanh toán và **cố ý để trống** cho tới khi duyệt
  `payment.gateway` / `payment.receivingAccount` (`.webby/ASSET_PATCH.md §D`).
  Không dựng QR giả.
- `brand.favicon` đã dùng lại `/assets/brand/lac-viet-mark.svg`; `/favicon.ico` không còn 404.
- Sửa reference: ba file SVG mới đã thay ba WebP hỏng. Lỗi XML ở
  `15-product-canva-fixed.svg` (3 dấu `&` chưa escape) đã được ChatGPT xử lý ở commit
  `66dfa3d`; Claude kiểm lại: cả ba file parse hợp lệ, 0 dấu `&` chưa escape.
  Không còn vướng mắc nào về tính toàn vẹn của tài liệu tham chiếu.
