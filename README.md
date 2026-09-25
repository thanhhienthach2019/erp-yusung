# ERP NEXTGEN (REACT NATIVE + FASTAPI + POSTGRESQL + REDIS + RABBITMQ)

Hệ thống quản trị sản xuất và tạo/quét mã vạch chuẩn công nghiệp độc lập hoàn toàn, kế thừa toàn bộ giao diện và quy trình sản xuất từ phiên bản Google Apps Script.

---

## 1. Cấu Trúc Dự Án

```text
E:\MrHien\Project\erp_nextgen\
├── backend/                       # Python FastAPI Backend (Async)
│   ├── app/
│   │   ├── api/                   # Router Auth, Barcode, Planning, Realtime WS
│   │   ├── core/                  # Database, Redis, RabbitMQ, Security
│   │   ├── models/                # Bảng PostgreSQL (SQLAlchemy 2.0)
│   │   ├── schemas/               # Khai báo dữ liệu Pydantic v2
│   │   └── workers/               # RabbitMQ Consumer quét tem ngầm
│   ├── Dockerfile
│   ├── requirements.txt
│   └── seed_data.py               # Script nạp dữ liệu mẫu ban đầu
│
├── frontend/                      # React Native (Expo SDK 51) Web & Mobile
│   ├── src/
│   │   ├── api/                   # Kết nối REST API & WebSocket Realtime
│   │   ├── components/            # Sidebar, Thẻ tem A4 BarcodeLabelCard
│   │   ├── screens/               # Màn hình Mã Vạch Sản Xuất (3 Tab đầy đủ)
│   │   └── utils/                 # Audio bíp Web & Mobile
│   ├── App.tsx
│   └── package.json
│
└── docker-compose.yml             # Khởi chạy Postgres 15, Redis 7, RabbitMQ 3, API & Worker
```

---

## 2. Khởi Động Hệ Thống

### Cách 1: Khởi động toàn bộ qua Docker (Khuyên Dùng)
Tại thư mục `E:\MrHien\Project\erp_nextgen`:

```bash
# Khởi động PostgreSQL, Redis, RabbitMQ, FastAPI và Scan Worker
docker compose up -d --build
```

- **Swagger API Docs:** `http://localhost:9600/api/v1/docs`
- **RabbitMQ Management UI:** `http://localhost:15672` (User: `guest` / Pass: `guest`)
- **PostgreSQL Port:** `5432`
- **Redis Port:** `6379`

### Cách 2: Khởi động Backend Python Cục Bộ
```bash
cd backend
pip install -r requirements.txt

# Nạp dữ liệu mẫu (User admin, Tờ gạch, Mapping)
python seed_data.py

# Khởi chạy máy chủ API
uvicorn app.main:app --host 0.0.0.0 --port 9600 --reload
```

---

## 3. Khởi Động Frontend (React Native - Expo)

Tại thư mục `E:\MrHien\Project\erp_nextgen\frontend`:

```bash
npm install

# Chạy trên trình duyệt Web (PC/Laptop/Tablet)
npm run web

# Chạy trên thiết bị di động (Android / Máy quét cầm tay)
npm run android
```

---

## 4. Các Tính Năng Lõi Đã Được Xây Dựng

1. **Tạo & In Tem Khổ A4 Chuẩn:**
   - Hỗ trợ cả 2 chế độ: **Theo kế hoạch tờ gạch** & **Ngoài tờ gạch (đơn còn remain)**.
   - Chia lưới 6 tem/trang (2 cột x 3 hàng), kích thước mỗi thẻ tem đúng chuẩn 96mm x 88mm.
   - Loại bỏ hoàn toàn trang trắng thừa khi in.
2. **Quét Mã Vạch Realtime (Camera + Súng Scan Cầm Tay):**
   - Hỗ trợ súng quét mã vạch USB/Bluetooth.
   - Camera quét liên tục tự động với **1 nút bấm Bật/Tắt duy nhất**.
   - Cơ chế **chống quét trùng lặp tức thì** bằng **Redis Atomic Lock (`SET NX EX 2`)**.
   - Đẩy lượt quét vào **RabbitMQ** để xử lý hàng loạt không nghẽn mạng.
   - Phát sóng WebSocket qua **Redis Pub/Sub** cập nhật Realtime lên toàn bộ màn hình.
3. **Lịch Sử & In Lại Tem:**
   - Tra cứu theo Planning Code, Model Code và in lại tem đã chọn.
