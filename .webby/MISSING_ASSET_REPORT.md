# MISSING ASSET REPORT

Claude đã hoàn tất lượt dựng đầu tiên cho toàn bộ 20 route. Mọi asset thương hiệu dưới đây
**chưa có file thật**, nên được thay bằng placeholder trung tính giữ nguyên layout, gắn khoá
`TODO_ASSET:<key>` và thuộc tính `data-todo-asset` để dò lại trong DOM.

Claude **không** tìm trên mạng, **không** tự vẽ, **không** mượn logo/ảnh thương hiệu khác.

- Tổng số khoá còn thiếu: **34**
- Nguồn sự thật: `src/lib/assets.ts` (sinh báo cáo bằng `node tools/gen-reports.mjs`)
- Kiểm chứng: kiểm thử Playwright thấy 33 khoá `data-todo-asset` render trong DOM khi duyệt hết 20 route;
  khoá còn lại (`brand.favicon`) dùng ở tầng metadata nên không xuất hiện dưới dạng phần tử

## Cách ChatGPT bàn giao asset
1. Chuẩn bị file theo `ratio/size` bên dưới.
2. Đặt vào `public/assets/<nhóm>/` theo `.webby/asset-manifest.json`.
3. Cập nhật manifest.
4. Claude chỉ sửa đúng `src` của entry tương ứng trong `src/lib/assets.ts` — không đụng tới UI xung quanh.

## Open items

### Thương hiệu Lạc Việt (3)

```text
NEED_ASSET
key: brand.logoHorizontal
route: *
section: Sidebar desktop, footer, trang đăng nhập
role: LOGO
needed: Logo ngang chính thức, nền trong suốt, ưu tiên SVG/PNG @3x
ratio/size: ~3:1 (hiển thị cao 32–40px)
placeholder: <AssetImage assetKey="brand.logoHorizontal" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="brand.logoHorizontal")
reference_target: references/brand/lac-viet-logo-horizontal.webp
status: OPEN

NEED_ASSET
key: brand.markCompact
route: *
section: Sidebar thu gọn (992–1199), topbar mobile
role: LOGO
needed: Dấu hiệu thương hiệu vuông, ưu tiên vector
ratio/size: 1:1 (36–40px)
placeholder: <AssetImage assetKey="brand.markCompact" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="brand.markCompact")
reference_target: references/ui-approved/01-home.webp
status: OPEN

NEED_ASSET
key: brand.favicon
route: *
section: Favicon / PWA icon
role: ICON
needed: Icon app suy ra từ compact mark đã duyệt
ratio/size: 1:1 (32/180/512px)
placeholder: <AssetImage assetKey="brand.favicon" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="brand.favicon")
reference_target: references/brand/lac-viet-logo-horizontal.webp
status: OPEN
```

### Ảnh trang trí / hero (4)

```text
NEED_ASSET
key: home.hero.brandVisual
route: /
section: Hero trang chủ, cột phải
role: HERO
needed: Tranh trang trí thương hiệu (trống đồng / chim Lạc) trên nền sáng
ratio/size: desktop ~2.8:1, mobile 16:9
placeholder: <AssetImage assetKey="home.hero.brandVisual" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="home.hero.brandVisual")
reference_target: references/ui-approved/01-home.webp
status: OPEN

NEED_ASSET
key: decor.dongSonPattern
route: /,/products
section: Nền watermark hero và banner
role: BACKGROUND
needed: Hoa văn Đông Sơn dạng vector, tile được, opacity thấp
ratio/size: tile vuông
placeholder: <AssetImage assetKey="decor.dongSonPattern" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="decor.dongSonPattern")
reference_target: references/ui-approved/01-home.webp
status: OPEN

NEED_ASSET
key: products.vipBanner
route: /products
section: Banner đầu trang Sản phẩm Premium
role: BACKGROUND
needed: Tranh banner hạng VIP tông vàng, tối thiểu FHD
ratio/size: ~3:1
placeholder: <AssetImage assetKey="products.vipBanner" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="products.vipBanner")
reference_target: references/ui-approved/03-products.webp
status: OPEN

NEED_ASSET
key: product.vpn.hero
route: /products/vpn
section: Hero trang sản phẩm VPN
role: HERO
needed: Tranh chủ đề bảo mật/VPN, tối thiểu FHD
ratio/size: ~2.4:1
placeholder: <AssetImage assetKey="product.vpn.hero" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.vpn.hero")
reference_target: references/ui-approved/20-product-vpn.webp
status: OPEN
```

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

