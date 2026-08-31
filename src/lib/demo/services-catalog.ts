import type { Platform } from "@/types";

/**
 * TỰ ĐỘNG SINH — không sửa tay. Chạy lại: node tools/build-services-catalog.mjs
 *
 * Nguồn: bản clone thatim.vn (index.html → PLATFORM_SERVICES, services.html → bảng máy chủ).
 * Cấu trúc bám đúng bên họ: nền tảng → nhóm dịch vụ → nhiều máy chủ, mỗi máy chủ
 * có MIN/MAX và bảng giá theo 4 bậc thành viên.
 *
 * 23 nền tảng · 124 dịch vụ · 145 máy chủ.
 *
 * server.source:
 *   "clone" = thông số thật đọc từ bản clone (25 máy chủ, đều thuộc Tiktok —
 *             chỉ nền tảng này có bảng máy chủ trong bản chụp)
 *   "demo"  = chỗ dành sẵn để luồng đặt đơn chạy được (120 máy chủ);
 *             số liệu thật lấy từ API thatim.vn khi đấu nối.
 *
 * server.code do mình tự đánh, KHÔNG phải service_id của thatim.vn.
 * server.apiServiceId là chỗ điền id thật khi đấu API — hiện để null toàn bộ.
 */

/** Bậc giá đọc từ bảng giá bên nguồn. */
export const serviceTiers = [
  {
    "id": "member",
    "label": "Thành viên"
  },
  {
    "id": "collaborator",
    "label": "Cộng tác viên"
  },
  {
    "id": "agency",
    "label": "Đại lý"
  },
  {
    "id": "distributor",
    "label": "Nhà phân phối"
  }
] as const;

