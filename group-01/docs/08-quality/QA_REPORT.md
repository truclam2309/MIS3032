# Báo cáo kiểm thử — US-03: Xem và xử lý Approval

## 1. Phạm vi

Kiểm tra 5 hành động chính của US-03 ở backend:

1. Manager duyệt Purchase Request.
2. Manager từ chối Purchase Request.
3. Manager yêu cầu chỉnh sửa.
4. Employee không được phép quyết định.
5. Không được duyệt lại Purchase Request đã duyệt.

Kiểm tra trên cả kho dữ liệu trong bộ nhớ và Supabase thật. Không đánh giá các User Story khác.

## 2. Môi trường và kết quả

Ngày kiểm tra: 2026-09-26. Python 3.11.1, pytest 9.1.1, FastAPI TestClient.

| Bộ kiểm thử | Kết quả | Bằng chứng |
|---|---:|---|
| Backend dùng bộ nhớ | 5/5 đạt | [`backend-test/test_approval.py`](../../../backend-test/test_approval.py) |
| Backend dùng Supabase thật | 5/5 đạt | [`backend-test/test_approval_supabase.py`](../../../backend-test/test_approval_supabase.py) |
| Build và kiểm thử giao diện | Chưa chạy trong lần kiểm tra này | Chưa có kết quả build/UI test để xác nhận |

Test Supabase đã ghi request thử có mã `PR-TEST-<UUID>` rồi đọc dữ liệu sau quyết định. Role Supabase hiện dùng cho test không có quyền `DELETE`, vì vậy các dòng test được giữ lại với mã riêng.

## 3. Đối chiếu Acceptance Criteria

| Tiêu chí US-03 | Trạng thái | Nhận xét |
|---|---|---|
| AC1 — Manager xem thông tin PR đang chờ duyệt | Một phần | API có `GET /purchase-requests`; chưa có kiểm thử giao diện hoặc quyền xem theo phạm vi Manager. |
| AC2 — Manager approve và tiếp tục workflow | Một phần | Approve lưu người duyệt/thời điểm/comment, đặt `APPROVED` và hiển thị Finance là bước kế tiếp; chưa có endpoint để Finance quyết định. |
| AC3 — Manager reject hoặc yêu cầu sửa | Đạt ở backend | Cả hai trạng thái và thông tin người thực hiện được lưu; test memory và Supabase đều đạt. |
| AC4 — Chuyển theo workflow được cấu hình | Chưa hoàn tất | Workflow hiện hard-code Manager → Finance → Procurement; Finance handoff/decision và cấu hình hierarchy chưa triển khai. |

## 4. Vấn đề còn lại

- Chưa có bước API để Finance tiếp tục duyệt sau Manager.
- Chưa có gửi lại PR sau khi yêu cầu chỉnh sửa.
- Metadata quyết định được lưu trên PR, nhưng chưa có audit log append-only ghi lịch sử nhiều lần xử lý.
- Chưa chạy UI/E2E để xác nhận ẩn nút/điều hướng theo role; chưa xác nhận BUG-001 frontend đã được sửa.
- Chưa chạy build frontend trong lần kiểm tra này.

## 5. Rủi ro

| Rủi ro | Mức độ | Kiểm soát hiện có |
|---|---|---|
| Người không phải Manager gọi endpoint quyết định | Cao | Backend yêu cầu role `manager`; test Employee bị từ chối. |
| Quyết định đồng thời ghi đè nhau ở Supabase | Cao | Update có điều kiện `status=PENDING_APPROVAL`; test không mô phỏng race với DB thật. |
| UI hiển thị quyền khác backend | Trung bình | Chưa có UI/E2E test xác nhận. |
| Finance handoff chưa thực hiện đủ | Cao | Đã ghi nhận là phần còn thiếu, không coi AC4 hoàn thành. |

## 6. Kết luận

**Kết quả kiểm thử backend US-03: ĐẠT (5/5 memory, 5/5 Supabase).**

**Trạng thái toàn bộ US-03: ĐANG HOÀN THIỆN.** AC4 và xác minh UI chưa hoàn tất; không kết luận toàn bộ story đã release-ready.
