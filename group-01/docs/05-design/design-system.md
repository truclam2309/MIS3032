# ProcureAI — Design System

## Phạm vi và trạng thái

Tài liệu này mô tả giao diện đang có trong `Source Code/src/`, không phải file Figma đã được duyệt. Repo chưa có Figma URL. Requirements và Business Rules tiếp tục là nguồn chuẩn nghiệp vụ.

## Màn hình chính

| Màn hình | Người dùng/mục tiêu | Thành phần source |
|---|---|---|
| Requests và chi tiết PR | Tạo/tìm request, theo dõi trạng thái | `pages/Requests.tsx`, `pages/RequestDetail.tsx` |
| Tạo/chỉnh sửa PR | Nhập và hoàn thiện thông tin request | `pages/NewRequest.tsx`, `pages/EditRequest.tsx`, `components/RequestForm.tsx` |
| Approval | Manager xem và quyết định | `pages/Approvals.tsx`, `components/DecisionPanel.tsx` |
| Budget Review | Finance xem số liệu và cảnh báo | `pages/BudgetReview.tsx`, `components/BudgetPanel.tsx` |
| Sourcing/Suppliers | Procurement tìm Supplier và thu thập báo giá | `pages/Sourcing.tsx`, `pages/Suppliers.tsx`, `pages/QuotationCollection.tsx` |
| Quotation Comparison | So sánh báo giá, xem phân tích và chọn Supplier | `pages/Comparison.tsx`, `components/AiAnalysisPanel.tsx`, `components/AnomalyAlerts.tsx` |
| Orders | Theo dõi PO và Receiving | `pages/Orders.tsx`, `pages/OrderDetail.tsx` |
| Login | Đăng nhập prototype | `pages/Login.tsx` |

## Component và trạng thái

| Component | Vai trò |
|---|---|
| `StatusBadge`, `WorkflowProgress`, `RequestTimeline` | Trạng thái, tiến độ và lịch sử PR |
| `RequestForm`, `Field` | Nhập liệu và validation theo trường |
| `DecisionPanel`, `ConfirmDialog` | Chọn và xác nhận quyết định |
| `BudgetPanel`, `AnomalyAlerts` | Hiển thị ngân sách và cảnh báo |
| `QuotationList`, `AiAnalysisPanel`, `AssistantCard` | Báo giá và hỗ trợ AI |
| `ProtectedRoute` | Giới hạn trang theo role |

Các trang có trạng thái rỗng/lỗi như chưa có quotation, không tìm thấy PR, quotation hết hạn hoặc thao tác chưa khả dụng. Cần hiển thị lý do và bước tiếp theo khi validation thất bại.

## Token quan sát được

Tailwind config dùng màu nền `canvas` `#f5f6f8`, `surface` `#ffffff`, chữ `ink` `#12161c`, đường viền `line` `#e4e7ec`; màu nhấn `brand` từ `#eef1ff` đến `#2f3789`; màu trạng thái `ok`, `warn`, `danger`, `info`. Font sans là Inter/system UI; font mono là IBM Plex Mono. Đây là token hiện có trong code, chưa phải quyết định thiết kế được chủ sở hữu duyệt.

## Responsive và nội dung UX

Source dùng utility class responsive của Tailwind. Giữ form, bảng so sánh và hành động chính dễ sử dụng trên màn hình hẹp. Breakpoint/accessibility target cụ thể chưa được đặc tả.

- Dùng nhãn ngắn, rõ cho trạng thái và hành động.
- Đặt lỗi cạnh trường liên quan, nêu cách sửa nếu xác định được.
- Ghi rõ phân tích AI là hỗ trợ; người có quyền quyết định approval và chọn Supplier theo `CON-03`, `REQ-BR-08`.
- Không trình bày recommendation như kết quả chắc chắn khi thiếu dữ liệu.
