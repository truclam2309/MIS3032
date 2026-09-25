# Nhật ký thay đổi — US-03

## Chưa gán phiên bản — 2026-09-26

### Thêm

- Bộ test gọn 5 case cho backend memory và 5 case cho Supabase thật.
- Xác minh dữ liệu quyết định bằng cách đọc lại record Supabase.

### Sửa

- Supabase approval update lọc theo cả ID và trạng thái `PENDING_APPROVAL`, tránh ghi đè quyết định đã được xử lý.
- INSERT PR lấy record vừa tạo bằng `.select("*")` trước khi trả kết quả.

### Còn thiếu

- Finance approval, resubmission, audit event đầy đủ và kiểm thử UI/E2E.
- Chưa có phiên bản phát hành chính thức; API đang khai báo `0.2.0`.
