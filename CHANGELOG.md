# Nhật ký thay đổi

Các thay đổi đáng chú ý theo phiên bản RoomFlow / ProcureAI.

## [v1.0.0-final] - 2026-09-26

### Version

Phiên bản phát hành: **v1.0.0-final** (khớp tag Git `v1.0.0-final`).

### Scope

US-01 — tạo và chuẩn hóa Purchase Request cùng các phần API, xác thực, ngân sách và workflow phê duyệt liên quan. Đây là bản demo đồ án; chưa được xác nhận sẵn sàng production.

### Features

- Đăng nhập và xác thực JWT; trả thông tin người dùng và quyền theo vai trò.
- Tạo Purchase Request từ UI qua backend; hỗ trợ đọc danh sách và lưu Supabase khi cấu hình.
- Quy trình Manager phê duyệt, từ chối hoặc yêu cầu chỉnh sửa; biểu diễn các bước workflow cho frontend.
- Xem ngân sách và kiểm tra ngân sách theo quyền Finance/Admin.
- Thêm Docker/Compose, health check, CI kiểm thử và build, kiểm tra dependency, publish image và deploy tùy chọn.

### Fixes

- Submit Purchase Request đã gọi API thay vì chỉ cập nhật state cục bộ; danh sách được tải từ backend.
- Response Purchase Request có workflow được tính theo trạng thái để frontend hiển thị.
- Bổ sung CORS và ghi log request; cấu hình production từ chối khởi động khi xác thực demo chưa được thay thế.

### Known issues

- **BUG-003:** Validation API chưa bao phủ đủ các trường bắt buộc và line items của form.
- **BUG-006:** Trợ lý ghi chú hiện là xử lý quy tắc/từ khóa với gợi ý tĩnh, chưa phải tích hợp AI.
- Theo QA report, 15 testcase được định nghĩa, 0 testcase thực thi; QA chưa phê duyệt.
- Chưa xác minh migration Supabase số 002 và tích hợp lưu/đọc với Supabase thật.
- Tài khoản demo còn trong backend, nên chưa đủ điều kiện triển khai production.

### Upgrade notes

- Dùng `.env.example` làm cấu hình phát triển; không dùng thông tin demo hoặc secret mẫu trong production.
- Mặc định demo sử dụng bộ nhớ trong. Muốn lưu bền vững qua Supabase, cấu hình URL/key, bật `USE_SUPABASE` và chạy các migration trong `supabase/migrations/`.
- Trước khi phát hành production, thay cơ chế xác thực demo, đặt secret mạnh, xử lý các vấn đề đã biết, chạy bộ test/CI và xác minh migration với Supabase.
- Xem `RELEASE.md` và README để biết phạm vi, giới hạn và hướng dẫn khởi chạy chi tiết.
