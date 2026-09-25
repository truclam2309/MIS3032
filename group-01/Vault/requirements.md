# ProcureAI — Requirements và Business Rules

## Nguồn chuẩn

Đây là bản tóm tắt để tra cứu trong Vault. Requirements đầy đủ nằm tại [`docs/02-requirements/requirements.md`](../docs/02-requirements/requirements.md). Nếu nội dung khác nhau, đối chiếu nguồn chuẩn và ghi câu hỏi mở; không tự chọn hoặc tạo rule mới.

## Yêu cầu chức năng

| Nhóm | Requirement |
|---|---|
| Purchase Request | `REQ-FR-01`–`REQ-FR-04`: tạo/quản lý PR, kiểm tra thông tin trước khi gửi, AI hỗ trợ chuẩn hóa, theo dõi trạng thái |
| Approval và Budget | `REQ-FR-05`–`REQ-FR-09`: Manager xem và xử lý PR; Finance kiểm tra Budget; cảnh báo khi vượt ngân sách |
| Supplier và Quotation | `REQ-FR-10`–`REQ-FR-15`: quản lý Supplier/Quotation, chuẩn hóa và so sánh, AI phân tích/đề xuất/cảnh báo giá |
| PO, Receiving, Close | `REQ-FR-16`–`REQ-FR-18`: chọn Supplier/tạo PO, ghi nhận nhận hàng, đóng PR sau khi hoàn tất |

## Yêu cầu phi chức năng

- `REQ-NFR-01`: quản lý nhất quán dữ liệu PR, Approval, Quotation và Budget.
- `REQ-NFR-02`: phân quyền Employee, Manager, Procurement, Finance và Admin.
- `REQ-NFR-03`: ghi Audit Trail để theo dõi xử lý và Approval.

## Business Rules

- `REQ-BR-01`: PR cần đủ thông tin trước khi gửi.
- `REQ-BR-02`: PR phải được duyệt trước khi thu thập Quotation.
- `REQ-BR-03`: Manager xem xét và quyết định các PR thuộc phạm vi.
- `REQ-BR-04`: Finance kiểm tra Budget khi workflow yêu cầu; Manager có thể chuyển PR sang Finance.
- `REQ-BR-05`: PR vượt giới hạn Budget phải được cảnh báo.
- `REQ-BR-06`–`REQ-BR-07`: chỉ thu thập báo giá sau khi duyệt và phải liên kết báo giá với PR.
- `REQ-BR-08`–`REQ-BR-09`: AI chỉ đề xuất dựa trên dữ liệu/tiêu chí so sánh; Procurement quyết định Supplier.
- `REQ-BR-10`: chỉ tạo PO khi PR đã duyệt và Supplier đã chọn.
- `REQ-BR-11`: chỉ đóng PR sau khi Receiving và các bước liên quan hoàn tất.

## Ràng buộc và câu hỏi mở

MVP là ứng dụng web, tập trung 5 vai trò; AI hỗ trợ chứ không thay người quyết định; không tích hợp ERP/kế toán tổng hợp. Approval hierarchy, Budget threshold, số Quotation tối thiểu và dữ liệu lịch sử phát hiện giá bất thường cần được xác nhận theo các `Q-*`/`ASM-*` trong Requirements nguồn. Không nâng giả định thành Business Rule.

## Phạm vi triển khai hiện tại

Requirements mô tả phạm vi sản phẩm. Backend hiện có auth demo, một số endpoint Budget/PR và quyết định Manager; Supplier/Quotation/AI/PO/Receiving/Close chưa có API/schema tương ứng. Đối chiếu tại [`docs/06-technical/TRACEABILITY.md`](../docs/06-technical/TRACEABILITY.md).