export const platforms: Platform[] = [
  {
    "id": "tiktok",
    "name": "Tiktok",
    "slug": "tiktok",
    "region": "vn",
    "assetKey": "platform.tiktok",
    "services": [
      {
        "id": "tiktok-tang-luot-xem-video",
        "name": "Tăng Lượt Xem Video",
        "slug": "tang-luot-xem-video",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47047",
            "code": "47047",
            "apiServiceId": null,
            "index": 1,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Nguồn: Nick Phonefarm ~ Có Đề Xuất ~ Không Tụt ~ Máy Chủ Xịn Nhất ~ Tốc Độ Nhanh: 10.000.000/Ngày ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 2.3,
            "costPerUnit": 2.3,
            "pricesByTier": [
              2.3,
              2.28,
              2.26,
              2.24
            ],
            "min": 200,
            "max": 1000000000,
            "speed": "Nhanh: 10.000.000/Ngày",
            "refill": "Không Tụt",
            "sourceNote": "Nick Phonefarm",
            "tags": [
              "Có Đề Xuất",
              "Máy Chủ Xịn Nhất",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47048",
            "code": "47048",
            "apiServiceId": null,
            "index": 2,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Nguồn: Nick Phonefarm ~ Có Thể Đưa Video Lên Đề Xuất Và Xu Hướng ~ Tốc Độ Chậm: 10.000- 100.000/ Ngày ~ Không Tụt ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 1.6,
            "costPerUnit": 1.6,
            "pricesByTier": [
              1.6,
              1.58,
              1.56,
              1.54
            ],
            "min": 5000,
            "max": 1000000000,
            "speed": "Chậm: 10.000- 100.000/ Ngày",
            "refill": "Không Tụt",
            "sourceNote": "Nick Phonefarm",
            "tags": [
              "Có Thể Đưa Video Lên Đề Xuất Và Xu Hướng",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47049",
            "code": "47049",
            "apiServiceId": null,
            "index": 3,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Hầu Như Không Tụt ~ Có Thể Đưa Video Lên Xu Hướng ~ Tốc Độ Nhanh : 20.000-500.000/Ngày ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 1.3,
            "costPerUnit": 1.3,
            "pricesByTier": [
              1.3,
              1.29,
              1.28,
              1.27
            ],
            "min": 5000,
            "max": 100000000,
            "speed": "Nhanh : 20.000-500.000/Ngày",
            "refill": "Hầu Như Không Tụt",
            "tags": [
              "Có Thể Đưa Video Lên Xu Hướng",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47050",
            "code": "47050",
            "apiServiceId": null,
            "index": 4,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Không Tụt ~ Có Thể Bật Kiếm Tiền ~ Giá Rẻ ~ Có Đề Xuất Xu Hướng ~ Tốc Độ: 50.000-100.000/ Ngày~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 1.1,
            "costPerUnit": 1.1,
            "pricesByTier": [
              1.1,
              1.09,
              1.08,
              1.07
            ],
            "min": 5000,
            "max": 1000000000,
            "speed": "50.000-100.000/ Ngày",
            "refill": "Không Tụt",
            "tags": [
              "Có Thể Bật Kiếm Tiền",
              "Giá Rẻ",
              "Có Đề Xuất Xu Hướng",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47051",
            "code": "47051",
            "apiServiceId": null,
            "index": 5,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Giá Rẻ ~ Tốc Độ Nhanh: 1.000.000-10.000.000/Ngày ~ Có Thể Có Tỉ Lệ Tụt ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 0.37,
            "costPerUnit": 0.37,
            "pricesByTier": [
              0.37,
              0.365,
              0.36,
              0.355
            ],
            "min": 100,
            "max": 1000000000,
            "speed": "Nhanh: 1.000.000-10.000.000/Ngày",
            "tags": [
              "Giá Rẻ",
              "Có Thể Có Tỉ Lệ Tụt",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47052",
            "code": "47052",
            "apiServiceId": null,
            "index": 6,
            "name": "Tăng Lượt Xem Video Tiktok",
            "fullName": "Tăng Lượt Xem Video Tiktok ~ Giá Siêu Rẻ ~ Tốc Độ: 1.000.000-10.000.000/Ngày ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 0.2,
            "costPerUnit": 0.2,
            "pricesByTier": [
              0.2,
              0.19,
              0.18,
              0.17
            ],
            "min": 100,
            "max": 2147483647,
            "speed": "1.000.000-10.000.000/Ngày",
            "tags": [
              "Giá Siêu Rẻ",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          }
        ]
      },
      {
        "id": "tiktok-tang-tha-tim-video",
        "name": "Tăng Thả Tim Video",
        "slug": "tang-tha-tim-video",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47053",
            "code": "47053",
            "apiServiceId": null,
            "index": 1,
            "name": "Tăng Thả Tim Video Tiktok",
            "fullName": "Tăng Thả Tim Video Tiktok ~ Ít Tụt Nhất ~ Tốc Độ Nhanh: 1.000-10.000/Ngày ~ Bắt Đầu Nhanh ~ Tài Nguyên Random 🔥🔥🔥",
            "pricePerUnit": 8.5,
            "costPerUnit": 8.5,
            "pricesByTier": [
              8.5,
              8.4,
              8.3,
              8.2
            ],
            "min": 20,
            "max": 5000000,
            "speed": "Nhanh: 1.000-10.000/Ngày",
            "tags": [
              "Ít Tụt Nhất",
              "Bắt Đầu Nhanh",
              "Tài Nguyên Random"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47054",
            "code": "47054",
            "apiServiceId": null,
            "index": 2,
            "name": "Tăng Thả Tim Video",
            "fullName": "Tăng Thả Tim Video ~ Tốc Độ Nhanh: 1.000-5.000/Ngày ~ Giá Siêu Rẻ ~ Lên Ngay ~ Tài Nguyên Việt Nam🔥🔥 🔥",
            "pricePerUnit": 5.8,
            "costPerUnit": 5.8,
            "pricesByTier": [
              5.8,
              5.7,
              5.6,
              5.5
            ],
            "min": 50,
            "max": 8000,
            "speed": "Nhanh: 1.000-5.000/Ngày",
            "tags": [
              "Giá Siêu Rẻ",
              "Lên Ngay",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47055",
            "code": "47055",
            "apiServiceId": null,
            "index": 3,
            "name": "Tăng Lượt Thả Tim Video Người Dùng Bấm Tay",
            "fullName": "Tăng Lượt Thả Tim Video Người Dùng Bấm Tay ~ Tỉ Lệ Tụt Thấp Hơn ~ Lên Nhanh: 5.000-20.000/Ngày ~ Tài Nguyên Việt Nam 🇻🇳🔥🔥 🔥",
            "pricePerUnit": 157555.885,
            "costPerUnit": 157555.885,
            "pricesByTier": [
              157555.885,
              156374.807,
              155193.728,
              153540.218
            ],
            "min": 50,
            "max": 50000,
            "tags": [
              "Tỉ Lệ Tụt Thấp Hơn",
              "Lên Nhanh: 5.000-20.000/Ngày",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47056",
            "code": "47056",
            "apiServiceId": null,
            "index": 4,
            "name": "Tăng Thả Tim Video Người Dùng Bấm Tay",
            "fullName": "Tăng Thả Tim Video Người Dùng Bấm Tay ~ Tỉ Lệ Tụt Cao ~ Tốc Độ Nhanh: 5.000-30.000/Ngày ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 7.5,
            "costPerUnit": 7.5,
            "pricesByTier": [
              7.5,
              7.4,
              7.3,
              7.2
            ],
            "min": 50,
            "max": 50000,
            "speed": "Nhanh: 5.000-30.000/Ngày",
            "tags": [
              "Tỉ Lệ Tụt Cao",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47057",
            "code": "47057",
            "apiServiceId": null,
            "index": 5,
            "name": "Tăng Thả Tim Video",
            "fullName": "Tăng Thả Tim Video ~ Ít Tụt ~ Tốc Độ: 5.000-20.000/Ngày ~ Bắt Đầu Nhanh ~ Tài Nguyên Ngoại🔥🔥🔥🔥 🔥",
            "pricePerUnit": 8,
            "costPerUnit": 8,
            "pricesByTier": [
              8,
              7.9,
              7.8,
              7.6
            ],
            "min": 10,
            "max": 1000000,
            "speed": "5.000-20.000/Ngày",
            "tags": [
              "Ít Tụt",
              "Bắt Đầu Nhanh",
              "Tài Nguyên Ngoại"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47058",
            "code": "47058",
            "apiServiceId": null,
            "index": 6,
            "name": "Tăng Thả Tim Video",
            "fullName": "Tăng Thả Tim Video ~ Người Dùng ~ Lên Nhanh: 5.000-20.000/Ngày ~ Dành Cho Video Cần Tim Lớn ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 26,
            "costPerUnit": 26,
            "pricesByTier": [
              26,
              25.8,
              25.3,
              25
            ],
            "min": 50,
            "max": 50000,
            "tags": [
              "Người Dùng",
              "Lên Nhanh: 5.000-20.000/Ngày",
              "Dành Cho Video Cần Tim Lớn",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          }
        ]
      },
      {
        "id": "tiktok-tang-nguoi-theo-doi",
        "name": "Tăng Người Theo Dõi",
        "slug": "tang-nguoi-theo-doi",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47059",
            "code": "47059",
            "apiServiceId": null,
            "index": 1,
            "name": "Tăng Người Theo Dõi",
            "fullName": "Tăng Người Theo Dõi ~ Có Tụt ~ Tốc Độ Siêu Nhanh : 5.000-10.000/Ngày ~ Ổn Định Nhất ~ Tài Nguyên Cổ Ngoại🔥🔥🔥",
            "pricePerUnit": 75,
            "costPerUnit": 75,
            "pricesByTier": [
              75,
              74.8,
              74.6,
              74.4
            ],
            "min": 100,
            "max": 10000,
            "speed": "Siêu Nhanh : 5.000-10.000/Ngày",
            "tags": [
              "Có Tụt",
              "Ổn Định Nhất",
              "Tài Nguyên Cổ Ngoại"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47060",
            "code": "47060",
            "apiServiceId": null,
            "index": 2,
            "name": "Tăng Người Theo Dõi",
            "fullName": "Tăng Người Theo Dõi ~ Có Tụt ~ Tốc Độ Nhanh: 1.000-5.000/Ngày ~ Tài Nguyên Ngoại 🔥🔥🔥",
            "pricePerUnit": 64,
            "costPerUnit": 64,
            "pricesByTier": [
              64,
              63.5,
              63,
              62.5
            ],
            "min": 100,
            "max": 1000,
            "speed": "Nhanh: 1.000-5.000/Ngày",
            "tags": [
              "Có Tụt",
              "Tài Nguyên Ngoại"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47061",
            "code": "47061",
            "apiServiceId": null,
            "index": 3,
            "name": "Tăng Người Theo Dõi Người Dùng",
            "fullName": "Tăng Người Theo Dõi Người Dùng ~ Hỗ Trợ Đè Đơn ~ Tỉ Lệ Tụt Cao ~ Tốc Độ Khá Nhanh : 400-500/Ngày ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥",
            "pricePerUnit": 37,
            "costPerUnit": 37,
            "pricesByTier": [
              37,
              36.5,
              36,
              35.5
            ],
            "min": 100,
            "max": 100000,
            "speed": "Khá Nhanh : 400-500/Ngày",
            "tags": [
              "Hỗ Trợ Đè Đơn",
              "Tỉ Lệ Tụt Cao",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47062",
            "code": "47062",
            "apiServiceId": null,
            "index": 4,
            "name": "Tăng Người Theo Dõi Người Dùng",
            "fullName": "Tăng Người Theo Dõi Người Dùng ~ Tốc Độ Chậm: 100-300/Ngày ~ Tỉ Lệ Tụt Cao ~ Tài Nguyên Việt Nam Có Tỉ Lệ Video Cao🔥🔥",
            "pricePerUnit": 21,
            "costPerUnit": 21,
            "pricesByTier": [
              21,
              20.8,
              20.6,
              20.4
            ],
            "min": 100,
            "max": 100000,
            "speed": "Chậm: 100-300/Ngày",
            "tags": [
              "Tỉ Lệ Tụt Cao",
              "Tài Nguyên Việt Nam Có Tỉ Lệ Video Cao"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47063",
            "code": "47063",
            "apiServiceId": null,
            "index": 5,
            "name": "Tăng Người Theo Dõi",
            "fullName": "Tăng Người Theo Dõi ~ Tốc Độ Nhanh: 2.000-5.000/Ngày ~ Tỉ Lệ Tụt Thấp ~ Tài Nguyên Ngoại Cổ Giá Rẻ 🔥🔥🔥",
            "pricePerUnit": 25,
            "costPerUnit": 25,
            "pricesByTier": [
              25,
              24.8,
              24.6,
              24.4
            ],
            "min": 100,
            "max": 200000,
            "speed": "Nhanh: 2.000-5.000/Ngày",
            "tags": [
              "Tỉ Lệ Tụt Thấp",
              "Tài Nguyên Ngoại Cổ Giá Rẻ"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47064",
            "code": "47064",
            "apiServiceId": null,
            "index": 6,
            "name": "Tăng Người Theo Dõi Tiktok",
            "fullName": "Tăng Người Theo Dõi Tiktok ~ Tốc Độ Nhanh: 2.000-20.000/Ngày ~ Tỉ Lệ Tụt Thấp ~ Tài Nguyên Tài Khoản Cổ Ngoại 🔥🔥 🔥",
            "pricePerUnit": 25,
            "costPerUnit": 25,
            "pricesByTier": [
              25,
              24.8,
              24.6,
              24.4
            ],
            "min": 100,
            "max": 5000000,
            "speed": "Nhanh: 2.000-20.000/Ngày",
            "tags": [
              "Tỉ Lệ Tụt Thấp",
              "Tài Nguyên Tài Khoản Cổ Ngoại"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47065",
            "code": "47065",
            "apiServiceId": null,
            "index": 7,
            "name": "Tăng Người Theo Dõi",
            "fullName": "Tăng Người Theo Dõi ~ Giá Rẻ ~ Tốc Độ Nhanh: 1.000-20.000/Ngày ~ Tài Nguyên Ngoại Random 🔥🔥",
            "pricePerUnit": 7,
            "costPerUnit": 7,
            "pricesByTier": [
              7,
              6.9,
              6.8,
              6.7
            ],
            "min": 100,
            "max": 100000,
            "speed": "Nhanh: 1.000-20.000/Ngày",
            "tags": [
              "Giá Rẻ",
              "Tài Nguyên Ngoại Random"
            ],
            "available": true,
            "source": "clone"
          }
        ]
      },
      {
        "id": "tiktok-tang-mat-livestream",
        "name": "Tăng Mắt Livestream",
        "slug": "tang-mat-livestream",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47066",
            "code": "47066",
            "apiServiceId": null,
            "index": 1,
            "name": "Tăng Lượt Xem Livestream Tiktok",
            "fullName": "Tăng Lượt Xem Livestream Tiktok ~ Máy Chủ Ổn Định ~ Tối Đa: 5.000 ~ Tốc Độ Nhanh ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥",
            "pricePerUnit": 3.2,
            "costPerUnit": 3.2,
            "pricesByTier": [
              3.2,
              3.15,
              3.1,
              3.05
            ],
            "min": 50,
            "max": 2000,
            "speed": "Nhanh",
            "tags": [
              "Máy Chủ Ổn Định",
              "Tối Đa: 5.000",
              "Tài Nguyên Việt Nam"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47067",
            "code": "47067",
            "apiServiceId": null,
            "index": 2,
            "name": "Tăng Mắt Xem Live",
            "fullName": "Tăng Mắt Xem Live ~ Lên Siêu Nhanh ~ Máy Chủ Ổn Định ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥 ~ Xem Live 30 Phút",
            "pricePerUnit": 96,
            "costPerUnit": 96,
            "pricesByTier": [
              96,
              94.5,
              93,
              91.5
            ],
            "min": 50,
            "max": 500,
            "tags": [
              "Lên Siêu Nhanh",
              "Máy Chủ Ổn Định",
              "Tài Nguyên Việt Nam",
              "Xem Live 30 Phút"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47068",
            "code": "47068",
            "apiServiceId": null,
            "index": 3,
            "name": "Tăng Mắt Xem Live",
            "fullName": "Tăng Mắt Xem Live ~ Lên Siêu Nhanh ~ Máy Chủ Ổn Định ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥 ~ Xem Live 60 Phút",
            "pricePerUnit": 192,
            "costPerUnit": 192,
            "pricesByTier": [
              192,
              189,
              186,
              183
            ],
            "min": 50,
            "max": 500,
            "tags": [
              "Lên Siêu Nhanh",
              "Máy Chủ Ổn Định",
              "Tài Nguyên Việt Nam",
              "Xem Live 60 Phút"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47069",
            "code": "47069",
            "apiServiceId": null,
            "index": 4,
            "name": "Tăng Mắt Xem Live",
            "fullName": "Tăng Mắt Xem Live ~ Lên Siêu Nhanh ~ Máy Chủ Ổn Định ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥 ~ Xem Live 90 Phút",
            "pricePerUnit": 288,
            "costPerUnit": 288,
            "pricesByTier": [
              288,
              283.5,
              279,
              74
            ],
            "min": 50,
            "max": 500,
            "tags": [
              "Lên Siêu Nhanh",
              "Máy Chủ Ổn Định",
              "Tài Nguyên Việt Nam",
              "Xem Live 90 Phút"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47070",
            "code": "47070",
            "apiServiceId": null,
            "index": 5,
            "name": "Tăng Mắt Xem Live",
            "fullName": "Tăng Mắt Xem Live ~ Lên Siêu Nhanh ~ Máy Chủ Ổn Định ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥 ~ Xem Live 120 Phút",
            "pricePerUnit": 384,
            "costPerUnit": 384,
            "pricesByTier": [
              384,
              378,
              372,
              366
            ],
            "min": 50,
            "max": 500,
            "tags": [
              "Lên Siêu Nhanh",
              "Máy Chủ Ổn Định",
              "Tài Nguyên Việt Nam",
              "Xem Live 120 Phút"
            ],
            "available": true,
            "source": "clone"
          },
          {
            "id": "srv-47071",
            "code": "47071",
            "apiServiceId": null,
            "index": 6,
            "name": "Tăng Mắt Xem Live",
            "fullName": "Tăng Mắt Xem Live ~ Lên Siêu Nhanh ~ Máy Chủ Ổn Định ~ Tài Nguyên Việt Nam 🇻🇳 🔥🔥🔥 ~ Xem Live 180 Phút",
            "pricePerUnit": 576,
            "costPerUnit": 576,
            "pricesByTier": [
              576,
              567,
              558,
              549
            ],
            "min": 50,
            "max": 500,
            "tags": [
              "Lên Siêu Nhanh",
              "Máy Chủ Ổn Định",
              "Tài Nguyên Việt Nam",
              "Xem Live 180 Phút"
            ],
            "available": true,
            "source": "clone"
          }
        ]
      },
      {
        "id": "tiktok-tang-luot-luu-video",
        "name": "Tăng Lượt Lưu Video",
        "slug": "tang-luot-luu-video",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47072",
            "code": "47072",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Lưu Video",
            "fullName": "Máy chủ 1 — Tăng Lượt Lưu Video",
            "pricePerUnit": 21.08,
            "costPerUnit": 21.08,
            "pricesByTier": [
              21.08,
              20.803,
              20.515,
              19.635
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-tang-chia-se-video",
        "name": "Tăng Chia Sẻ Video",
        "slug": "tang-chia-se-video",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47073",
            "code": "47073",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Chia Sẻ Video",
            "fullName": "Máy chủ 1 — Tăng Chia Sẻ Video",
            "pricePerUnit": 58.21,
            "costPerUnit": 58.21,
            "pricesByTier": [
              58.21,
              57.444,
              56.651,
              54.218
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-tang-binh-luan-video",
        "name": "Tăng Bình Luận Video",
        "slug": "tang-binh-luan-video",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47074",
            "code": "47074",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Bình Luận Video",
            "fullName": "Máy chủ 1 — Tăng Bình Luận Video",
            "pricePerUnit": 28.82,
            "costPerUnit": 28.82,
            "pricesByTier": [
              28.82,
              28.441,
              28.048,
              26.844
            ],
            "min": 100,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-seeding-livestream",
        "name": "Seeding Livestream",
        "slug": "seeding-livestream",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47075",
            "code": "47075",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Seeding Livestream",
            "fullName": "Máy chủ 1 — Seeding Livestream",
            "pricePerUnit": 17.18,
            "costPerUnit": 17.18,
            "pricesByTier": [
              17.18,
              16.954,
              16.72,
              16.002
            ],
            "min": 100,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-mua-goi-tim-thang",
        "name": "Mua Gói Tim Tháng",
        "slug": "mua-goi-tim-thang",
        "platformId": "tiktok",
        "servers": [
          {
            "id": "srv-47076",
            "code": "47076",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Mua Gói Tim Tháng",
            "fullName": "Máy chủ 1 — Mua Gói Tim Tháng",
            "pricePerUnit": 67.14,
            "costPerUnit": 67.14,
            "pricesByTier": [
              67.14,
              66.256,
              65.341,
              62.536
            ],
            "min": 200,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "instagram-global",
    "name": "Instagram Global",
    "slug": "instagram-global",
    "region": "global",
    "assetKey": "platform.instagram-global",
    "services": [
      {
        "id": "instagram-global-instagram-likes",
        "name": "Instagram Likes",
        "slug": "instagram-likes",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47001",
            "code": "47001",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Likes",
            "fullName": "Máy chủ 1 — Instagram Likes",
            "pricePerUnit": 29.13,
            "costPerUnit": 29.13,
            "pricesByTier": [
              29.13,
              28.747,
              28.35,
              27.133
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-followers",
        "name": "Instagram Followers",
        "slug": "instagram-followers",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47002",
            "code": "47002",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Followers",
            "fullName": "Máy chủ 1 — Instagram Followers",
            "pricePerUnit": 61.49,
            "costPerUnit": 61.49,
            "pricesByTier": [
              61.49,
              60.681,
              59.843,
              57.274
            ],
            "min": 100,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-video-views",
        "name": "Instagram Video Views",
        "slug": "instagram-video-views",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47003",
            "code": "47003",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Video Views",
            "fullName": "Máy chủ 1 — Instagram Video Views",
            "pricePerUnit": 23.91,
            "costPerUnit": 23.91,
            "pricesByTier": [
              23.91,
              23.595,
              23.27,
              22.27
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-story-views",
        "name": "Instagram Story Views",
        "slug": "instagram-story-views",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47004",
            "code": "47004",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Story Views",
            "fullName": "Máy chủ 1 — Instagram Story Views",
            "pricePerUnit": 37.47,
            "costPerUnit": 37.47,
            "pricesByTier": [
              37.47,
              36.977,
              36.466,
              34.901
            ],
            "min": 500,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-comments",
        "name": "Instagram Comments",
        "slug": "instagram-comments",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47005",
            "code": "47005",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Comments",
            "fullName": "Máy chủ 1 — Instagram Comments",
            "pricePerUnit": 50.34,
            "costPerUnit": 50.34,
            "pricesByTier": [
              50.34,
              49.677,
              48.992,
              46.888
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-save",
        "name": "Instagram Save",
        "slug": "instagram-save",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47006",
            "code": "47006",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Save",
            "fullName": "Máy chủ 1 — Instagram Save",
            "pricePerUnit": 21.61,
            "costPerUnit": 21.61,
            "pricesByTier": [
              21.61,
              21.326,
              21.031,
              20.128
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-live-stream-views",
        "name": "Instagram Live Stream Views",
        "slug": "instagram-live-stream-views",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47007",
            "code": "47007",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Live Stream Views",
            "fullName": "Máy chủ 1 — Instagram Live Stream Views",
            "pricePerUnit": 40.28,
            "costPerUnit": 40.28,
            "pricesByTier": [
              40.28,
              39.75,
              39.201,
              37.518
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-global-instagram-channel-member-targeted",
        "name": "Instagram Channel Member [ Targeted ]",
        "slug": "instagram-channel-member-targeted",
        "platformId": "instagram-global",
        "servers": [
          {
            "id": "srv-47008",
            "code": "47008",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Instagram Channel Member [ Targeted ]",
            "fullName": "Máy chủ 1 — Instagram Channel Member [ Targeted ]",
            "pricePerUnit": 26.84,
            "costPerUnit": 26.84,
            "pricesByTier": [
              26.84,
              26.487,
              26.121,
              25
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "whatsapp-global",
    "name": "Whatsapp Global",
    "slug": "whatsapp-global",
    "region": "global",
    "assetKey": "platform.whatsapp-global",
    "services": [
      {
        "id": "whatsapp-global-whatsapp-channel-members-cheapest",
        "name": "WhatsApp Channel Members [ Cheapest ]",
        "slug": "whatsapp-channel-members-cheapest",
        "platformId": "whatsapp-global",
        "servers": [
          {
            "id": "srv-47009",
            "code": "47009",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — WhatsApp Channel Members [ Cheapest ]",
            "fullName": "Máy chủ 1 — WhatsApp Channel Members [ Cheapest ]",
            "pricePerUnit": 62.38,
            "costPerUnit": 62.38,
            "pricesByTier": [
              62.38,
              61.559,
              60.709,
              58.103
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "whatsapp-global-whatsapp-channel-emoji-reactions-cheapest",
        "name": "WhatsApp Channel Emoji Reactions [ Cheapest ]",
        "slug": "whatsapp-channel-emoji-reactions-cheapest",
        "platformId": "whatsapp-global",
        "servers": [
          {
            "id": "srv-47010",
            "code": "47010",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — WhatsApp Channel Emoji Reactions [ Cheapest ]",
            "fullName": "Máy chủ 1 — WhatsApp Channel Emoji Reactions [ Cheapest ]",
            "pricePerUnit": 42.13,
            "costPerUnit": 42.13,
            "pricesByTier": [
              42.13,
              41.575,
              41.001,
              39.241
            ],
            "min": 100,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo",
            "supportsReaction": true
          }
        ]
      },
      {
        "id": "whatsapp-global-whatsapp-channel-emoji-reactions",
        "name": "Whatsapp Channel Emoji Reactions",
        "slug": "whatsapp-channel-emoji-reactions",
        "platformId": "whatsapp-global",
        "servers": [
          {
            "id": "srv-47011",
            "code": "47011",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Whatsapp Channel Emoji Reactions",
            "fullName": "Máy chủ 1 — Whatsapp Channel Emoji Reactions",
            "pricePerUnit": 68.06,
            "costPerUnit": 68.06,
            "pricesByTier": [
              68.06,
              67.164,
              66.237,
              63.393
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo",
            "supportsReaction": true
          }
        ]
      }
    ]
  },
  {
    "id": "twitter-global",
    "name": "Twitter Global",
    "slug": "twitter-global",
    "region": "global",
    "assetKey": "platform.twitter-global",
    "services": [
      {
        "id": "twitter-global-x-twitter-vietnam-services",
        "name": "X - Twitter VIETNAM Services 🇻🇳",
        "slug": "x-twitter-vietnam-services",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47012",
            "code": "47012",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — X - Twitter VIETNAM Services 🇻🇳",
            "fullName": "Máy chủ 1 — X - Twitter VIETNAM Services 🇻🇳",
            "pricePerUnit": 61.69,
            "costPerUnit": 61.69,
            "pricesByTier": [
              61.69,
              60.878,
              60.037,
              57.46
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-impressions",
        "name": "Twitter Impressions",
        "slug": "twitter-impressions",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47013",
            "code": "47013",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Impressions",
            "fullName": "Máy chủ 1 — Twitter Impressions",
            "pricePerUnit": 32.31,
            "costPerUnit": 32.31,
            "pricesByTier": [
              32.31,
              31.885,
              31.445,
              30.094
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-followers",
        "name": "Twitter Followers",
        "slug": "twitter-followers",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47014",
            "code": "47014",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Followers",
            "fullName": "Máy chủ 1 — Twitter Followers",
            "pricePerUnit": 60.83,
            "costPerUnit": 60.83,
            "pricesByTier": [
              60.83,
              60.029,
              59.201,
              56.659
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-likes",
        "name": "Twitter Likes ♻️",
        "slug": "twitter-likes",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47015",
            "code": "47015",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Likes ♻️",
            "fullName": "Máy chủ 1 — Twitter Likes ♻️",
            "pricePerUnit": 14.22,
            "costPerUnit": 14.22,
            "pricesByTier": [
              14.22,
              14.033,
              13.839,
              13.245
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-retweet",
        "name": "Twitter Retweet ♻️",
        "slug": "twitter-retweet",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47016",
            "code": "47016",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Retweet ♻️",
            "fullName": "Máy chủ 1 — Twitter Retweet ♻️",
            "pricePerUnit": 28.23,
            "costPerUnit": 28.23,
            "pricesByTier": [
              28.23,
              27.858,
              27.474,
              26.294
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-views",
        "name": "Twitter Views",
        "slug": "twitter-views",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47017",
            "code": "47017",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Views",
            "fullName": "Máy chủ 1 — Twitter Views",
            "pricePerUnit": 17.25,
            "costPerUnit": 17.25,
            "pricesByTier": [
              17.25,
              17.023,
              16.788,
              16.067
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-global-twitter-space-listeners",
        "name": "Twitter Space Listeners",
        "slug": "twitter-space-listeners",
        "platformId": "twitter-global",
        "servers": [
          {
            "id": "srv-47018",
            "code": "47018",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Twitter Space Listeners",
            "fullName": "Máy chủ 1 — Twitter Space Listeners",
            "pricePerUnit": 48.91,
            "costPerUnit": 48.91,
            "pricesByTier": [
              48.91,
              48.266,
              47.6,
              45.556
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "youtube",
    "name": "Youtube",
    "slug": "youtube",
    "region": "vn",
    "assetKey": "platform.youtube",
    "services": [
      {
        "id": "youtube-tang-view-video",
        "name": "Tăng View Video",
        "slug": "tang-view-video",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47019",
            "code": "47019",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng View Video",
            "fullName": "Máy chủ 1 — Tăng View Video",
            "pricePerUnit": 21.13,
            "costPerUnit": 21.13,
            "pricesByTier": [
              21.13,
              20.852,
              20.564,
              19.681
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-dang-ky-kenh",
        "name": "Tăng Đăng Ký Kênh",
        "slug": "tang-dang-ky-kenh",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47020",
            "code": "47020",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Đăng Ký Kênh",
            "fullName": "Máy chủ 1 — Tăng Đăng Ký Kênh",
            "pricePerUnit": 44.61,
            "costPerUnit": 44.61,
            "pricesByTier": [
              44.61,
              44.023,
              43.415,
              41.551
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-binh-luan-video",
        "name": "Tăng Bình Luận Video",
        "slug": "tang-binh-luan-video",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47021",
            "code": "47021",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Bình Luận Video",
            "fullName": "Máy chủ 1 — Tăng Bình Luận Video",
            "pricePerUnit": 30.75,
            "costPerUnit": 30.75,
            "pricesByTier": [
              30.75,
              30.345,
              29.926,
              28.641
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-chia-se-video",
        "name": "Tăng Chia Sẻ Video",
        "slug": "tang-chia-se-video",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47022",
            "code": "47022",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Chia Sẻ Video",
            "fullName": "Máy chủ 1 — Tăng Chia Sẻ Video",
            "pricePerUnit": 30.79,
            "costPerUnit": 30.79,
            "pricesByTier": [
              30.79,
              30.385,
              29.965,
              28.679
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-luot-like-video",
        "name": "Tăng Lượt Like Video",
        "slug": "tang-luot-like-video",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47023",
            "code": "47023",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Like Video",
            "fullName": "Máy chủ 1 — Tăng Lượt Like Video",
            "pricePerUnit": 59.48,
            "costPerUnit": 59.48,
            "pricesByTier": [
              59.48,
              58.697,
              57.887,
              55.401
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-mat-livestream",
        "name": "Tăng Mắt Livestream",
        "slug": "tang-mat-livestream",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47024",
            "code": "47024",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Mắt Livestream",
            "fullName": "Máy chủ 1 — Tăng Mắt Livestream",
            "pricePerUnit": 49.71,
            "costPerUnit": 49.71,
            "pricesByTier": [
              49.71,
              49.056,
              48.378,
              46.301
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-tang-4000h-xem",
        "name": "Tăng 4000H Xem",
        "slug": "tang-4000h-xem",
        "platformId": "youtube",
        "servers": [
          {
            "id": "srv-47025",
            "code": "47025",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng 4000H Xem",
            "fullName": "Máy chủ 1 — Tăng 4000H Xem",
            "pricePerUnit": 22.05,
            "costPerUnit": 22.05,
            "pricesByTier": [
              22.05,
              21.76,
              21.459,
              20.538
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "threads-global",
    "name": "Threads Global",
    "slug": "threads-global",
    "region": "global",
    "assetKey": "platform.threads-global",
    "services": [
      {
        "id": "threads-global-threads-followers",
        "name": "Threads Followers",
        "slug": "threads-followers",
        "platformId": "threads-global",
        "servers": [
          {
            "id": "srv-47026",
            "code": "47026",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Threads Followers",
            "fullName": "Máy chủ 1 — Threads Followers",
            "pricePerUnit": 73.82,
            "costPerUnit": 73.82,
            "pricesByTier": [
              73.82,
              72.848,
              71.843,
              68.758
            ],
            "min": 100,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "threads-global-threads-likes",
        "name": "Threads Likes",
        "slug": "threads-likes",
        "platformId": "threads-global",
        "servers": [
          {
            "id": "srv-47027",
            "code": "47027",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Threads Likes",
            "fullName": "Máy chủ 1 — Threads Likes",
            "pricePerUnit": 27.57,
            "costPerUnit": 27.57,
            "pricesByTier": [
              27.57,
              27.207,
              26.831,
              25.679
            ],
            "min": 50,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "threads-global-threads-reshare",
        "name": "Threads Reshare",
        "slug": "threads-reshare",
        "platformId": "threads-global",
        "servers": [
          {
            "id": "srv-47028",
            "code": "47028",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Threads Reshare",
            "fullName": "Máy chủ 1 — Threads Reshare",
            "pricePerUnit": 9.73,
            "costPerUnit": 9.73,
            "pricesByTier": [
              9.73,
              9.602,
              9.469,
              9.063
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "threads-global-threads-comments",
        "name": "Threads Comments",
        "slug": "threads-comments",
        "platformId": "threads-global",
        "servers": [
          {
            "id": "srv-47029",
            "code": "47029",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Threads Comments",
            "fullName": "Máy chủ 1 — Threads Comments",
            "pricePerUnit": 16.6,
            "costPerUnit": 16.6,
            "pricesByTier": [
              16.6,
              16.381,
              16.155,
              15.462
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "soundcloud-global",
    "name": "Soundcloud Global",
    "slug": "soundcloud-global",
    "region": "global",
    "assetKey": "platform.soundcloud-global",
    "services": [
      {
        "id": "soundcloud-global-soundcloud",
        "name": "SoundCloud",
        "slug": "soundcloud",
        "platformId": "soundcloud-global",
        "servers": [
          {
            "id": "srv-47030",
            "code": "47030",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — SoundCloud",
            "fullName": "Máy chủ 1 — SoundCloud",
            "pricePerUnit": 56.47,
            "costPerUnit": 56.47,
            "pricesByTier": [
              56.47,
              55.727,
              54.957,
              52.598
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "reddit-global",
    "name": "Reddit Global",
    "slug": "reddit-global",
    "region": "global",
    "assetKey": "platform.reddit-global",
    "services": [
      {
        "id": "reddit-global-reddit-services-own",
        "name": "Reddit Services [ OWN ]",
        "slug": "reddit-services-own",
        "platformId": "reddit-global",
        "servers": [
          {
            "id": "srv-47031",
            "code": "47031",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Reddit Services [ OWN ]",
            "fullName": "Máy chủ 1 — Reddit Services [ OWN ]",
            "pricePerUnit": 38.89,
            "costPerUnit": 38.89,
            "pricesByTier": [
              38.89,
              38.378,
              37.848,
              36.223
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "reddit-global-reddit",
        "name": "Reddit",
        "slug": "reddit",
        "platformId": "reddit-global",
        "servers": [
          {
            "id": "srv-47032",
            "code": "47032",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Reddit",
            "fullName": "Máy chủ 1 — Reddit",
            "pricePerUnit": 68.76,
            "costPerUnit": 68.76,
            "pricesByTier": [
              68.76,
              67.855,
              66.918,
              64.045
            ],
            "min": 200,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "lazada-global",
    "name": "Lazada Global",
    "slug": "lazada-global",
    "region": "global",
    "assetKey": "platform.lazada-global",
    "services": [
      {
        "id": "lazada-global-lazada",
        "name": "Lazada",
        "slug": "lazada",
        "platformId": "lazada-global",
        "servers": [
          {
            "id": "srv-47033",
            "code": "47033",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Lazada",
            "fullName": "Máy chủ 1 — Lazada",
            "pricePerUnit": 52.28,
            "costPerUnit": 52.28,
            "pricesByTier": [
              52.28,
              51.592,
              50.88,
              48.695
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "spotify-global",
    "name": "Spotify Global",
    "slug": "spotify-global",
    "region": "global",
    "assetKey": "platform.spotify-global",
    "services": [
      {
        "id": "spotify-global-spotify-followers",
        "name": "Spotify Followers",
        "slug": "spotify-followers",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47034",
            "code": "47034",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Followers",
            "fullName": "Máy chủ 1 — Spotify Followers",
            "pricePerUnit": 51.49,
            "costPerUnit": 51.49,
            "pricesByTier": [
              51.49,
              50.812,
              50.111,
              47.959
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-plays",
        "name": "Spotify Plays",
        "slug": "spotify-plays",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47035",
            "code": "47035",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Plays",
            "fullName": "Máy chủ 1 — Spotify Plays",
            "pricePerUnit": 68.72,
            "costPerUnit": 68.72,
            "pricesByTier": [
              68.72,
              67.815,
              66.879,
              64.008
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-saves",
        "name": "Spotify Saves",
        "slug": "spotify-saves",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47036",
            "code": "47036",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Saves",
            "fullName": "Máy chủ 1 — Spotify Saves",
            "pricePerUnit": 73.68,
            "costPerUnit": 73.68,
            "pricesByTier": [
              73.68,
              72.71,
              71.706,
              68.628
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-podcast-plays",
        "name": "Spotify Podcast Plays",
        "slug": "spotify-podcast-plays",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47037",
            "code": "47037",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Podcast Plays",
            "fullName": "Máy chủ 1 — Spotify Podcast Plays",
            "pricePerUnit": 10.01,
            "costPerUnit": 10.01,
            "pricesByTier": [
              10.01,
              9.878,
              9.742,
              9.324
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-search-plays",
        "name": "Spotify Search Plays",
        "slug": "spotify-search-plays",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47038",
            "code": "47038",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Search Plays",
            "fullName": "Máy chủ 1 — Spotify Search Plays",
            "pricePerUnit": 70.15,
            "costPerUnit": 70.15,
            "pricesByTier": [
              70.15,
              69.227,
              68.271,
              65.34
            ],
            "min": 50,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-monthly-listeners",
        "name": "Spotify Monthly Listeners",
        "slug": "spotify-monthly-listeners",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47039",
            "code": "47039",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Monthly Listeners",
            "fullName": "Máy chủ 1 — Spotify Monthly Listeners",
            "pricePerUnit": 55.31,
            "costPerUnit": 55.31,
            "pricesByTier": [
              55.31,
              54.582,
              53.828,
              51.517
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-followers-targeted",
        "name": "Spotify Followers [ Targeted ]",
        "slug": "spotify-followers-targeted",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47040",
            "code": "47040",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Followers [ Targeted ]",
            "fullName": "Máy chủ 1 — Spotify Followers [ Targeted ]",
            "pricePerUnit": 13.38,
            "costPerUnit": 13.38,
            "pricesByTier": [
              13.38,
              13.204,
              13.022,
              12.463
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-global-spotify-track-plays-targeted",
        "name": "Spotify Track Plays [ Targeted ]",
        "slug": "spotify-track-plays-targeted",
        "platformId": "spotify-global",
        "servers": [
          {
            "id": "srv-47041",
            "code": "47041",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Spotify Track Plays [ Targeted ]",
            "fullName": "Máy chủ 1 — Spotify Track Plays [ Targeted ]",
            "pricePerUnit": 36.26,
            "costPerUnit": 36.26,
            "pricesByTier": [
              36.26,
              35.783,
              35.289,
              33.774
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "telegram-global",
    "name": "Telegram Global",
    "slug": "telegram-global",
    "region": "global",
    "assetKey": "platform.telegram-global",
    "services": [
      {
        "id": "telegram-global-telegram-members",
        "name": "Telegram Members",
        "slug": "telegram-members",
        "platformId": "telegram-global",
        "servers": [
          {
            "id": "srv-47042",
            "code": "47042",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Telegram Members",
            "fullName": "Máy chủ 1 — Telegram Members",
            "pricePerUnit": 70.65,
            "costPerUnit": 70.65,
            "pricesByTier": [
              70.65,
              69.72,
              68.757,
              65.805
            ],
            "min": 200,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "telegram-global-telegram-post-view",
        "name": "Telegram Post View",
        "slug": "telegram-post-view",
        "platformId": "telegram-global",
        "servers": [
          {
            "id": "srv-47043",
            "code": "47043",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Telegram Post View",
            "fullName": "Máy chủ 1 — Telegram Post View",
            "pricePerUnit": 56.76,
            "costPerUnit": 56.76,
            "pricesByTier": [
              56.76,
              56.013,
              55.24,
              52.868
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "telegram-global-telegram-votes-story-views",
        "name": "Telegram Votes [ Story Views ]",
        "slug": "telegram-votes-story-views",
        "platformId": "telegram-global",
        "servers": [
          {
            "id": "srv-47044",
            "code": "47044",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Telegram Votes [ Story Views ]",
            "fullName": "Máy chủ 1 — Telegram Votes [ Story Views ]",
            "pricePerUnit": 59.89,
            "costPerUnit": 59.89,
            "pricesByTier": [
              59.89,
              59.102,
              58.286,
              55.783
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "telegram-global-telegram-reaction",
        "name": "Telegram Reaction",
        "slug": "telegram-reaction",
        "platformId": "telegram-global",
        "servers": [
          {
            "id": "srv-47045",
            "code": "47045",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Telegram Reaction",
            "fullName": "Máy chủ 1 — Telegram Reaction",
            "pricePerUnit": 15.69,
            "costPerUnit": 15.69,
            "pricesByTier": [
              15.69,
              15.483,
              15.27,
              14.614
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo",
            "supportsReaction": true
          }
        ]
      },
      {
        "id": "telegram-global-tu-dong-tang-view-post",
        "name": "Tự Động Tăng View Post",
        "slug": "tu-dong-tang-view-post",
        "platformId": "telegram-global",
        "servers": [
          {
            "id": "srv-47046",
            "code": "47046",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tự Động Tăng View Post",
            "fullName": "Máy chủ 1 — Tự Động Tăng View Post",
            "pricePerUnit": 43.08,
            "costPerUnit": 43.08,
            "pricesByTier": [
              43.08,
              42.513,
              41.926,
              40.126
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "facebook-global",
    "name": "Facebook Global",
    "slug": "facebook-global",
    "region": "global",
    "assetKey": "platform.facebook-global",
    "services": [
      {
        "id": "facebook-global-facebook-views",
        "name": "Facebook Views",
        "slug": "facebook-views",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47077",
            "code": "47077",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Views",
            "fullName": "Máy chủ 1 — Facebook Views",
            "pricePerUnit": 59.23,
            "costPerUnit": 59.23,
            "pricesByTier": [
              59.23,
              58.45,
              57.643,
              55.169
            ],
            "min": 1000,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-post-reaction",
        "name": "Facebook Post Reaction ᴺᴱᵂ",
        "slug": "facebook-post-reaction",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47078",
            "code": "47078",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Post Reaction ᴺᴱᵂ",
            "fullName": "Máy chủ 1 — Facebook Post Reaction ᴺᴱᵂ",
            "pricePerUnit": 16.34,
            "costPerUnit": 16.34,
            "pricesByTier": [
              16.34,
              16.125,
              15.902,
              15.22
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo",
            "supportsReaction": true
          }
        ]
      },
      {
        "id": "facebook-global-facebook-page-followers",
        "name": "Facebook Page Followers",
        "slug": "facebook-page-followers",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47079",
            "code": "47079",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Page Followers",
            "fullName": "Máy chủ 1 — Facebook Page Followers",
            "pricePerUnit": 73.01,
            "costPerUnit": 73.01,
            "pricesByTier": [
              73.01,
              72.049,
              71.054,
              68.004
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-profile-followers",
        "name": "Facebook Profile Followers",
        "slug": "facebook-profile-followers",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47080",
            "code": "47080",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Profile Followers",
            "fullName": "Máy chủ 1 — Facebook Profile Followers",
            "pricePerUnit": 33.52,
            "costPerUnit": 33.52,
            "pricesByTier": [
              33.52,
              33.079,
              32.622,
              31.221
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-page-likes",
        "name": "Facebook Page Likes",
        "slug": "facebook-page-likes",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47081",
            "code": "47081",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Page Likes",
            "fullName": "Máy chủ 1 — Facebook Page Likes",
            "pricePerUnit": 73.79,
            "costPerUnit": 73.79,
            "pricesByTier": [
              73.79,
              72.819,
              71.813,
              68.73
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-group-member",
        "name": "Facebook Group Member",
        "slug": "facebook-group-member",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47082",
            "code": "47082",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Group Member",
            "fullName": "Máy chủ 1 — Facebook Group Member",
            "pricePerUnit": 45.24,
            "costPerUnit": 45.24,
            "pricesByTier": [
              45.24,
              44.645,
              44.028,
              42.138
            ],
            "min": 1000,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-post-shares",
        "name": "Facebook Post Shares",
        "slug": "facebook-post-shares",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47083",
            "code": "47083",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Post Shares",
            "fullName": "Máy chủ 1 — Facebook Post Shares",
            "pricePerUnit": 38.44,
            "costPerUnit": 38.44,
            "pricesByTier": [
              38.44,
              37.934,
              37.41,
              35.804
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-comments",
        "name": "Facebook Comments",
        "slug": "facebook-comments",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47084",
            "code": "47084",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Comments",
            "fullName": "Máy chủ 1 — Facebook Comments",
            "pricePerUnit": 29.76,
            "costPerUnit": 29.76,
            "pricesByTier": [
              29.76,
              29.368,
              28.963,
              27.719
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-page-review",
        "name": "Facebook Page Review",
        "slug": "facebook-page-review",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47085",
            "code": "47085",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Page Review",
            "fullName": "Máy chủ 1 — Facebook Page Review",
            "pricePerUnit": 45.78,
            "costPerUnit": 45.78,
            "pricesByTier": [
              45.78,
              45.177,
              44.554,
              42.641
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-global-facebook-story",
        "name": "Facebook Story",
        "slug": "facebook-story",
        "platformId": "facebook-global",
        "servers": [
          {
            "id": "srv-47086",
            "code": "47086",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Facebook Story",
            "fullName": "Máy chủ 1 — Facebook Story",
            "pricePerUnit": 11.35,
            "costPerUnit": 11.35,
            "pricesByTier": [
              11.35,
              11.201,
              11.046,
              10.572
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "facebook",
    "name": "Facebook",
    "slug": "facebook",
    "region": "vn",
    "assetKey": "platform.facebook",
    "services": [
      {
        "id": "facebook-tang-like-bai-viet",
        "name": "Tăng Like Bài Viết",
        "slug": "tang-like-bai-viet",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47087",
            "code": "47087",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Like Bài Viết",
            "fullName": "Máy chủ 1 — Tăng Like Bài Viết",
            "pricePerUnit": 43.35,
            "costPerUnit": 43.35,
            "pricesByTier": [
              43.35,
              42.779,
              42.189,
              40.377
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-mua-goi-like-thang",
        "name": "Mua Gói Like Tháng",
        "slug": "mua-goi-like-thang",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47088",
            "code": "47088",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Mua Gói Like Tháng",
            "fullName": "Máy chủ 1 — Mua Gói Like Tháng",
            "pricePerUnit": 44.77,
            "costPerUnit": 44.77,
            "pricesByTier": [
              44.77,
              44.181,
              43.571,
              41.7
            ],
            "min": 100,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-nguoi-theo-doi",
        "name": "Tăng Người Theo Dõi",
        "slug": "tang-nguoi-theo-doi",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47089",
            "code": "47089",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Theo Dõi",
            "fullName": "Máy chủ 1 — Tăng Người Theo Dõi",
            "pricePerUnit": 74.4,
            "costPerUnit": 74.4,
            "pricesByTier": [
              74.4,
              73.421,
              72.407,
              69.298
            ],
            "min": 1000,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-like-fanpage",
        "name": "Tăng Like Fanpage",
        "slug": "tang-like-fanpage",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47090",
            "code": "47090",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Like Fanpage",
            "fullName": "Máy chủ 1 — Tăng Like Fanpage",
            "pricePerUnit": 54.09,
            "costPerUnit": 54.09,
            "pricesByTier": [
              54.09,
              53.378,
              52.641,
              50.381
            ],
            "min": 500,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-mat-livestream",
        "name": "Tăng Mắt Livestream",
        "slug": "tang-mat-livestream",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47091",
            "code": "47091",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Mắt Livestream",
            "fullName": "Máy chủ 1 — Tăng Mắt Livestream",
            "pricePerUnit": 59.19,
            "costPerUnit": 59.19,
            "pricesByTier": [
              59.19,
              58.411,
              57.604,
              55.131
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-luot-chia-se",
        "name": "Tăng Lượt Chia Sẻ",
        "slug": "tang-luot-chia-se",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47092",
            "code": "47092",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Chia Sẻ",
            "fullName": "Máy chủ 1 — Tăng Lượt Chia Sẻ",
            "pricePerUnit": 63.29,
            "costPerUnit": 63.29,
            "pricesByTier": [
              63.29,
              62.457,
              61.595,
              58.95
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-member-nhom",
        "name": "Tăng Member Nhóm",
        "slug": "tang-member-nhom",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47093",
            "code": "47093",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Member Nhóm",
            "fullName": "Máy chủ 1 — Tăng Member Nhóm",
            "pricePerUnit": 39.63,
            "costPerUnit": 39.63,
            "pricesByTier": [
              39.63,
              39.108,
              38.568,
              36.913
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-danh-gia-page",
        "name": "Tăng Đánh Giá Page",
        "slug": "tang-danh-gia-page",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47094",
            "code": "47094",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Đánh Giá Page",
            "fullName": "Máy chủ 1 — Tăng Đánh Giá Page",
            "pricePerUnit": 19.18,
            "costPerUnit": 19.18,
            "pricesByTier": [
              19.18,
              18.928,
              18.666,
              17.865
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-like-binh-luan",
        "name": "Tăng Like Bình Luận",
        "slug": "tang-like-binh-luan",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47095",
            "code": "47095",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Like Bình Luận",
            "fullName": "Máy chủ 1 — Tăng Like Bình Luận",
            "pricePerUnit": 34.96,
            "costPerUnit": 34.96,
            "pricesByTier": [
              34.96,
              34.5,
              34.024,
              32.563
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-view-video-reel",
        "name": "Tăng View Video/Reel",
        "slug": "tang-view-video-reel",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47096",
            "code": "47096",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng View Video/Reel",
            "fullName": "Máy chủ 1 — Tăng View Video/Reel",
            "pricePerUnit": 36.31,
            "costPerUnit": 36.31,
            "pricesByTier": [
              36.31,
              35.832,
              35.337,
              33.82
            ],
            "min": 500,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-binh-luan",
        "name": "Tăng Bình Luận",
        "slug": "tang-binh-luan",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47097",
            "code": "47097",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Bình Luận",
            "fullName": "Máy chủ 1 — Tăng Bình Luận",
            "pricePerUnit": 64.13,
            "costPerUnit": 64.13,
            "pricesByTier": [
              64.13,
              63.286,
              62.412,
              59.733
            ],
            "min": 1000,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-view-story",
        "name": "Tăng View Story",
        "slug": "tang-view-story",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47098",
            "code": "47098",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng View Story",
            "fullName": "Máy chủ 1 — Tăng View Story",
            "pricePerUnit": 15.06,
            "costPerUnit": 15.06,
            "pricesByTier": [
              15.06,
              14.862,
              14.657,
              14.027
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "facebook-tang-view-bat-kiem-tien",
        "name": "Tăng View Bật Kiếm Tiền",
        "slug": "tang-view-bat-kiem-tien",
        "platformId": "facebook",
        "servers": [
          {
            "id": "srv-47099",
            "code": "47099",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng View Bật Kiếm Tiền",
            "fullName": "Máy chủ 1 — Tăng View Bật Kiếm Tiền",
            "pricePerUnit": 24.42,
            "costPerUnit": 24.42,
            "pricesByTier": [
              24.42,
              24.099,
              23.766,
              22.745
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "instagram",
    "name": "Instagram",
    "slug": "instagram",
    "region": "vn",
    "assetKey": "platform.instagram",
    "services": [
      {
        "id": "instagram-tang-tim-bai-viet",
        "name": "Tăng Tim Bài Viết",
        "slug": "tang-tim-bai-viet",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47100",
            "code": "47100",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Tim Bài Viết",
            "fullName": "Máy chủ 1 — Tăng Tim Bài Viết",
            "pricePerUnit": 36.41,
            "costPerUnit": 36.41,
            "pricesByTier": [
              36.41,
              35.931,
              35.435,
              33.913
            ],
            "min": 200,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-tang-nguoi-theo-doi",
        "name": "Tăng Người Theo Dõi",
        "slug": "tang-nguoi-theo-doi",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47101",
            "code": "47101",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Theo Dõi",
            "fullName": "Máy chủ 1 — Tăng Người Theo Dõi",
            "pricePerUnit": 32.23,
            "costPerUnit": 32.23,
            "pricesByTier": [
              32.23,
              31.806,
              31.367,
              30.02
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-tang-binh-luan-bai",
        "name": "Tăng Bình Luận Bài",
        "slug": "tang-binh-luan-bai",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47102",
            "code": "47102",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Bình Luận Bài",
            "fullName": "Máy chủ 1 — Tăng Bình Luận Bài",
            "pricePerUnit": 17.75,
            "costPerUnit": 17.75,
            "pricesByTier": [
              17.75,
              17.516,
              17.275,
              16.533
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-tang-member-kenh",
        "name": "Tăng Member Kênh",
        "slug": "tang-member-kenh",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47103",
            "code": "47103",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Member Kênh",
            "fullName": "Máy chủ 1 — Tăng Member Kênh",
            "pricePerUnit": 44.52,
            "costPerUnit": 44.52,
            "pricesByTier": [
              44.52,
              43.934,
              43.327,
              41.467
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-mua-goi-like-thang",
        "name": "Mua Gói Like Tháng",
        "slug": "mua-goi-like-thang",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47104",
            "code": "47104",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Mua Gói Like Tháng",
            "fullName": "Máy chủ 1 — Mua Gói Like Tháng",
            "pricePerUnit": 24.25,
            "costPerUnit": 24.25,
            "pricesByTier": [
              24.25,
              23.931,
              23.6,
              22.587
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-tang-luot-xem-video",
        "name": "Tăng Lượt Xem Video",
        "slug": "tang-luot-xem-video",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47105",
            "code": "47105",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Xem Video",
            "fullName": "Máy chủ 1 — Tăng Lượt Xem Video",
            "pricePerUnit": 60.91,
            "costPerUnit": 60.91,
            "pricesByTier": [
              60.91,
              60.108,
              59.278,
              56.733
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "instagram-tang-mat-livestream",
        "name": "Tăng Mắt Livestream",
        "slug": "tang-mat-livestream",
        "platformId": "instagram",
        "servers": [
          {
            "id": "srv-47106",
            "code": "47106",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Mắt Livestream",
            "fullName": "Máy chủ 1 — Tăng Mắt Livestream",
            "pricePerUnit": 67.98,
            "costPerUnit": 67.98,
            "pricesByTier": [
              67.98,
              67.085,
              66.159,
              63.319
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "shopee",
    "name": "Shopee",
    "slug": "shopee",
    "region": "vn",
    "assetKey": "platform.shopee",
    "services": [
      {
        "id": "shopee-tang-luot-thich-san-pham",
        "name": "Tăng Lượt Thích Sản Phẩm",
        "slug": "tang-luot-thich-san-pham",
        "platformId": "shopee",
        "servers": [
          {
            "id": "srv-47107",
            "code": "47107",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Thích Sản Phẩm",
            "fullName": "Máy chủ 1 — Tăng Lượt Thích Sản Phẩm",
            "pricePerUnit": 24.1,
            "costPerUnit": 24.1,
            "pricesByTier": [
              24.1,
              23.783,
              23.454,
              22.447
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "shopee-tang-theo-doi-gian-hang",
        "name": "Tăng Theo Dõi Gian Hàng",
        "slug": "tang-theo-doi-gian-hang",
        "platformId": "shopee",
        "servers": [
          {
            "id": "srv-47108",
            "code": "47108",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Theo Dõi Gian Hàng",
            "fullName": "Máy chủ 1 — Tăng Theo Dõi Gian Hàng",
            "pricePerUnit": 11.95,
            "costPerUnit": 11.95,
            "pricesByTier": [
              11.95,
              11.793,
              11.63,
              11.131
            ],
            "min": 100,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "shopee-tang-nguoi-xem-livestream",
        "name": "Tăng Người Xem Livestream",
        "slug": "tang-nguoi-xem-livestream",
        "platformId": "shopee",
        "servers": [
          {
            "id": "srv-47109",
            "code": "47109",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Xem Livestream",
            "fullName": "Máy chủ 1 — Tăng Người Xem Livestream",
            "pricePerUnit": 20.71,
            "costPerUnit": 20.71,
            "pricesByTier": [
              20.71,
              20.437,
              20.155,
              19.29
            ],
            "min": 1000,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "threads",
    "name": "Threads",
    "slug": "threads",
    "region": "vn",
    "assetKey": "platform.threads",
    "services": [
      {
        "id": "threads-tang-like-bai-viet",
        "name": "Tăng Like Bài Viết",
        "slug": "tang-like-bai-viet",
        "platformId": "threads",
        "servers": [
          {
            "id": "srv-47110",
            "code": "47110",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Like Bài Viết",
            "fullName": "Máy chủ 1 — Tăng Like Bài Viết",
            "pricePerUnit": 66.09,
            "costPerUnit": 66.09,
            "pricesByTier": [
              66.09,
              65.22,
              64.32,
              61.558
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "threads-tang-nguoi-theo-doi",
        "name": "Tăng Người Theo Dõi",
        "slug": "tang-nguoi-theo-doi",
        "platformId": "threads",
        "servers": [
          {
            "id": "srv-47111",
            "code": "47111",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Theo Dõi",
            "fullName": "Máy chủ 1 — Tăng Người Theo Dõi",
            "pricePerUnit": 71.61,
            "costPerUnit": 71.61,
            "pricesByTier": [
              71.61,
              70.667,
              69.692,
              66.7
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "threads-tang-binh-luan",
        "name": "Tăng Bình Luận",
        "slug": "tang-binh-luan",
        "platformId": "threads",
        "servers": [
          {
            "id": "srv-47112",
            "code": "47112",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Bình Luận",
            "fullName": "Máy chủ 1 — Tăng Bình Luận",
            "pricePerUnit": 10.91,
            "costPerUnit": 10.91,
            "pricesByTier": [
              10.91,
              10.766,
              10.618,
              10.162
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "slug": "spotify",
    "region": "vn",
    "assetKey": "platform.spotify",
    "services": [
      {
        "id": "spotify-tang-luot-nghe-bai-hat",
        "name": "Tăng Lượt Nghe Bài Hát",
        "slug": "tang-luot-nghe-bai-hat",
        "platformId": "spotify",
        "servers": [
          {
            "id": "srv-47113",
            "code": "47113",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Nghe Bài Hát",
            "fullName": "Máy chủ 1 — Tăng Lượt Nghe Bài Hát",
            "pricePerUnit": 54.18,
            "costPerUnit": 54.18,
            "pricesByTier": [
              54.18,
              53.467,
              52.729,
              50.465
            ],
            "min": 500,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-tang-nguoi-nghe-hang-thang-nghe-si",
        "name": "Tăng Người Nghe Hàng Tháng nghệ Sĩ",
        "slug": "tang-nguoi-nghe-hang-thang-nghe-si",
        "platformId": "spotify",
        "servers": [
          {
            "id": "srv-47114",
            "code": "47114",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Nghe Hàng Tháng nghệ Sĩ",
            "fullName": "Máy chủ 1 — Tăng Người Nghe Hàng Tháng nghệ Sĩ",
            "pricePerUnit": 75.38,
            "costPerUnit": 75.38,
            "pricesByTier": [
              75.38,
              74.388,
              73.361,
              70.211
            ],
            "min": 50,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "spotify-tang-nguoi-theo-doi",
        "name": "Tăng Người Theo Dõi",
        "slug": "tang-nguoi-theo-doi",
        "platformId": "spotify",
        "servers": [
          {
            "id": "srv-47115",
            "code": "47115",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Người Theo Dõi",
            "fullName": "Máy chủ 1 — Tăng Người Theo Dõi",
            "pricePerUnit": 19.44,
            "costPerUnit": 19.44,
            "pricesByTier": [
              19.44,
              19.184,
              18.919,
              18.107
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "website-traffic",
    "name": "Website traffic",
    "slug": "website-traffic",
    "region": "vn",
    "assetKey": "platform.website-traffic",
    "services": [
      {
        "id": "website-traffic-tang-truy-cap-website-nhieu-nguon",
        "name": "Tăng Truy Cập Website Nhiều Nguồn",
        "slug": "tang-truy-cap-website-nhieu-nguon",
        "platformId": "website-traffic",
        "servers": [
          {
            "id": "srv-47116",
            "code": "47116",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Truy Cập Website Nhiều Nguồn",
            "fullName": "Máy chủ 1 — Tăng Truy Cập Website Nhiều Nguồn",
            "pricePerUnit": 29.82,
            "costPerUnit": 29.82,
            "pricesByTier": [
              29.82,
              29.427,
              29.021,
              27.775
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "website-traffic-tang-truy-cap-website-iphone",
        "name": "Tăng Truy Cập Website Iphone",
        "slug": "tang-truy-cap-website-iphone",
        "platformId": "website-traffic",
        "servers": [
          {
            "id": "srv-47117",
            "code": "47117",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Truy Cập Website Iphone",
            "fullName": "Máy chủ 1 — Tăng Truy Cập Website Iphone",
            "pricePerUnit": 9.34,
            "costPerUnit": 9.34,
            "pricesByTier": [
              9.34,
              9.217,
              9.09,
              8.7
            ],
            "min": 50,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "tiktok-global",
    "name": "Tiktok Global",
    "slug": "tiktok-global",
    "region": "global",
    "assetKey": "platform.tiktok-global",
    "services": [
      {
        "id": "tiktok-global-tang-mat-xem-live",
        "name": "Tăng Mắt Xem Live",
        "slug": "tang-mat-xem-live",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47118",
            "code": "47118",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Mắt Xem Live",
            "fullName": "Máy chủ 1 — Tăng Mắt Xem Live",
            "pricePerUnit": 21.83,
            "costPerUnit": 21.83,
            "pricesByTier": [
              21.83,
              21.543,
              21.245,
              20.333
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-followers",
        "name": "TikTok Followers",
        "slug": "tiktok-followers",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47119",
            "code": "47119",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Followers",
            "fullName": "Máy chủ 1 — TikTok Followers",
            "pricePerUnit": 56.67,
            "costPerUnit": 56.67,
            "pricesByTier": [
              56.67,
              55.924,
              55.152,
              52.784
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-likes",
        "name": "TikTok Likes",
        "slug": "tiktok-likes",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47120",
            "code": "47120",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Likes",
            "fullName": "Máy chủ 1 — TikTok Likes",
            "pricePerUnit": 63.78,
            "costPerUnit": 63.78,
            "pricesByTier": [
              63.78,
              62.94,
              62.072,
              59.407
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-pk-battle-points",
        "name": "TikTok PK Battle Points",
        "slug": "tiktok-pk-battle-points",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47121",
            "code": "47121",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok PK Battle Points",
            "fullName": "Máy chủ 1 — TikTok PK Battle Points",
            "pricePerUnit": 12.35,
            "costPerUnit": 12.35,
            "pricesByTier": [
              12.35,
              12.187,
              12.019,
              11.503
            ],
            "min": 200,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-video-views",
        "name": "TikTok Video Views",
        "slug": "tiktok-video-views",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47122",
            "code": "47122",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Video Views",
            "fullName": "Máy chủ 1 — TikTok Video Views",
            "pricePerUnit": 55.83,
            "costPerUnit": 55.83,
            "pricesByTier": [
              55.83,
              55.095,
              54.334,
              52.002
            ],
            "min": 1000,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-video-save",
        "name": "TikTok Video Save",
        "slug": "tiktok-video-save",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47123",
            "code": "47123",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Video Save",
            "fullName": "Máy chủ 1 — TikTok Video Save",
            "pricePerUnit": 19.75,
            "costPerUnit": 19.75,
            "pricesByTier": [
              19.75,
              19.49,
              19.221,
              18.396
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-video-share",
        "name": "TikTok Video Share",
        "slug": "tiktok-video-share",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47124",
            "code": "47124",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Video Share",
            "fullName": "Máy chủ 1 — TikTok Video Share",
            "pricePerUnit": 48.32,
            "costPerUnit": 48.32,
            "pricesByTier": [
              48.32,
              47.684,
              47.026,
              45.007
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-story-likes",
        "name": "TikTok Story Likes",
        "slug": "tiktok-story-likes",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47125",
            "code": "47125",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Story Likes",
            "fullName": "Máy chủ 1 — TikTok Story Likes",
            "pricePerUnit": 21.62,
            "costPerUnit": 21.62,
            "pricesByTier": [
              21.62,
              21.335,
              21.041,
              20.137
            ],
            "min": 500,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-comment",
        "name": "TikTok Comment",
        "slug": "tiktok-comment",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47126",
            "code": "47126",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Comment",
            "fullName": "Máy chủ 1 — TikTok Comment",
            "pricePerUnit": 39.51,
            "costPerUnit": 39.51,
            "pricesByTier": [
              39.51,
              38.99,
              38.452,
              36.801
            ],
            "min": 500,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-live-stream-services-likes-pk-poin",
        "name": "TikTok Live Stream Services [ Likes+PK Poin ]",
        "slug": "tiktok-live-stream-services-likes-pk-poin",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47127",
            "code": "47127",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Live Stream Services [ Likes+PK Poin ]",
            "fullName": "Máy chủ 1 — TikTok Live Stream Services [ Likes+PK Poin ]",
            "pricePerUnit": 25.22,
            "costPerUnit": 25.22,
            "pricesByTier": [
              25.22,
              24.888,
              24.544,
              23.491
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "tiktok-global-tiktok-story",
        "name": "TikTok Story",
        "slug": "tiktok-story",
        "platformId": "tiktok-global",
        "servers": [
          {
            "id": "srv-47128",
            "code": "47128",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — TikTok Story",
            "fullName": "Máy chủ 1 — TikTok Story",
            "pricePerUnit": 43.92,
            "costPerUnit": 43.92,
            "pricesByTier": [
              43.92,
              43.342,
              42.743,
              40.908
            ],
            "min": 200,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "youtube-global",
    "name": "Youtube Global",
    "slug": "youtube-global",
    "region": "global",
    "assetKey": "platform.youtube-global",
    "services": [
      {
        "id": "youtube-global-youtube-live-stream-premiere-viewers-usa-best-for-ranking",
        "name": "YouTube - Live Stream / Premiere Viewers | USA | Best for Ranking ᴺᴱᵂ",
        "slug": "youtube-live-stream-premiere-viewers-usa-best-for-ranking",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47129",
            "code": "47129",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube - Live Stream / Premiere Viewers | USA | Best for Ranking ᴺᴱᵂ",
            "fullName": "Máy chủ 1 — YouTube - Live Stream / Premiere Viewers | USA | Best for Ranking ᴺᴱᵂ",
            "pricePerUnit": 48.81,
            "costPerUnit": 48.81,
            "pricesByTier": [
              48.81,
              48.168,
              47.503,
              45.463
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-video-views-social-native-ads",
        "name": "YouTube Video Views [ Social / Native Ads ] ᴺᴱᵂ",
        "slug": "youtube-video-views-social-native-ads",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47130",
            "code": "47130",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Video Views [ Social / Native Ads ] ᴺᴱᵂ",
            "fullName": "Máy chủ 1 — YouTube Video Views [ Social / Native Ads ] ᴺᴱᵂ",
            "pricePerUnit": 34.65,
            "costPerUnit": 34.65,
            "pricesByTier": [
              34.65,
              34.194,
              33.722,
              32.274
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-likes",
        "name": "YouTube Likes ⚠️",
        "slug": "youtube-likes",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47131",
            "code": "47131",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Likes ⚠️",
            "fullName": "Máy chủ 1 — YouTube Likes ⚠️",
            "pricePerUnit": 9.4,
            "costPerUnit": 9.4,
            "pricesByTier": [
              9.4,
              9.276,
              9.148,
              8.755
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-video-likes-non-drop",
        "name": "YouTube Video Likes - Non Drop - ♻️",
        "slug": "youtube-video-likes-non-drop",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47132",
            "code": "47132",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Video Likes - Non Drop - ♻️",
            "fullName": "Máy chủ 1 — YouTube Video Likes - Non Drop - ♻️",
            "pricePerUnit": 41.55,
            "costPerUnit": 41.55,
            "pricesByTier": [
              41.55,
              41.003,
              40.437,
              38.701
            ],
            "min": 50,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-comments-by-ai",
        "name": "YouTube Comments By AI ᴺᴱᵂ🔥",
        "slug": "youtube-comments-by-ai",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47133",
            "code": "47133",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Comments By AI ᴺᴱᵂ🔥",
            "fullName": "Máy chủ 1 — YouTube Comments By AI ᴺᴱᵂ🔥",
            "pricePerUnit": 65.64,
            "costPerUnit": 65.64,
            "pricesByTier": [
              65.64,
              64.776,
              63.882,
              61.139
            ],
            "min": 100,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-tang-4000h-xem",
        "name": "Tăng 4000H Xem",
        "slug": "tang-4000h-xem",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47134",
            "code": "47134",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng 4000H Xem",
            "fullName": "Máy chủ 1 — Tăng 4000H Xem",
            "pricePerUnit": 38.55,
            "costPerUnit": 38.55,
            "pricesByTier": [
              38.55,
              38.043,
              37.517,
              35.907
            ],
            "min": 1000,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-subscribers",
        "name": "YouTube Subscribers",
        "slug": "youtube-subscribers",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47135",
            "code": "47135",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Subscribers",
            "fullName": "Máy chủ 1 — YouTube Subscribers",
            "pricePerUnit": 62.58,
            "costPerUnit": 62.58,
            "pricesByTier": [
              62.58,
              61.756,
              60.904,
              58.289
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-views-us-tot-cho-seo",
        "name": "YouTube Views US [Tốt Cho Seo]",
        "slug": "youtube-views-us-tot-cho-seo",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47136",
            "code": "47136",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Views US [Tốt Cho Seo]",
            "fullName": "Máy chủ 1 — YouTube Views US [Tốt Cho Seo]",
            "pricePerUnit": 23.91,
            "costPerUnit": 23.91,
            "pricesByTier": [
              23.91,
              23.595,
              23.27,
              22.27
            ],
            "min": 1000,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-live-stream-views",
        "name": "YouTube Live Stream Views",
        "slug": "youtube-live-stream-views",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47137",
            "code": "47137",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Live Stream Views",
            "fullName": "Máy chủ 1 — YouTube Live Stream Views",
            "pricePerUnit": 15.06,
            "costPerUnit": 15.06,
            "pricesByTier": [
              15.06,
              14.862,
              14.657,
              14.027
            ],
            "min": 100,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "youtube-global-youtube-video-views",
        "name": "YouTube Video Views",
        "slug": "youtube-video-views",
        "platformId": "youtube-global",
        "servers": [
          {
            "id": "srv-47138",
            "code": "47138",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — YouTube Video Views",
            "fullName": "Máy chủ 1 — YouTube Video Views",
            "pricePerUnit": 27.47,
            "costPerUnit": 27.47,
            "pricesByTier": [
              27.47,
              27.108,
              26.734,
              25.586
            ],
            "min": 200,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "google-maps",
    "name": "Google Maps",
    "slug": "google-maps",
    "region": "vn",
    "assetKey": "platform.google-maps",
    "services": [
      {
        "id": "google-maps-tang-danh-gia-google-maps",
        "name": "Tăng Đánh Giá Google Maps",
        "slug": "tang-danh-gia-google-maps",
        "platformId": "google-maps",
        "servers": [
          {
            "id": "srv-47139",
            "code": "47139",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Đánh Giá Google Maps",
            "fullName": "Máy chủ 1 — Tăng Đánh Giá Google Maps",
            "pricePerUnit": 71.84,
            "costPerUnit": 71.84,
            "pricesByTier": [
              71.84,
              70.894,
              69.916,
              66.914
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "twitter",
    "name": "Twitter",
    "slug": "twitter",
    "region": "vn",
    "assetKey": "platform.twitter",
    "services": [
      {
        "id": "twitter-tang-like-twitter",
        "name": "Tăng Like Twitter",
        "slug": "tang-like-twitter",
        "platformId": "twitter",
        "servers": [
          {
            "id": "srv-47140",
            "code": "47140",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Like Twitter",
            "fullName": "Máy chủ 1 — Tăng Like Twitter",
            "pricePerUnit": 71.11,
            "costPerUnit": 71.11,
            "pricesByTier": [
              71.11,
              70.174,
              69.205,
              66.234
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-tang-theo-doi-twitter",
        "name": "Tăng Theo Dõi Twitter",
        "slug": "tang-theo-doi-twitter",
        "platformId": "twitter",
        "servers": [
          {
            "id": "srv-47141",
            "code": "47141",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Theo Dõi Twitter",
            "fullName": "Máy chủ 1 — Tăng Theo Dõi Twitter",
            "pricePerUnit": 19.96,
            "costPerUnit": 19.96,
            "pricesByTier": [
              19.96,
              19.697,
              19.425,
              18.591
            ],
            "min": 200,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-tang-comment-twitter",
        "name": "Tăng Comment Twitter",
        "slug": "tang-comment-twitter",
        "platformId": "twitter",
        "servers": [
          {
            "id": "srv-47142",
            "code": "47142",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Comment Twitter",
            "fullName": "Máy chủ 1 — Tăng Comment Twitter",
            "pricePerUnit": 37.84,
            "costPerUnit": 37.84,
            "pricesByTier": [
              37.84,
              37.342,
              36.826,
              35.245
            ],
            "min": 500,
            "max": 1000000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-tang-retweet-twitter",
        "name": "Tăng Retweet Twitter",
        "slug": "tang-retweet-twitter",
        "platformId": "twitter",
        "servers": [
          {
            "id": "srv-47143",
            "code": "47143",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Retweet Twitter",
            "fullName": "Máy chủ 1 — Tăng Retweet Twitter",
            "pricePerUnit": 29.85,
            "costPerUnit": 29.85,
            "pricesByTier": [
              29.85,
              29.457,
              29.05,
              27.803
            ],
            "min": 100,
            "max": 50000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      },
      {
        "id": "twitter-tang-luot-tiep-can",
        "name": "Tăng Lượt Tiếp Cận",
        "slug": "tang-luot-tiep-can",
        "platformId": "twitter",
        "servers": [
          {
            "id": "srv-47144",
            "code": "47144",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Lượt Tiếp Cận",
            "fullName": "Máy chủ 1 — Tăng Lượt Tiếp Cận",
            "pricePerUnit": 67.03,
            "costPerUnit": 67.03,
            "pricesByTier": [
              67.03,
              66.148,
              65.234,
              62.434
            ],
            "min": 100,
            "max": 500000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  },
  {
    "id": "zalo",
    "name": "Zalo",
    "slug": "zalo",
    "region": "vn",
    "assetKey": "platform.zalo",
    "services": [
      {
        "id": "zalo-tang-thanh-vien-nhom-zalo",
        "name": "Tăng Thành Viên Nhóm Zalo",
        "slug": "tang-thanh-vien-nhom-zalo",
        "platformId": "zalo",
        "servers": [
          {
            "id": "srv-47145",
            "code": "47145",
            "apiServiceId": null,
            "index": 1,
            "name": "Máy chủ 1 — Tăng Thành Viên Nhóm Zalo",
            "fullName": "Máy chủ 1 — Tăng Thành Viên Nhóm Zalo",
            "pricePerUnit": 47.05,
            "costPerUnit": 47.05,
            "pricesByTier": [
              47.05,
              46.431,
              45.79,
              43.824
            ],
            "min": 50,
            "max": 100000,
            "tags": [],
            "available": true,
            "source": "demo"
          }
        ]
      }
    ]
  }
];
