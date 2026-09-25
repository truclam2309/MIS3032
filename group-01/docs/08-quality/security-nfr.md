# Bằng chứng bảo mật và yêu cầu phi chức năng — US-03

## 1. Phân quyền (RBAC)

Quyết định Approval ở API hiện chỉ dành cho Manager. Admin không có quyền Approval theo phạm vi đã xác nhận.

| Vai trò | Gọi endpoint quyết định | Kết quả mong đợi |
|---|---:|---|
| Employee | Không | `403 Forbidden` |
| Manager | Có | Được xử lý PR đang `PENDING_APPROVAL` |
| Finance | Không ở endpoint hiện tại | `403 Forbidden`; chưa có endpoint Finance riêng |
| Procurement | Không | `403 Forbidden` |
| Admin | Không | `403 Forbidden` |

Backend áp dụng `Depends(require_roles("manager"))` tại `backend-test/routers/approval.py`. Không dựa riêng vào việc ẩn nút trên frontend.

Test hiện tại trong `test_approval.py` và `test_approval_supabase.py` xác minh Employee bị từ chối; chưa có test riêng cho Finance, Procurement và Admin trong bộ 5 case rút gọn.

## 2. Xác thực và kiểm tra dữ liệu

- API dùng Bearer JWT; token demo có thời hạn 60 phút.
- Người dùng không xác thực bị FastAPI từ chối trước khi vào handler.
- `action` chỉ nhận `approved`, `rejected`, `revision` theo Pydantic `Literal`.
- Chỉ PR có trạng thái `PENDING_APPROVAL` được xử lý; quyết định lặp trả `400`.
- PR không tồn tại trả `404`; sai role trả `403`.
- Test 5 case hiện tập trung vào action nghiệp vụ; thiếu test chuyên biệt cho token sai/hết hạn, PR không tồn tại và payload validation.

## 3. Lưu trữ và tính toàn vẹn

- Bật `USE_SUPABASE=true`: backend dùng client Supabase dùng chung; quyết định cập nhật có điều kiện cả `id` và `status=PENDING_APPROVAL` để tránh ghi đè khi trạng thái đã đổi.
- Tắt Supabase: request nằm trong bộ nhớ tiến trình, không bền vững khi tiến trình dừng.
- Bảng `purchase_requests` lưu trạng thái và metadata approve/reject/revision. Chưa có bảng audit append-only để lưu nhiều sự kiện lịch sử.
- Test Supabase dùng publishable key/role hiện cấu hình cho project; thao tác insert/select/update đã được kiểm chứng. Chưa rà toàn bộ RLS policy và quyền Data API ngoài các thao tác test.
- Role Supabase của test không có quyền `DELETE`; dòng test dùng ID ngẫu nhiên `PR-TEST-...` và được giữ lại.

## 4. Secrets và cấu hình

- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` và `SECRET_KEY` lấy từ biến môi trường/`.env`; không đưa giá trị bí mật vào tài liệu hoặc log.
- Khi bật Supabase mà thiếu URL/key, `database.py` dừng với lỗi cấu hình thay vì chuyển sang memory.
- `config.py` hiện có secret JWT mặc định dành cho demo. Đây là rủi ro nếu triển khai mà không đặt `SECRET_KEY` riêng; chưa có kiểm tra tự động để cấm secret mặc định trong môi trường production.

## 5. Dependency, hiệu năng, accessibility và logging

| Hạng mục | Bằng chứng hiện có | Trạng thái |
|---|---|---|
| Dependency/security scan | Chưa có kết quả scan được lưu | Chưa đánh giá |
| Hiệu năng endpoint | Chưa có benchmark/load test | Chưa đánh giá |
| Accessibility của UI Approval | Chưa có audit hoặc test tự động | Chưa đánh giá |
| Logging/audit trail | Có metadata quyết định trên PR; chưa có audit event đầy đủ | Chưa đáp ứng đầy đủ REQ-NFR-03 |

## 6. Liên kết kiểm thử

- [Test bộ nhớ](../../../backend-test/test_approval.py)
- [Test Supabase thật](../../../backend-test/test_approval_supabase.py)
- [Báo cáo QA US-03](QA_REPORT.md)
