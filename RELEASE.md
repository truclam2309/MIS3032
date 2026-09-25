# Ghi chú phát hành

## Version

**v1.0.0-final** — bản phát hành cuối cùng của RoomFlow / ProcureAI cho phạm vi đồ án hiện tại. Nhãn này khớp với tag Git `v1.0.0-final`.

## Scope

Ứng dụng demo quy trình Purchase Request, thuộc US-01 và luồng phê duyệt liên quan: giao diện React, API FastAPI, xác thực/ phân quyền vai trò, kiểm tra ngân sách và lưu request qua Supabase khi được cấu hình. Phạm vi phát hành không xác nhận sản phẩm sẵn sàng production.

## Features

- Đăng nhập JWT, thông tin người dùng hiện tại và quyền theo vai trò.
- Tạo Purchase Request từ giao diện; tải danh sách từ API và hỗ trợ lưu qua Supabase hoặc bộ nhớ trong.
- Quyết định phê duyệt, từ chối hoặc yêu cầu chỉnh sửa của Manager; trả workflow tương ứng cho giao diện.
- Endpoint xem và kiểm tra ngân sách dành cho Finance/Admin.
- Docker Compose, health check, CI kiểm thử/build/kiểm tra dependency và cấu hình publish image; deploy SSH tùy chọn.

## Fixes

- Khắc phục luồng Submit Purchase Request chỉ cập nhật state phía giao diện: frontend gửi request đến backend và tải lại danh sách từ API.
- Thêm chuyển đổi response workflow để giao diện thể hiện các bước phê duyệt.
- Bổ sung cấu hình CORS, ghi log request và chặn khởi động với `APP_ENV=production` khi vẫn dùng xác thực demo.

## Known issues

- **BUG-003:** API chưa bắt buộc/kiểm tra đầy đủ `costCenter`, `neededBy`, `deliveryLocation` và line items.
- **BUG-006:** Trợ lý chuẩn hóa ghi chú đang dùng regex/từ khóa và gợi ý tĩnh, chưa tích hợp AI như đặc tả.
- QA report ghi nhận 15 testcase được định nghĩa nhưng chưa testcase nào chạy do môi trường thiếu `pytest`; chưa có QA sign-off.
- Migration Supabase `002_add_purchase_request_details.sql` và lưu/đọc trên Supabase thật chưa được xác minh.
- Backend hiện dùng tài khoản demo trong mã nguồn; xác thực này chưa phù hợp production.

## Upgrade notes

- Clone repository tại tag `v1.0.0-final`; xem README để khởi chạy bằng Docker Compose.
- Chạy demo mặc định với `USE_SUPABASE=false`; dữ liệu backend trong bộ nhớ sẽ mất khi container API được tạo lại.
- Nếu bật Supabase, cấu hình `SUPABASE_URL` và `SUPABASE_PUBLISHABLE_KEY`, đặt `USE_SUPABASE=true`, rồi áp dụng các SQL migration trong `supabase/migrations/`. Cần xác minh migration/schema trước khi dùng dữ liệu thật.
- Trước khi triển khai production, thay nguồn xác thực/tài khoản demo, đặt `SECRET_KEY` ngẫu nhiên tối thiểu 32 ký tự và xử lý các known issues; backend hiện chủ động từ chối `APP_ENV=production` khi còn cơ chế xác thực demo.
- Trạng thái tag/version không đồng nghĩa với QA sign-off: cần chạy CI và kiểm thử tích hợp Supabase trước khi quyết định triển khai.
