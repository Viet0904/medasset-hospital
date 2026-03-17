# 📖 Hướng dẫn sử dụng MedAsset

## Mục lục

- [1. Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
- [2. Cài đặt từ đầu](#2-cài-đặt-từ-đầu)
- [3. Database](#3-database)
- [4. Hướng dẫn sử dụng](#4-hướng-dẫn-sử-dụng)
- [5. Phân quyền](#5-phân-quyền)
- [6. Xuất báo cáo](#6-xuất-báo-cáo)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Nâng cấp Database](#8-nâng-cấp-database)

---

## 1. Yêu cầu hệ thống

| Yêu cầu | Phiên bản |
|---|---|
| Node.js | >= 18.0 |
| npm | >= 9.0 |
| Trình duyệt | Chrome, Firefox, Edge (phiên bản mới) |
| RAM | >= 512MB (cho dev server) |

> ⚠️ **Không cần cài đặt database server** (MySQL, PostgreSQL...). MedAsset sử dụng SQLite — database nằm trong 1 file duy nhất.

---

## 2. Cài đặt từ đầu

### 2.1. Clone và cài dependencies

```bash
git clone https://github.com/YOUR_USERNAME/medasset.git
cd medasset
npm install
```

### 2.2. Cấu hình môi trường

```bash
# Copy file mẫu
cp .env.example .env

# (Tùy chọn) Tạo secret key mạnh hơn
# Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Dán kết quả vào NEXTAUTH_SECRET trong file .env
```

### 2.3. Tạo database và nạp dữ liệu mẫu

```bash
npm run db:setup
```

Lệnh này thực hiện 2 bước:
1. `prisma db push` — tạo file `prisma/dev.db` và tạo các bảng
2. `npx tsx prisma/seed.ts` — nạp dữ liệu mẫu (users, assets, categories...)

### 2.4. Khởi động

```bash
npm run dev
```

Mở **http://localhost:3000** → đăng nhập bằng tài khoản demo.

---

## 3. Database

### 3.1. SQLite là gì?

SQLite là database dạng **file** — toàn bộ database nằm trong 1 file duy nhất:

```
prisma/dev.db        ← File database chính
prisma/dev.db-journal ← File tạm (tự động tạo/xóa)
```

**Ưu điểm:**
- ✅ Không cần cài đặt database server
- ✅ Dễ backup (chỉ cần copy 1 file)
- ✅ Không cần cấu hình kết nối phức tạp
- ✅ Phù hợp cho ứng dụng nhỏ-vừa (< 100 users đồng thời)

### 3.2. Quản lý database

```bash
# Xem database bằng GUI (Prisma Studio)
npm run db:studio

# Reset database (xóa sạch + tạo lại + nạp dữ liệu mẫu)
rm prisma/dev.db          # Xóa file database
npm run db:setup           # Tạo lại từ đầu

# Chỉ nạp lại dữ liệu mẫu (giữ nguyên schema)
npm run db:seed
```

### 3.3. Backup database

```bash
# Đơn giản: copy file
cp prisma/dev.db prisma/backup_2026-03-17.db

# Khôi phục: copy ngược lại
cp prisma/backup_2026-03-17.db prisma/dev.db
```

### 3.4. Cấu trúc bảng

| Bảng | Mô tả | Số bản ghi mẫu |
|---|---|---|
| `User` | Tài khoản người dùng | 3 |
| `Asset` | Thiết bị / Tài sản | 18 |
| `Category` | Danh mục thiết bị | 10 |
| `Location` | Vị trí (khoa/phòng) | 8 |
| `Manufacturer` | Nhà sản xuất | 7 |
| `Supplier` | Nhà cung cấp | 2 |
| `AssetCheckout` | Lịch sử cấp phát/thu hồi | 5 |
| `MaintenanceLog` | Phiếu bảo trì | 1 |
| `AuditLog` | Nhật ký hoạt động | 1 |

---

## 4. Hướng dẫn sử dụng

### 4.1. Đăng nhập

Truy cập **http://localhost:3000** → tự động chuyển đến trang đăng nhập.

Bấm vào nút tài khoản demo (Admin/Manager/Staff) để tự điền username+mật khẩu, sau đó bấm **Đăng nhập**.

### 4.2. Dashboard (Tổng quan)

Sau khi đăng nhập, bạn thấy:
- **6 thẻ thống kê**: Tổng thiết bị, Đang sử dụng, Sẵn sàng, Bảo trì, Hỏng, Người dùng
- **Biểu đồ tròn**: Phân bố thiết bị theo trạng thái
- **Biểu đồ cột ngang**: Số thiết bị theo danh mục
- **Biểu đồ cột dọc**: Số thiết bị theo vị trí
- **Hoạt động gần đây**: Timeline các thao tác

### 4.3. Quản lý Thiết bị

**Xem danh sách:** Sidebar → "Thiết bị"
- Tìm kiếm theo tên, mã, serial
- Lọc theo trạng thái (Sẵn sàng, Đang sử dụng, Bảo trì, Hỏng, Thanh lý)
- Lọc theo danh mục
- Phân trang (10/20/50/100 dòng mỗi trang)
- Ẩn/hiện cột: bấm nút **"Cột"** để chọn cột muốn hiển thị (lưu tự động)

**Thêm thiết bị:** Bấm "Thêm thiết bị" → điền form → "Lưu thiết bị"

**Sửa/Xóa:** Bấm icon ✏️ (sửa) hoặc 🗑️ (xóa) trên mỗi dòng

**Xem chi tiết:** Bấm icon 👁️ → xem thông tin, lịch sử cấp phát, lịch sử bảo trì

### 4.4. Cấp phát / Thu hồi thiết bị

1. Vào chi tiết thiết bị (trạng thái "Sẵn sàng")
2. Bấm **"Cấp phát"** → chọn người nhận → xác nhận
3. Trạng thái thiết bị chuyển thành "Đang sử dụng"
4. Khi thu hồi: bấm **"Thu hồi"** → trạng thái về "Sẵn sàng"

### 4.5. Bảo trì

Sidebar → "Bảo trì" → "Tạo phiếu bảo trì"
- Chọn thiết bị cần bảo trì
- Chọn loại: Phòng ngừa / Sửa chữa / Kiểm tra
- Nhập chi phí, ngày, mô tả

### 4.6. Quản lý Danh mục / Vị trí / Nhà sản xuất

Các trang quản lý hiển thị dạng **bảng (table)** với phân trang (10/20/50 dòng mỗi trang). Bấm nút "Thêm" để tạo mới, bấm ✏️ để sửa, 🗑️ để xóa.

> ⚠️ Không thể xóa danh mục/vị trí đang có thiết bị liên kết.

---

## 5. Phân quyền

### 5.1. Bảng quyền chi tiết

| Chức năng | Admin | Manager | Staff |
|---|:---:|:---:|:---:|
| Xem Dashboard | ✅ | ✅ | ✅ |
| Xem danh sách thiết bị | ✅ | ✅ | ✅ |
| Xem chi tiết thiết bị | ✅ | ✅ | ✅ |
| Thêm/Sửa/Xóa thiết bị | ✅ | ✅ | ❌ |
| Cấp phát/Thu hồi | ✅ | ✅ | ❌ |
| Quản lý Danh mục | ✅ | ✅ | ❌ |
| Quản lý Vị trí | ✅ | ✅ | ❌ |
| Quản lý Nhà sản xuất | ✅ | ✅ | ❌ |
| Tạo phiếu Bảo trì | ✅ | ✅ | ❌ |
| Xuất Báo cáo | ✅ | ✅ | ❌ |
| Quản lý Người dùng | ✅ | ❌ | ❌ |
| Xem Nhật ký | ✅ | ❌ | ❌ |

### 5.2. Tạo tài khoản mới

Chỉ **Admin** mới có thể tạo tài khoản:  
Sidebar → "Người dùng" → "Thêm người dùng" → chọn vai trò

---

## 6. Xuất báo cáo

1. Sidebar → "Báo cáo"
2. (Tùy chọn) Lọc theo trạng thái và/hoặc danh mục
3. Xem bảng preview bên dưới
4. Bấm **"Xuất Excel"** hoặc **"Xuất CSV"**
5. File tự động tải về: `bao-cao-thiet-bi-YYYY-MM-DD.xlsx`

**Các cột trong file xuất:**
Mã thiết bị, Tên, Số serial, Trạng thái, Danh mục, Vị trí, Nhà sản xuất, Nhà cung cấp, Ngày mua, Giá mua, Hết bảo hành, Ghi chú

---

## 7. Troubleshooting

### Lỗi "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Lỗi "Database file not found"

```bash
npm run db:setup
```

### Quên mật khẩu Admin

```bash
# Xóa database và tạo lại (mất toàn bộ dữ liệu)
rm prisma/dev.db
npm run db:setup
# Đăng nhập lại với username: admin / mật khẩu: admin123
```

### Port 3000 đã bị chiếm

```bash
# Chạy trên port khác
npx next dev -p 3001
```

---

## 8. Nâng cấp Database

Nếu bệnh viện lớn (> 100 users đồng thời), có thể chuyển sang **PostgreSQL**:

1. Cài PostgreSQL
2. Sửa `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Sửa `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/medasset"
   ```
4. Chạy lại:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
