# ProcureAI — Bối cảnh dự án

> Nội dung này tổng hợp từ tài liệu dự án; không phải biên bản họp hay bằng chứng phỏng vấn mới.

## Bối cảnh

ProcureAI là hệ thống web hỗ trợ mua sắm nội bộ. Quy trình dự kiến: Purchase Request → Approval/Budget review → Collect Quotations → Compare → chọn Supplier → Purchase Order → Receiving → Close.

## Vai trò

- **Employee:** tạo và theo dõi Purchase Request.
- **Manager:** xem xét, approve, reject hoặc yêu cầu chỉnh sửa.
- **Finance:** kiểm tra Budget khi workflow yêu cầu.
- **Procurement:** quản lý Supplier/Quotation, so sánh, chọn Supplier và tạo PO.
- **Admin:** quản lý hệ thống và quyền trong phạm vi MVP.

## Nguyên tắc

- Requirements và Business Rules đã xác nhận là nguồn chuẩn nghiệp vụ.
- AI hỗ trợ chuẩn hóa/phân tích và đề xuất; quyết định thuộc người có thẩm quyền.
- Nghiên cứu hiện nêu giới hạn stakeholder proxy và giả định; cần xác thực với người dùng thực tế.
- Frontend prototype bao phủ nhiều bước hơn backend hiện tại. Giao diện mô phỏng không chứng minh backend đã triển khai chức năng đó.

## Nội dung cần xác nhận

Approval hierarchy/threshold; chính sách Budget; trường PR bắt buộc; tiêu chí đề xuất Supplier; số báo giá tối thiểu; nguồn dữ liệu lịch sử và cách xử lý khi thiếu dữ liệu anomaly. Đối chiếu Requirements và Decision Log để xem mã câu hỏi mở.
