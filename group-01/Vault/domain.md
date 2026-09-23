# Domain — ProcureAI

## 1. Domain Overview

ProcureAI là hệ thống quản lý mua sắm nội bộ, hỗ trợ doanh nghiệp
kiểm soát Purchase Request, Approval, Quotation, Purchase Order,
Receiving và quá trình đóng yêu cầu.

Workflow chính:

Request
→ Approval
→ Collect Quotations
→ Compare Quotations
→ Purchase Order
→ Receiving
→ Reconcile
→ Close

---

## 2. Actors

### Employee
- Tạo Purchase Request.
- Xem Purchase Request của mình.
- Theo dõi trạng thái xử lý.

### Manager
- Xem Purchase Request cần phê duyệt.
- Approve.
- Reject.
- Request Revision.

### Finance
- Kiểm tra ngân sách.
- Thực hiện các bước tài chính theo workflow.

### Procurement
- Quản lý Supplier.
- Quản lý Quotation.
- So sánh Quotation.
- Tạo Purchase Order.
- Quản lý Receiving.

### Admin
- Quản trị hệ thống và người dùng.
- Quyền thực tế phải được backend kiểm soát theo authorization rules.

---

---

## 3. Main Domain Entities (Các thực thể miền chính)

Dưới đây là các thực thể dữ liệu cốt lõi trong hệ thống phục vụ việc thiết kế Cơ sở dữ liệu (Database Schema) và Luồng nghiệp vụ:

###  Purchase Request (PR)
Thực thể trung tâm lưu trữ thông tin yêu cầu mua sắm do Employee khởi tạo.
* **Attributes:** `PR_ID`, `Requester_ID`, `Department_ID`, `Title`, `Reason`, `Total_Amount`, `Status` *(Draft, Submitted, Pending_Manager, Pending_Finance, Approved, Rejected, Revision_Required)*, `Created_At`, `Updated_At`.
* **Relationships:**
  * Thuộc về 1 `User` (Requester).
  * Chứa nhiều `PR Line Items`.
  * Liên kết với 1 `Approval Audit Log`.
  * Liên kết với nhiều `Quotations`.

###  PR Line Item (Chi tiết sản phẩm/dịch vụ trong PR)
Chi tiết từng mặt hàng hoặc dịch vụ được yêu cầu trong PR.
* **Attributes:** `Item_ID`, `PR_ID`, `Item_Name`, `Category`, `Quantity`, `Estimated_Unit_Price`, `Total_Price`, `Specifications` (Mô tả kỹ thuật), `AI_Standardized_Flag` (Trạng thái AI đã chuẩn hóa hay chưa).

###  User & Role (Nơi lưu thông tin người dùng và phân quyền)
Quản lý thông tin tài khoản và vai trò người dùng trong quy trình.
* **Attributes:** `User_ID`, `Full_Name`, `Email`, `Department_ID`, `Role` *(Employee, Manager, Procurement, Finance, Admin)*, `Status`.

###  Budget (Ngân sách)
Thực thể lưu trữ hạn mức ngân sách phòng ban/dự án phục vụ kiểm tra và phê duyệt.
* **Attributes:** `Budget_ID`, `Department_ID`, `Fiscal_Year`, `Total_Budget`, `Allocated_Amount`, `Spent_Amount`, `Remaining_Amount`.

### Supplier (Nhà cung cấp)
Lưu trữ thông tin các đối tác/nhà cung cấp dịch vụ.
* **Attributes:** `Supplier_ID`, `Supplier_Name`, `Tax_Code`, `Contact_Email`, `Phone`, `Address`, `Rating`, `Status`.

###  Quotation (Báo giá)
Báo giá chi tiết do Procurement thu thập từ Supplier cho một PR cụ thể.
* **Attributes:** `Quotation_ID`, `PR_ID`, `Supplier_ID`, `Quotation_Number`, `Total_Amount`, `Delivery_Terms`, `Payment_Terms`, `Attachment_URL`, `AI_Anomaly_Warning` (Cảnh báo lệch giá từ AI: True/False), `Status` *(Received, Under_Review, Selected, Rejected)*.

###  Purchase Order (PO)
Đơn đặt hàng chính thức được tạo sau khi PR được phê duyệt và Supplier được chọn.
* **Attributes:** `PO_ID`, `PR_ID`, `Selected_Quotation_ID`, `Supplier_ID`, `PO_Number`, `Total_Value`, `Issued_Date`, `Status` *(Created, Sent_To_Supplier, Partially_Received, Closed)*.

###  Receiving Log (Nhật ký giao nhận)
Ghi nhận số lượng hàng hóa/dịch vụ thực tế đã bàn giao từ Supplier.
* **Attributes:** `Receiving_ID`, `PO_ID`, `Received_By_User_ID`, `Received_Date`, `Quantity_Received`, `Notes`, `Status` *(Pass, Damaged, Incomplete)*.

### 9. Approval / Audit Log (Nhật ký phê duyệt)
Lưu vết toàn bộ quá trình phê duyệt và các tương tác của AI (Audit Trail).
* **Attributes:** `Log_ID`, `PR_ID`, `Actor_ID` (User hoặc AI), `Action` *(Submit, Approve, Reject, AI_Recommend, AI_Standardize)*, `Comments`, `Timestamp`.
