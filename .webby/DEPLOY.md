# Đưa lên Vercel và đấu SePay

Làm theo đúng thứ tự dưới đây. Mỗi bước có chỗ nào cần anh thao tác tay thì ghi rõ **[anh làm]**.

---

## 1. Gộp nhánh vào main

**[anh làm]** Vào PR do Claude mở, xem rồi bấm Merge. Vercel sẽ lấy `main` làm bản chính thức.

---

## 2. Tạo dự án Vercel

**[anh làm]**

1. Vào https://vercel.com → **Add New → Project** → chọn repo `th6322750-stack/LacVietShop`.
2. Framework Vercel tự nhận là Next.js, giữ nguyên mọi thiết lập mặc định.
3. **Chưa bấm Deploy vội** — sang bước 3 tạo cơ sở dữ liệu trước, vì thiếu `DATABASE_URL`
   thì lần deploy đầu sẽ chạy ở chế độ ghi tệp và hỏng ngay.

---

## 3. Tạo cơ sở dữ liệu Postgres

**[anh làm]**

1. Trong dự án vừa tạo → tab **Storage** → **Create Database** → chọn **Postgres (Neon)**.
2. Chọn vùng Singapore cho gần Việt Nam.
3. Bấm **Connect** để nối vào dự án. Vercel tự thêm biến `DATABASE_URL` vào môi trường.

Bảng sẽ tự tạo ở lần gọi đầu tiên, không cần chạy lệnh nào.

---

## 4. Điền biến môi trường

**[anh làm]** Settings → **Environment Variables**, thêm cho cả ba môi trường
(Production, Preview, Development):

| Tên | Giá trị | Ghi chú |
|---|---|---|
| `THATIM_API_URL` | `https://thatim.vn/api/v2` | |
| `THATIM_API_KEY` | khoá API thatim | **nên xoay khoá mới**, khoá cũ đã lộ |
| `THATIM_USD_TO_VND` | `26000` | |
| `THATIM_ALLOW_ORDERS` | `false` | bật `true` khi đã nạp tiền vào tài khoản thatim |
| `ADMIN_ACCOUNTS` | `admin:<mật khẩu mạnh>` | **bắt buộc đổi**, để trống là dùng `admin123` |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `465` | |
| `SMTP_USER` | `lacvietmedia.agency@gmail.com` | |
| `SMTP_PASS` | App Password 16 ký tự | |
| `SMTP_FROM` | `Lạc Việt Media <lacvietmedia.agency@gmail.com>` | |
| `SEPAY_WEBHOOK_KEY` | chuỗi ngẫu nhiên anh tự đặt | dán y hệt sang SePay ở bước 6 |
| `SEPAY_ACCOUNT_NUMBER` | số tài khoản VietinBank nhận tiền | |
| `SEPAY_BANK` | `VietinBank` | |
| `SEPAY_ACCOUNT_NAME` | tên chủ tài khoản | chỉ để hiển thị |

`DATABASE_URL` đã có sẵn từ bước 3.

Sinh khoá webhook ngẫu nhiên:

```
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

---

## 5. Deploy

**[anh làm]** Bấm **Deploy**. Xong sẽ có địa chỉ dạng `https://lac-viet-shop.vercel.app`.

Kiểm tra ngay ba đường sau:

- `/` — trang chủ lên được
- `/services` — có nhãn xanh **“Bảng giá trực tiếp”** (nghĩa là API thatim thông)
- `/admin/login` — đăng nhập bằng tài khoản trong `ADMIN_ACCOUNTS`

---

## 6. Đấu webhook SePay

**[anh làm]** Vào https://my.sepay.vn/webhooks → **Tạo webhook**:

| Ô | Điền |
|---|---|
| Tên webhook | `Lạc Việt — cộng số dư` |
| URL nhận webhook | `https://<tên-miền-vercel>/api/webhooks/sepay` |
| Loại giao dịch | **Tiền vào** |
| Định dạng dữ liệu | **JSON** |
| Tự động gửi lại khi server trả lỗi | **Bật** |

Sang bước **Bảo mật**: chọn kiểu **API Key**, dán đúng chuỗi đã đặt ở `SEPAY_WEBHOOK_KEY`.

> Hệ thống chống cộng trùng bằng mã giao dịch SePay, nên bật “tự động gửi lại” là an toàn —
> cùng một giao dịch gửi bao nhiêu lần cũng chỉ cộng tiền một lần.

---

## 7. Chạy thử bằng tiền thật

1. Đăng ký một tài khoản khách trên web.
2. Vào **Nạp tiền**, chọn 10.000đ, bấm lấy thông tin chuyển khoản.
3. Quét QR hoặc chuyển khoản thủ công, **giữ nguyên nội dung**.
4. Trong vòng một phút số dư phải tự cộng; trang tự kiểm tra mỗi 5 giây.

Không thấy tiền vào thì xem **Lịch sử gửi** trong SePay để biết webhook có bắn không và
máy chủ trả về gì.

---

## Việc còn lại sau khi lên được

- **Xoay khoá API thatim** — khoá đang dùng đã lộ trong hội thoại.
- **Đổi mật khẩu quản trị** qua `ADMIN_ACCOUNTS`; để trống là ai cũng đăng nhập được bằng
  `admin/admin123`.
- **Chốt hệ số bán** ở `/admin/services`. Hiện +0%, tức đang bán đúng giá vốn, không có lãi.
- **Nạp tiền vào tài khoản thatim** rồi mới bật `THATIM_ALLOW_ORDERS=true`. Số dư lúc đấu nối
  chỉ có 0,006 USD.
- **Đổi kênh gửi thư** sang tên miền riêng khi có khách thật — Gmail giới hạn ~500 thư/ngày và
  người nhận thấy địa chỉ @gmail.com.
- **Tên miền riêng**: Settings → Domains trong Vercel. Đổi tên miền thì phải sửa lại URL webhook
  bên SePay.
