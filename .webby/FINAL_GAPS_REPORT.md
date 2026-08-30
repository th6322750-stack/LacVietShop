# FINAL PRODUCTION GAPS REPORT

Lượt dựng đầu tiên cho 20 route đã hoàn tất. Toàn bộ giao diện và tương tác chạy bằng
**adapter DEMO có kiểu rõ ràng**, tách hẳn khỏi tích hợp production.

Không có hiệu ứng phụ thật nào được thực hiện: không chuyển tiền, không tạo tài khoản,
không gọi API bên ngoài, không tạo tên miền/DNS.

- Tổng số gap còn mở: **10**
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
area: catalog
needed: Bảng giá dịch vụ và sản phẩm premium thật theo từng cấp bậc (Thành viên/CTV/Đại lý/NPP)
current_demo_source: src/lib/demo/catalog.ts (10 nền tảng, 8 sản phẩm với giá trình diễn)
production_risk_if_unresolved: Khách thấy giá sai; đơn hàng tính tiền không đúng doanh thu thực tế
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
needed: API tạo đơn, tra trạng thái, bảo hành/bù hụt và webhook cập nhật tiến độ
current_demo_source: src/lib/demo/config.ts → commerceAdapter.submitOrder (mã đơn giả lập, chờ 450ms)
production_risk_if_unresolved: Đơn hàng không đến nhà cung cấp; tiến độ hiển thị là dữ liệu tĩnh
status: OPEN

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
```

## Nguyên tắc đã áp dụng trong lượt dựng này

- Mọi khối phụ thuộc cấu hình thật đều có nhãn **DEMO** hiển thị cho người dùng (trang Nạp tiền,
  Panel con, API Documentation, các nút đặt đơn).
- `commerceAdapter.mode === "DEMO"`; khi có backend thật chỉ cần thay phần thân adapter,
  không phải sửa từng màn hình.
- Không có giá trị bí mật nào nằm trong mã client: khoá API hiển thị dạng đã che, ví dụ trong
  tài liệu dùng token giả, `.env.example` để trống.
