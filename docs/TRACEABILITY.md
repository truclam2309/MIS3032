# Traceability Matrix — Final

**Version:** `v1.0.0-final`  
**Nguồn đối chiếu:** Requirements, User Stories, Taiga backlog, mã nguồn, lịch sử Git và QA report trong repository.  
**Ngày lập:** 2026-09-26

## Quy ước và kết luận phạm vi

Ma trận này truy vết 100% các lát cắt đã có bằng chứng triển khai trong repository. “Implemented — chưa xác minh” nghĩa là có code/commit, không có nghĩa là nghiệm thu Done. Theo backlog, các story chỉ ở trạng thái `Ready` hoặc `Planned`; không có story nào được đánh dấu Done. QA report ghi nhận 15 testcase được định nghĩa, 0 thực thi, chưa sign-off. Vì vậy không tuyên bố 100% yêu cầu sản phẩm hoặc acceptance criteria đã hoàn tất.

Các yêu cầu `REQ-FR-01` đến `REQ-FR-18` trong product backlog là scope sản phẩm rộng. Phần được triển khai trong repository tập trung vào tạo/đọc PR, một phần approval và budget. Không có design artifact độc lập đã xác nhận (`docs/04-design/README.md`); cột Design/API dẫn đến API/code thực tế. Backlog là Draft, Task IDs là kế hoạch; mapping task dưới đây là liên kết kế hoạch gần nhất, không phải xác nhận task Taiga đã đóng. Không có PR link riêng cho các commit; ghi commit trực tiếp và PR #1 chỉ ở nơi lịch sử Git xác nhận merge.

## Ma trận

| REQ | Story | Task | Design / API | Commit / PR | Test evidence | Status |
|---|---|---|---|---|---|---|
| `REQ-FR-01` — tạo Purchase Request | `US-01` — Tạo và chuẩn hóa PR | `T-01` form; `T-03` submit (backlog Draft) | `POST /purchase-requests`; UI `NewRequest` và adapter API; [backend-test/main.py](../backend-test/main.py) | `3e93e62` — hoàn thiện workflow/PR API; PR #1 chỉ là merge nền tảng auth, không phải PR của commit này | `test_employee_can_create_and_read_purchase_request` được định nghĩa trong [test_00_main_api.py](../backend-test/test_00_main_api.py); chưa chạy theo QA report | **Implemented một phần; chưa xác minh** — tạo và đọc được mô tả trong test/code; lưu Supabase thật chưa xác minh |
| `REQ-FR-02`, `REQ-BR-01` — kiểm tra PR trước Submit | `US-01` — Tạo và chuẩn hóa PR | `T-02` kiểm tra trường bắt buộc (backlog Draft) | Pydantic `PurchaseRequestInput`, endpoint `POST /purchase-requests`; `RequestForm.tsx` | `3e93e62` — code backend; không có PR riêng được xác nhận | `test_create_request_rejects_invalid_required_values` (3 giá trị tham số hóa); chưa chạy. BUG-003 còn thiếu validation cost center, needed-by, delivery location và items | **Partial / Open** — chỉ một phần trường được backend xác thực |
| `REQ-FR-04` — theo dõi trạng thái PR | `US-02` — Theo dõi PR | `T-04` trạng thái; `T-05` hiển thị status (backlog Draft) | `GET /purchase-requests`, `workflow_for_status`; response có status/workflow | `3e93e62`; không có PR riêng được xác nhận | Cùng test tạo/đọc PR định nghĩa kiểm tra trạng thái và danh sách; chưa chạy | **Implemented một phần; chưa xác minh** — API trả status; chưa có evidence E2E cho nhân viên và refresh |
| `REQ-FR-05`, một phần `REQ-FR-06/07`, `REQ-BR-03` — Manager xem và ra quyết định | `US-03` trong `user-stories.md` — xem/xử lý Approval. Lưu ý mã `US-03` trong Draft Taiga backlog đang chỉ story AI, không khớp tài liệu story | `T-10` review; `T-11` action; liên kết task theo chủ đề từ backlog Draft, không khẳng định đã đóng | `GET /purchase-requests`; `POST /purchase-requests/{request_id}/decision`; `DecisionPanel.tsx`; `workflow_for_status` | `9d6352a` — implement approval; `3f93b7d` — giới hạn workflow theo role; `3e93e62` — hoàn thiện backend workflow. `9d6352a` nằm sau merge PR #1 (`d0cdcac`) trong lịch sử | 5 test được định nghĩa trong [test_approval.py](../backend-test/test_approval.py): approve/reject/revision, cấm employee, chặn quyết định lặp; chưa chạy | **Implemented một phần; chưa xác minh** — Manager decision có code; chuyển Finance chỉ thể hiện trạng thái kế tiếp, chưa có Finance approval endpoint/workflow đã chứng minh |
| `REQ-FR-08/09` — kiểm tra và cảnh báo ngân sách | `US-04` trong `user-stories.md` — Budget (tham chiếu backlog theo nội dung; mã story cần đối chiếu vì Draft backlog đánh số khác) | `T-14` Budget Check; `T-15` cảnh báo (backlog Draft) | `GET /budgets`, `POST /budget-check`, `budget_for`; [backend-test/main.py](../backend-test/main.py) | `3e93e62` nếu thuộc source hiện tại; không có commit riêng/PR xác nhận cho các endpoint | `test_only_finance_and_admin_can_view_budgets` định nghĩa trong `test_00_main_api.py`; chưa chạy. Không thấy test riêng cho vượt ngân sách | **Implemented một phần; chưa xác minh** — kiểm tra API và role có code; cảnh báo trong trải nghiệm end-to-end chưa xác minh |
| `REQ-NFR-02` — RBAC 5 vai trò | `GOV-01` trong Draft backlog; liên hệ auth/approval stories. Backlog chưa đánh dấu Done | `T-37` ma trận; `T-38` quyền action; task dự kiến | OAuth2/JWT, `require_roles`; route Employee/Admin, Finance/Admin, Manager; [security-nfr.md](08-quality/security-nfr.md) | `73955a3` — cập nhật docs/auth; `d0cdcac` — merge PR #1; `3f93b7d` — giới hạn role approval | Test login, cấm manager tạo PR, finance-only budgets và employee-cannot-approve được định nghĩa; tổng suite chưa chạy | **Implemented một phần; chưa xác minh** — role checks có code; toàn bộ 5 vai trò/actions và No Self-Approval chưa được chứng minh đầy đủ |
| `REQ-NFR-03` — Audit Trail | `GOV-02` trong Draft backlog | `T-40` đến `T-42` là kế hoạch backlog | API lưu người quyết định/thời gian trên PR; middleware ghi request ID, thời lượng vào log; chưa có audit-event model đầy đủ | Không tìm thấy commit/PR cho audit trail nghiệp vụ hoàn chỉnh | Test logging request ID được định nghĩa; chưa chạy; đây không chứng minh audit trail nghiệp vụ | **Not Done / gap** — request log không bao phủ đủ action/change history yêu cầu |

