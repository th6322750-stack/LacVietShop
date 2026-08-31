# Đấu nối API nhà cung cấp (thatim.vn API v2)

Tài liệu vận hành cho phần frontend ↔ backend ↔ quản trị đã nối với API nhà cung cấp.

## 1. Cấu hình

Khoá API **chỉ** nằm trong `.env.local` (đã gitignore, không bao giờ commit). Chép từ `.env.example`:

```
THATIM_API_URL=https://thatim.vn/api/v2
THATIM_API_KEY=<khoá của bạn>
THATIM_USD_TO_VND=26000
THATIM_MARKUP=1
THATIM_ALLOW_ORDERS=false
THATIM_CACHE_SECONDS=300
```

Đổi biến môi trường phải **khởi động lại tiến trình** Next.js mới có tác dụng.

## 2. Đường đi của dữ liệu

```
Trình duyệt ──► /api/thatim/*  ──► src/lib/thatim/client.ts ──► https://thatim.vn/api/v2
   (không          (route            (đính khoá API)
    thấy khoá)      handler)
```

- `src/lib/thatim/config.ts` — đọc biến môi trường, che khoá khi hiển thị
- `src/lib/thatim/client.ts` — gọi API, chuẩn hoá lỗi, timeout 20 giây
- `src/lib/thatim/map.ts` — chuyển 423 dịch vụ thô thành cây *nền tảng → nhóm dịch vụ → máy chủ*
- `src/lib/thatim/catalog.ts` — nhớ tạm 5 phút, tự rơi về danh mục tĩnh khi API hỏng

Ba tệp `config`/`client`/`catalog` có chốt chặn ném lỗi nếu bị nạp ở phía trình duyệt.

## 3. Ba route proxy

| Route | Việc |
|---|---|
| `GET /api/thatim/status` | trạng thái kết nối, số dư, số lượng dịch vụ (khoá trả về dạng đã che) |
| `GET /api/thatim/catalog` | cây danh mục đã quy đổi sang đồng; `?refresh=1` bỏ qua bộ nhớ tạm |
| `POST /api/thatim/order` | đẩy đơn thật — **mặc định bị chặn** |
| `GET /api/thatim/order?order=<id>` | tra trạng thái đơn đã đẩy |

## 4. Quy đổi giá

API trả `rate` theo **USD cho 1.000 tương tác**.

```
đồng/tương tác = rate × THATIM_USD_TO_VND ÷ 1000 × THATIM_MARKUP
```

Tỷ giá 26.000 không phải phỏng đoán: đối chiếu 25/25 máy chủ Tiktok với bảng giá công bố
trên trang nhà cung cấp thì khớp **từng đồng** (ví dụ dịch vụ `47994`: `0.08846 × 26000 ÷ 1000 = 2.3đ`).

`THATIM_MARKUP=1` nghĩa là đang **bán đúng giá vốn**. Chốt hệ số bán ra trước khi mở bán thật
(gap `catalog.pricing`).

## 5. Bật đẩy đơn thật

Đẩy đơn là **tiêu tiền thật** trong tài khoản nhà cung cấp, nên mặc định tắt.

Trước khi bật:

1. Nạp tiền vào tài khoản nhà cung cấp — lúc đấu nối số dư chỉ có `0.00577 USD` (≈150đ), không đủ cho đơn nào.
2. Chốt `THATIM_MARKUP` để không bán lỗ.
3. Đặt `THATIM_ALLOW_ORDERS=true` rồi khởi động lại.

Khi còn tắt, khách bấm đặt hàng sẽ thấy thông báo **“Chưa đẩy đơn thật”** kèm lý do, rồi
đơn chạy tiếp ở chế độ mô phỏng — không im lặng đánh tráo.

Chưa có chỗ lưu đơn đã đẩy (gap `order.reconciliation`): mã đơn nhà cung cấp trả về mới chỉ
hiện trên màn hình, chưa ghi vào kho dữ liệu nào.

## 6. Khi API hỏng

Danh mục tự rơi về `src/lib/demo/services-catalog.ts` (23 nền tảng / 124 nhóm / 145 máy chủ,
dựng từ bản chụp trang nhà cung cấp bằng `node tools/build-services-catalog.mjs`).
Trang đặt dịch vụ hiện thẻ vàng **“Đang dùng bảng giá dự phòng”** kèm lý do — không bao giờ để trang trắng.

## 7. Theo dõi ở trang quản trị

`/admin/api` cho xem trạng thái kết nối, số dư, tỷ giá đang áp dụng, toàn bộ bảng dịch vụ
(lọc theo nền tảng, tìm kiếm, xuất CSV) và nút nạp lại. Khoá API hiển thị dạng `tAWz••••EaEE`.

## 8. Bảo mật

- Khoá không có trong mã nguồn, không có trong git, không xuống trình duyệt.
- **Khoá đang dùng từng được dán vào khung chat nên coi như đã lộ — cần xoay khoá** (gap `supplier.apiKey`).
- Nếu lỡ commit khoá: xoá tệp là chưa đủ, phải viết lại lịch sử (`git filter-repo`) rồi xoay khoá.