### Placeholder hệ thống (1)

```text
NEED_ASSET
key: account.defaultAvatar
route: /account,*
section: Topbar, trang tài khoản, danh sách người giới thiệu
role: PLACEHOLDER
needed: Avatar mặc định theo bộ nhận diện, ưu tiên vector
ratio/size: 1:1
placeholder: <AssetImage assetKey="account.defaultAvatar" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="account.defaultAvatar")
reference_target: references/ui-approved/05-account.webp
status: OPEN
```

### Logo nền tảng dịch vụ (10)

```text
NEED_ASSET
key: platform.facebook
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Facebook đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.facebook" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.facebook")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.tiktok
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức TikTok đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.tiktok" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.tiktok")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.instagram
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Instagram đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.instagram" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.instagram")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.youtube
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức YouTube đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.youtube" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.youtube")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.shopee
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Shopee đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.shopee" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.shopee")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.zalo
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Zalo đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.zalo" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.zalo")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.threads
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Threads đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.threads" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.threads")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.spotify
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Spotify đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.spotify" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.spotify")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.telegram
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Telegram đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.telegram" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.telegram")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN

NEED_ASSET
key: platform.google
route: /,/services
section: Ô chọn nền tảng, bảng đơn hàng
role: PLATFORM_MARK
needed: Logo chính thức Google Map đúng bản quyền, nền trong suốt
ratio/size: 1:1 (28–40px)
placeholder: <AssetImage assetKey="platform.google" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="platform.google")
reference_target: references/ui-approved/02-services.webp
reference_original: clone-thatim-vn: modules/images/platforms
status: OPEN
```

### Logo sản phẩm premium (8)

```text
NEED_ASSET
key: product.youtube
route: /products,/products/youtube,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm YouTube Premium đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.youtube" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.youtube")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.capcut
route: /products,/products/capcut,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm CapCut Pro đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.capcut" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.capcut")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.canva
route: /products,/products/canva,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm Canva Pro đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.canva" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.canva")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.veo3
route: /products,/products/veo3,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm Google Veo 3 AI đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.veo3" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.veo3")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.gemini
route: /products,/products/gemini,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm Google Gemini Pro đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.gemini" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.gemini")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.chatgpt
route: /products,/products/chatgpt,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm ChatGPT Plus đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.chatgpt" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.chatgpt")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.netflix
route: /products,/products/netflix,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm Netflix Ultra 4K đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.netflix" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.netflix")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
status: OPEN

NEED_ASSET
key: product.vpn
route: /products,/products/vpn,/purchased
section: Thẻ sản phẩm, hero chi tiết, sản phẩm đã mua
role: PRODUCT_MARK
needed: Ảnh/logo sản phẩm Combo VPN Quốc Tế đúng bản quyền, nền trong suốt
ratio/size: 1:1 (40–64px)
placeholder: <AssetImage assetKey="product.vpn" /> — src/components/blocks/AssetImage.tsx (ô nét đứt, data-todo-asset="product.vpn")
reference_target: references/ui-approved/03-products.webp
reference_original: clone-thatim-vn: uploads/images/original
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

- `brand.favicon` chưa có nên trình duyệt trả 404 cho `/favicon.ico`. Đây là hệ quả trực tiếp
  của asset thiếu, không phải lỗi ứng dụng; sẽ hết ngay khi có icon thật.
- Ba ảnh tham chiếu trong repo bị hỏng file, không mở được bằng trình giải mã WebP:
  `references/ui-approved/12-product-purchased.webp`, `15-product-canva.webp`,
  `17-product-gemini.webp`. Ba route tương ứng được dựng theo quy tắc trong
  `PROJECT_HANDOFF.md §8` và mẫu chung của các route cùng loại. Đề nghị ChatGPT xuất lại 3 ảnh này.