## Scope chưa đánh dấu Done

Các REQ bên dưới vẫn thuộc scope tài liệu sản phẩm nhưng không có implementation evidence đủ để ghi Done trong phiên bản này. Chúng được liệt kê nhằm tránh hiểu nhầm ma trận là bao phủ toàn bộ backlog:

| REQ | Story theo requirements | Task / bằng chứng | Status |
|---|---|---|---|
| `REQ-FR-03` | `US-01` | `T-07`–`T-09`; BUG-006 xác nhận parser quy tắc/gợi ý tĩnh, chưa tích hợp AI | **Not Done** |
| `REQ-FR-06/07` phần Finance routing; `REQ-FR-08/09` phần hoàn tất finance approval | `US-03`, `US-04` | Chưa có route/API Finance decision được xác nhận | **Not Done / Partial** |
| `REQ-FR-10`–`REQ-FR-18` | `US-05`–`US-11` theo requirements | Tasks `T-17`–`T-36`; không có implementation/API/test evidence xác nhận trong repository | **Not Done** |
| `REQ-NFR-01` | `US-10` và governance liên quan | Chưa có bằng chứng nhất quán dữ liệu xuyên PR/Approval/Quotation/Budget | **Not Done** |

## Kiểm soát test và phiên bản

- QA report: **15 testcase được định nghĩa; 0 thực thi; pass/fail/skipped đều chưa có kết quả chạy; QA sign-off chưa được cấp**.
- `test_00_main_api.py` có các kiểm tra login, RBAC, tạo/đọc PR, validation một số giá trị, budget access, logging và lỗi 500 an toàn. `test_approval.py` có 5 kiểm tra approval. Đây là test definitions, không phải kết quả chạy.
- Tag `v1.0.0-final` hiện trỏ tới commit `612f80a` (Initial project source and documentation), còn HEAD là `3e93e62`. Vì vậy tag không đại diện cho toàn bộ các commit implementation hiện tại; cần xác nhận/move/recreate tag trong quy trình release riêng trước khi coi tag là snapshot của ma trận này.
- Tỷ lệ truy vết của các lát cắt implementation được liệt kê ở bảng đầu: **100% có đường dẫn requirement/story/task/API-or-design/commit/test/status**. Tỷ lệ này không đồng nghĩa 100% scope product đã Done.
