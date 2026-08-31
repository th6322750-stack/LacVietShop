# FINAL PRODUCTION GAPS REPORT

Lượt dựng đầu tiên cho 20 route đã hoàn tất. Toàn bộ giao diện và tương tác chạy bằng
**adapter DEMO có kiểu rõ ràng**, tách hẳn khỏi tích hợp production.

Không có hiệu ứng phụ thật nào được thực hiện: không chuyển tiền, không tạo tài khoản,
không gọi API bên ngoài, không tạo tên miền/DNS.

- Tổng số gap còn mở: **13** (1 đã chuyển sang PARTIAL: backend.orderApi)
- Ranh giới adapter: `src/lib/demo/config.ts` (`commerceAdapter`, `demoBrand`, `demoPaymentNotice`)
- Dữ liệu trình diễn: `src/lib/demo/data.ts`, `src/lib/demo/catalog.ts`
- Biến môi trường dự kiến: `.env.example` (chưa có giá trị thật nào được commit)

## Open items

```text
GAP
key: brand.domain
area: business
needed: Tên miền production chính thức của Lạc Việt Media Agency
current_demo_source: src/lib/demo/config.ts → demoBrand.domain = "demo.lacviet.invalid"
production_risk_if_unresolved: Liên kết giới thiệu affiliate, địa chỉ panel con và base URL của API đều đang trỏ tới domain giả
status: OPEN

GAP
key: brand.contact
area: contact
needed: Hotline, Zalo OA, email hỗ trợ chính thức và khung giờ trực thật
current_demo_source: src/lib/demo/config.ts → demoBrand.supportChannels (đang hiển thị "Chưa cấu hình")
production_risk_if_unresolved: Khách không có kênh liên hệ khi cần bảo hành hoặc đối soát nạp tiền
status: OPEN

GAP
key: payment.receivingAccount
area: payment
needed: Tài khoản nhận tiền đã được duyệt (ngân hàng, số tài khoản, chủ tài khoản, cú pháp nội dung)
current_demo_source: src/components/views/DepositView.tsx → khối QRCard hiển thị "Chưa cấu hình"
production_risk_if_unresolved: Không thể nạp tiền thật; hiển thị số tài khoản sai có nguy cơ mất tiền của khách
status: OPEN

GAP
key: payment.gateway
area: payment
needed: Hợp đồng cổng thanh toán (nhà cung cấp, khoá, webhook xác nhận, chính sách phí)
current_demo_source: src/lib/demo/config.ts → commerceAdapter.submitDeposit (chỉ trả về mã tham chiếu giả)
production_risk_if_unresolved: Lệnh nạp không được đối soát tự động; số dư hiển thị không phản ánh tiền thật
status: OPEN

GAP
key: catalog.pricing
area: business
needed: Chốt hệ số bán ra (THATIM_MARKUP) và mức giảm theo bậc thành viên
current_demo_source: giá gốc đã là giá thật của nhà cung cấp (rate USD/1.000 × 26.000đ, đối chiếu khớp
  25/25 máy chủ trên bảng giá công bố). Hiện THATIM_MARKUP=1 nên bán đúng giá gốc — không có lãi.
  Mức giảm theo bậc lấy tạm tỷ lệ quan sát được: src/lib/thatim/config.ts → tierMultipliers.
production_risk_if_unresolved: Bán đúng giá vốn, không có biên lợi nhuận; bảng giá theo bậc chưa phải chính sách đã duyệt
status: OPEN

GAP
key: auth.provider
area: auth
needed: Cơ chế đăng nhập/đăng ký, quản lý phiên và luồng khôi phục mật khẩu
current_demo_source: Chưa có màn đăng nhập; toàn app giả định một tài khoản DEMO trong src/lib/demo/data.ts
production_risk_if_unresolved: Mọi người truy cập đều thấy cùng một dữ liệu; không có ranh giới bảo mật giữa các tài khoản
status: OPEN

GAP
key: backend.orderApi
area: backend
needed: Bật đẩy đơn thật và bổ sung webhook cập nhật tiến độ, bảo hành/bù hụt
current_demo_source: đã đấu API nhà cung cấp — src/lib/thatim/* + src/app/api/thatim/*. Danh mục và
  đơn giá đã lấy trực tiếp (26 nền tảng / 105 nhóm / 423 máy chủ). Đẩy đơn đã nối dây nhưng bị chặn
  bằng THATIM_ALLOW_ORDERS=false; khi chặn thì rơi về commerceAdapter.submitOrder và báo rõ lý do.
  Tra trạng thái đơn có sẵn ở GET /api/thatim/order?order=...; chưa có webhook nên tiến độ vẫn tĩnh.
production_risk_if_unresolved: Đơn khách đặt chưa thực sự tới nhà cung cấp; tiến độ hiển thị là dữ liệu tĩnh
status: PARTIAL

GAP
key: backend.apiTokens
area: api
needed: Hệ thống cấp phát/thu hồi khoá API, hạn mức thật và chữ ký webhook
current_demo_source: src/lib/demo/data.ts → account.apiTokenMasked; ví dụ trong ApiDocsView dùng token giả "lv_demo_…"
production_risk_if_unresolved: Trang API Documentation mô tả hợp đồng chưa tồn tại; đối tác không tích hợp được
status: OPEN

GAP
key: affiliate.commissionPolicy
area: business
needed: Chính sách hoa hồng chính thức: tỉ lệ từng bậc, điều kiện lên hạng, kỳ đối soát, mức rút tối thiểu
current_demo_source: src/lib/demo/data.ts → commissionTiers, affiliateStats
production_risk_if_unresolved: Cam kết sai tỉ lệ hoa hồng với đại lý; tranh chấp khi chi trả
status: OPEN

GAP
key: childPanel.provisioning
area: backend
needed: Quy trình cấp phát panel con thật: tên miền con, DNS, chứng chỉ TLS, tách dữ liệu và bảng giá sỉ
current_demo_source: src/components/views/ChildPanelView.tsx (form chỉ hiện thông báo mô phỏng)
production_risk_if_unresolved: Đại lý tưởng đã tạo được panel nhưng thực tế không có website nào được dựng
status: OPEN

GAP
key: supplier.balance
area: business
needed: Nạp tiền vào tài khoản nhà cung cấp trước khi bật đẩy đơn thật
current_demo_source: action=balance trả 0.00577 USD (≈150đ) — không đủ cho bất kỳ đơn nào
production_risk_if_unresolved: Bật THATIM_ALLOW_ORDERS mà chưa nạp thì mọi đơn khách đặt đều bị nhà cung cấp từ chối
status: OPEN

GAP
key: supplier.apiKey
area: security
needed: Xoay khoá API hiện tại và cấp khoá riêng cho môi trường production
current_demo_source: .env.local (đã gitignore, không commit). Khoá đang dùng từng được dán vào khung chat nên coi như đã lộ.
production_risk_if_unresolved: Người khác cầm được khoá là tiêu được số dư và đọc toàn bộ bảng giá của tài khoản
status: OPEN

GAP
key: order.reconciliation
area: backend
needed: Lưu đơn đã đẩy (mã đơn nhà cung cấp ↔ đơn của mình) và đối soát tiền
current_demo_source: POST /api/thatim/order trả mã đơn nhưng chưa ghi vào kho dữ liệu nào; kho quản trị vẫn là localStorage
production_risk_if_unresolved: Đẩy đơn thành công nhưng mất dấu, không tra được tiến độ và không đối soát được doanh thu
status: OPEN
```

## Nguyên tắc đã áp dụng trong lượt dựng này

- Mọi khối phụ thuộc cấu hình thật đều có nhãn **DEMO** hiển thị cho người dùng (trang Nạp tiền,
  Panel con, API Documentation, các nút đặt đơn).
- `commerceAdapter.mode === "DEMO"`; khi có backend thật chỉ cần thay phần thân adapter,
  không phải sửa từng màn hình.
- Không có giá trị bí mật nào nằm trong mã client: khoá API hiển thị dạng đã che, ví dụ trong
  tài liệu dùng token giả, `.env.example` để trống.
- Khoá API nhà cung cấp chỉ tồn tại trong `.env.local` (đã gitignore) và chỉ được đọc ở
  `src/lib/thatim/*` — các tệp này có chốt chặn ném lỗi nếu bị nạp ở phía trình duyệt.
  Trình duyệt chỉ gọi được ba route proxy trong `src/app/api/thatim/`.
- Đẩy đơn thật là hành động tiêu tiền nên mặc định TẮT (`THATIM_ALLOW_ORDERS=false`); khi tắt,
  giao diện báo rõ "Chưa đẩy đơn thật" thay vì âm thầm chạy đơn mô phỏng.
