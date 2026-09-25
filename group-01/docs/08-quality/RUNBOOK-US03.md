# Hướng dẫn chạy và xử lý sự cố — US-03

## 1. Chuẩn bị

Làm việc trong thư mục `backend-test`. Dùng Python 3.11 trở lên và cài dependencies của backend cùng pytest:

```powershell
cd D:\MIS3032\backend-test
python -m pip install -e . pytest
```

Tạo `.env` từ `.env.example` nếu chưa có, rồi điền `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` và `SECRET_KEY` khi cần chạy Supabase. Không đưa `.env` vào Git.

## 2. Chạy test memory

Trong PowerShell:

```powershell
$env:USE_SUPABASE = "false"
python -m pytest -v test_approval.py
```

Kết quả mong đợi: 5 test pass.

## 3. Chạy test Supabase thật

```powershell
$env:USE_SUPABASE = "true"
python -m pytest -v test_approval_supabase.py
```

Kết quả mong đợi: 5 test pass. Test thực hiện INSERT, gọi decision API, rồi SELECT để xác nhận trạng thái đã lưu. ID có dạng `PR-TEST-<UUID>` để không trùng dữ liệu khác.

Role Supabase hiện không có quyền DELETE nên các dòng test không tự xóa. Không cấp DELETE rộng cho role publishable/anon chỉ để dọn dữ liệu.

## 4. Chạy cả hai bộ theo cấu hình hiện tại

```powershell
python -m pytest -v
```

Khi `USE_SUPABASE=true`, bộ `test_approval.py` cũng dùng Supabase và `test_approval_supabase.py` chạy integration tests. Khi `USE_SUPABASE=false`, test memory chạy và module Supabase được skip.

## 5. Xử lý lỗi thường gặp

| Lỗi | Kiểm tra |
|---|---|
| Thiếu URL/key hoặc client không khởi tạo | Kiểm tra tên biến trong `backend-test/.env`; không in giá trị key vào log. |
| `ConnectError` | Kiểm tra mạng/proxy và Supabase project URL. |
| `permission denied` ở SELECT/INSERT/UPDATE | Kiểm tra Data API grants/RLS cho role backend đang dùng; không đổi test thành mock. |
| Lỗi duplicate ID | Test dùng UUID; nếu vẫn xảy ra, giữ nguyên lỗi để điều tra thay vì upsert. |
| Pytest bị skip module Supabase | Đặt `USE_SUPABASE=true` trước khi khởi chạy pytest. |

## 6. Giới hạn vận hành

Runbook này chỉ hướng dẫn test US-03. Không có bằng chứng về pipeline deploy, môi trường production, rollback release hoặc Finance decision endpoint; không thực hiện các bước đó theo tài liệu này.
