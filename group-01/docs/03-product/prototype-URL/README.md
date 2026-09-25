# ProcureAI — Prototype

## Trạng thái

Prototype giao diện Procurement có trong thư mục `Source Code/`. Đây là ứng dụng React/Vite chạy local; repo chưa cung cấp URL triển khai công khai. Giao diện có thể trình diễn các màn hình request, approval, budget, sourcing, quotation comparison và order. Dữ liệu/workflow ở frontend có phần dùng state mẫu và chưa đồng nghĩa backend đã triển khai đầy đủ.

## Chạy local

Mở terminal tại thư mục `Source Code/`, sau đó chạy:

```bash
npm install
npm run dev
```

Vite sẽ in địa chỉ local trong terminal (mặc định thường là `http://localhost:5173/`). URL này chỉ truy cập được khi máy đang chạy dev server; không phải URL public.

## Giới hạn

- Source: `Source Code/src/`.
- Backend API: `backend-test/`; hiện chưa xác nhận frontend được tích hợp với API.
- Quy trình nghiệp vụ và business rules trong Requirements/Vault là nguồn ưu tiên khi prototype có khác biệt.
