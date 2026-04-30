# 💅 Love Nails POS

App quản lý tiệm nail — Dashboard, Tickets, Appointments, Customers, Employees, Reports.

---

## 🚀 Hướng dẫn setup từ A đến Z

### Bước 1 — Tạo Supabase database

1. Vào **https://supabase.com** → đăng ký miễn phí
2. Bấm **New Project** → đặt tên `love-nails-pos` → chọn region **West US** → tạo
3. Chờ ~2 phút để project khởi động
4. Vào **SQL Editor** (menu trái) → paste toàn bộ nội dung file `supabase-setup.sql` → bấm **Run**
5. Vào **Settings → API** → copy 2 thứ:
   - **Project URL** (dạng `https://xxx.supabase.co`)
   - **anon public key** (chuỗi dài bắt đầu `eyJ...`)

### Bước 2 — Tạo GitHub repo

1. Vào **https://github.com** → đăng ký nếu chưa có
2. Bấm **New repository** → đặt tên `love-nails-pos` → **Create repository**
3. Upload toàn bộ folder này lên repo (dùng nút **uploading an existing file**)

### Bước 3 — Deploy lên Vercel

1. Vào **https://vercel.com** → đăng nhập bằng GitHub
2. Bấm **Add New Project** → chọn repo `love-nails-pos`
3. Mở **Environment Variables** → thêm 2 biến:
   ```
   VITE_SUPABASE_URL      = [Project URL từ bước 1]
   VITE_SUPABASE_ANON_KEY = [anon key từ bước 1]
   ```
4. Bấm **Deploy** → chờ ~1 phút
5. ✅ App live tại link `love-nails-pos.vercel.app`

---

## 📱 Dùng hằng ngày

- **Dashboard** — Tổng quan doanh thu, cash/card/tips, nhân viên
- **New Ticket** — Tạo bill mới, chọn dịch vụ, gán nhân viên, nhập tip, chọn payment
- **Appointments** — Lịch hẹn hôm nay, cập nhật trạng thái
- **Customers** — Danh sách khách, ghi chú, dị ứng
- **Employees** — Quản lý nhân viên, commission
- **Reports** — Doanh thu theo ngày/tuần/tháng

---

## 🛠 Tech stack

- **Frontend**: React + Vite
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (miễn phí)
- **Chi phí**: $0/tháng cho 1 tiệm nhỏ

---

## ❓ Cần hỗ trợ

Liên hệ qua Claude để được hướng dẫn thêm.
