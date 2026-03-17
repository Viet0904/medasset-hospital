# MedAsset — Walkthrough

## Tổng quan

Xây dựng hoàn chỉnh hệ thống **MedAsset** quản lý thiết bị bệnh viện tại `c:\SnipIT`, lấy cảm hứng từ Snipe-IT.

**Tech stack**: Next.js 15 + TypeScript + Prisma (SQLite) + NextAuth.js + Tailwind CSS v4 + Recharts

---

## Screenshots

````carousel
![Trang đăng nhập - Dark glassmorphism design với demo account buttons](C:\Users\Onyx9\.gemini\antigravity\brain\8a5ea2c6-d72f-44cc-b4f4-b1906697959a\login_page.png)
<!-- slide -->
![Dashboard - Thống kê 18 thiết bị, biểu đồ tròn theo trạng thái, biểu đồ cột theo danh mục](C:\Users\Onyx9\.gemini\antigravity\brain\8a5ea2c6-d72f-44cc-b4f4-b1906697959a\dashboard.png)
<!-- slide -->
![Danh sách thiết bị - Bảng đầy đủ với search, filter, status badges, thao tác CRUD](C:\Users\Onyx9\.gemini\antigravity\brain\8a5ea2c6-d72f-44cc-b4f4-b1906697959a\assets_list.png)
````

---

## Demo Video

![Flow đăng nhập → Dashboard → Danh sách thiết bị → Chi tiết thiết bị](C:\Users\Onyx9\.gemini\antigravity\brain\8a5ea2c6-d72f-44cc-b4f4-b1906697959a\demo_recording.webp)

---

## Các tính năng đã xây dựng

| Tính năng | Trạng thái |
|---|---|
| **Login/Logout** (3 tài khoản demo) | ✅ |
| **Dashboard** (6 stat cards + 3 biểu đồ) | ✅ |
| **Assets CRUD** (search, filter, pagination) | ✅ |
| **Checkout/Checkin** thiết bị | ✅ |
| **Categories** quản lý danh mục | ✅ |
| **Locations** quản lý vị trí | ✅ |
| **Manufacturers** quản lý NSX | ✅ |
| **Users** quản lý người dùng (Admin) | ✅ |
| **Maintenance** theo dõi bảo trì | ✅ |
| **Reports** xuất Excel/CSV | ✅ |
| **Audit Log** nhật ký hoạt động | ✅ |
| **Role-based Access** (Admin/Manager/Staff) | ✅ |
| **Dark Theme Glassmorphism** | ✅ |
| **Vietnamese UI** | ✅ |

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@hospital.vn` | `admin123` |
| Manager | `manager@hospital.vn` | `manager123` |
| Staff | `staff@hospital.vn` | `staff123` |

## Dữ liệu mẫu

- **18** thiết bị (MRI, X-quang, CT Scanner, siêu âm, nội soi, monitor, máy tính, máy in, máy photo, máy thở)
- **10** danh mục | **8** vị trí | **7** nhà sản xuất | **2** nhà cung cấp

## Cách chạy

```bash
cd c:\SnipIT
npm run dev        # Dev server → http://localhost:3000
npm run db:setup   # Reset + seed database
```

## Verification

- ✅ Login flow hoạt động với cả 3 tài khoản demo
- ✅ Dashboard hiển thị đúng thống kê + biểu đồ
- ✅ Assets CRUD (list/create/edit/delete/detail) hoạt động
- ✅ Vietnamese UI hiển thị chính xác
- ✅ Dark theme glassmorphism render đẹp
