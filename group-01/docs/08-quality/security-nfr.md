# Bằng chứng An toàn thông tin và NFR — US-01

**Ngày:** 2026-09-26  
**Phạm vi:** Xác thực Employee và tạo Purchase Request (US-01 / REQ-NFR-01–03)  
**Trạng thái bằng chứng:** Đã rà soát mã nguồn/cấu hình; CI đã được cấu hình nhưng chưa chạy trong workspace này.

## Phân quyền theo vai trò (RBAC)

| Kiểm soát | Bằng chứng | Trạng thái / khoảng trống |
|---|---|---|
| Token bắt buộc với endpoint được bảo vệ | `backend-test/main.py`: OAuth2 bearer dependency dùng cho route user, budget và request | Đã triển khai trong API; bộ test chưa chạy tại đây |
| Kiểm tra role ở API | `require_roles`; chỉ Employee/Admin tạo request; Finance/Admin xem budget; chỉ Manager ra quyết định | Đã triển khai; `test_00_main_api.py` và `test_approval.py` có testcase, chờ CI chạy |
| Kiểm tra role ở route giao diện | `Source Code/src/components/ProtectedRoute.tsx`, khai báo route trong `Source Code/src/App.tsx` | Có kiểm tra ở UI; backend vẫn là lớp phân quyền có thẩm quyền |
| Nguồn danh tính production | Tài khoản demo và mật khẩu dùng chung được khai báo trong `backend-test/main.py` | **Khoảng trống an toàn thông tin:** thay kho tài khoản/credential demo trước khi triển khai production |

## Kiểm tra dữ liệu

- Pydantic ở API hiện yêu cầu title dài 3–120 ký tự, amount dương và justification dài ít nhất 5 ký tự (`PurchaseRequestInput` trong `backend-test/main.py`). `Decision.action` giới hạn các giá trị action hợp lệ.
- Form kiểm tra trường bắt buộc và line item có số lượng/đơn giá dương tại `Source Code/src/components/RequestForm.tsx`.
- **Khoảng trống:** API vẫn chấp nhận thiếu/rỗng `costCenter`, `neededBy`, `deliveryLocation` và line items; có thể bỏ qua validation phía client. Theo dõi tại BUG-003 và chuyển validation bắt buộc về server.
- Ràng buộc SQL kiểm tra amount dương, độ dài title và workflow state hợp lệ (`supabase/migrations/001_create_purchase_requests.sql`). Migration 002 bổ sung chi tiết request dạng JSONB; cần chạy migration trước khi triển khai với Supabase.

## Bí mật và phản hồi lỗi

- Git bỏ qua `.env`; `.env.example` chỉ có giá trị mẫu cho phát triển, không có thông tin xác thực Supabase. `*.evn` cũng bị bỏ qua để bảo vệ file môi trường có tên viết nhầm.
- API đọc `SECRET_KEY` từ môi trường. Môi trường phát triển có khóa dự phòng chỉ dùng cục bộ; production từ chối khởi động nếu thiếu khóa hoặc khóa ngắn hơn 32 ký tự.
- URL Supabase và publishable key được cấu hình ở môi trường server. Không đặt service-role/secret key trong mã frontend và không commit file môi trường đã điền giá trị thật.
- Bearer token frontend được lưu trong `localStorage`; đây là rủi ro XSS đã biết của bản demo. Production nên dùng thiết kế phiên đã được rà soát, ưu tiên cookie HttpOnly an toàn kèm kiểm soát CSRF.
- Exception API không được xử lý trả về thông báo chung `Internal server error` cùng request ID. Response không chứa nội dung exception hay Python traceback. Server log request ID, path và loại exception để đối chiếu.
- `backend-test/test_00_main_api.py` có testcase kiểm tra log request ID/thời gian và response 500 không lộ traceback; các testcase này chưa chạy trong workspace.
- **Khoảng trống:** tài khoản và mật khẩu demo vẫn có trong backend. `APP_ENV=production` hiện chặn khởi động theo hướng fail-closed; sau khi thay bằng hệ thống xác thực được quản lý, cần rà soát chốt này trước khi triển khai.

## Kiểm tra dependency

- Dependency runtime/test của backend khai báo trong `backend-test/pyproject.toml`; frontend dùng `Source Code/package-lock.json`.
- `.github/workflows/ci.yml` chạy `pip-audit` và `npm audit --audit-level=high`; phát hiện mức High trở lên sẽ làm bước xác minh thất bại.
- CI cũng chạy backend tests, build frontend production và build Docker image trước khi publish.
- **Bằng chứng thực thi:** CI đã được cấu hình nhưng chưa có kết quả chạy đính kèm báo cáo. Python environment tại máy trước đó trả về `No module named pytest`; xem `QA_REPORT.md`. Vì vậy trạng thái lỗ hổng dependency **chưa được xác minh**.
- Các file test backend hiện định nghĩa 17 testcase (12 API/an toàn thông tin, gồm ca tham số hóa, và 5 ca approval); chờ CI thực thi.
- Các dải phiên bản dependency Python hiện chưa được khóa trong `backend-test/uv.lock`; CI cài từ `pyproject.toml`. Cần tạo/cập nhật lockfile nếu dự án thống nhất dùng uv.

## Hiệu năng cơ bản

- Middleware API ghi thời gian xử lý request theo mili giây, kèm method, path, status và request ID. `/health` là endpoint readiness gọn nhẹ.
- Compose kiểm tra API `/health` và frontend `/health` mỗi 30 giây với timeout/số lần thử giới hạn; frontend chờ API khỏe trước khi khởi chạy.
- Container API và frontend dùng root filesystem chỉ đọc khi hỗ trợ; backend chạy bằng user không phải root. Compose bật `no-new-privileges`.
- Chưa đo tải, percentile độ trễ hoặc thông lượng. Health check chỉ xác nhận dịch vụ hoạt động, không chứng minh năng lực chịu tải.

## Trợ năng cơ bản

- Trường form có `<label>` liên kết (`FieldShell` trong `Source Code/src/components/Field.tsx`). Trường lỗi có `aria-invalid` và `aria-describedby`; lỗi ứng dụng dùng `role="alert"` trong `AppShell.tsx`.
- **Bằng chứng thực thi:** chưa ghi nhận quét axe tự động, rà soát chỉ dùng bàn phím hoặc screen reader. Chưa xác minh mức tuân thủ trợ năng ngoài rà soát mã nguồn.

## Logging và điều tra sự cố

- HTTP log có request ID, method, path, status và thời gian xử lý. Log xác thực ghi kết quả cùng user ID/role, không ghi password/token. Log tạo/quyết định PR ghi PR ID, actor ID/role và action.
- Error response có request ID để đối chiếu server log; nội dung exception, secret và stack trace không được trả về client.
- Log được ghi vào stdout/stderr của container và xem bằng `docker compose logs`; thời hạn lưu, quyền truy cập và lưu trữ tập trung thuộc trách nhiệm triển khai và chưa được cấu hình.

## Phê duyệt

**Trạng thái an toàn thông tin/NFR: Một phần; chưa phê duyệt production.** Mã/cấu hình đã có RBAC, request correlation, phản hồi lỗi chung, health check và dependency audit trong CI. Việc chạy test/quét dependency, rà soát trợ năng, đo hiệu năng, quản lý danh tính production và khắc phục validation server còn thiếu vẫn đang chờ.
