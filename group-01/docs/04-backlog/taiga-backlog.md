# ProcureAI — Backlog sẵn sàng nhập Taiga

## Trạng thái

Đây là bản backlog trong repo để nhập vào Taiga. Chưa có project Taiga hoặc quyền truy cập dịch vụ được cung cấp, nên chưa ghi nhận item nào đã được tạo bên ngoài. Stories và acceptance criteria chuẩn vẫn nằm trong [`../03-product/user-stories.md`](../03-product/user-stories.md).

## Epic và User Story

| Epic | Tên Epic | Story | Requirement | Ưu tiên | Estimate hiện có | Owner | Trạng thái | Liên kết |
|---|---|---|---|---|---:|---|---|---|
| EPIC-01 | Purchase Request | US-01 — Tạo và chuẩn hóa PR | REQ-FR-01–03 | Must/Should theo từng REQ | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-01.md) |
| EPIC-01 | Purchase Request | US-02 — Theo dõi PR | REQ-FR-04 | Must | 2 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-02.md) |
| EPIC-02 | Approval & Budget | US-03 — Xem và xử lý Approval | REQ-FR-05–07 | Must | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-03.md) |
| EPIC-02 | Approval & Budget | US-04 — Kiểm tra Budget | REQ-FR-08–09 | Must | 2 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-04.md) |
| EPIC-03 | Supplier & Quotation | US-05 — Quản lý Supplier/thu thập Quotation | REQ-FR-10–11 | Must/Should theo từng REQ | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-05.md) |
| EPIC-03 | Supplier & Quotation | US-06 — So sánh Quotation | REQ-FR-12 | Must | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-06.md) |
| EPIC-03 | Supplier & Quotation | US-07 — AI phân tích/Recommendation | REQ-FR-13–14 | Must/Should theo từng REQ | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-07.md) |
| EPIC-03 | Supplier & Quotation | US-08 — AI cảnh báo bất thường | REQ-FR-15 | Should | 2 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-08.md) |
| EPIC-04 | Purchase Order | US-09 — Chọn Supplier/tạo PO | REQ-FR-16 | Must | 3 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-09.md) |
| EPIC-05 | Receiving & Close | US-10 — Ghi nhận Receiving | REQ-FR-17 | Must | 2 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-10.md) |
| EPIC-05 | Receiving & Close | US-11 — Đóng PR | REQ-FR-18 | Must | 2 pts | TBD | Chưa nhập Taiga | [Story](../03-product/user-stories.md), [Spec](../06-technical/story-specs/US-11.md) |

Estimate được giữ theo User Stories hiện có; không tự thêm estimate cho task kỹ thuật. Owner và trạng thái Taiga thực tế cần nhóm cập nhật khi tạo project.

## Task kỹ thuật đề xuất

Các task dưới đây là khoảng trống triển khai suy ra từ source/backend, chưa phải Taiga task đã được tạo.

| Task | Nội dung | Ưu tiên gợi ý | Story liên quan |
|---|---|---|---|
| TASK-01 | Đồng bộ request form với API; xác định/triển khai AI hỗ trợ PR | Must/Should theo REQ-FR | US-01 |
| TASK-02 | Kết nối list/detail frontend với API và xác định quyền xem | Must | US-02 |
| TASK-03 | Hoàn thiện Finance handoff, revision resubmission và audit events | Must | US-03 |
| TASK-04 | Quyết định nơi lưu Budget và triển khai Finance decision flow | Must | US-04 |
| TASK-05 | Thiết kế Supplier/Quotation schema, upload, phân quyền, chuẩn hóa | Must | US-05 |
| TASK-06 | Lưu quotation và cung cấp API so sánh | Must | US-06 |
| TASK-07 | Đặc tả AI analysis/recommendation có bằng chứng, giữ human review | Must/Should theo REQ-FR | US-07 |
| TASK-08 | Xác nhận dữ liệu lịch sử và triển khai kiểm tra giá bất thường | Should | US-08 |
| TASK-09 | Lưu lựa chọn Supplier/PO và enforce điều kiện tạo PO | Must | US-09 |
| TASK-10 | Lưu Receiving, partial receipt và kiểm tra số lượng | Must | US-10 |
| TASK-11 | Thiết kế đối soát và enforce điều kiện Close | Must | US-11 |
| TASK-12–14 | Nhất quán dữ liệu, phân quyền đối tượng, Audit Trail | Must | NFR-01–03 |

## Trường cần hoàn thiện khi nhập Taiga

Tạo project/epic, gán owner, xác nhận priority, estimate và trạng thái thật; liên kết Taiga item với story, Requirement, spec và task kỹ thuật tương ứng.
