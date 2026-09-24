## BUG-001 — Workflow action không giới hạn theo role

**Summary:**
PR ở trạng thái `pending-approval` vẫn cho phép các role không phụ trách bước Approval mở PR và tiếp cận khu vực thao tác Approval.

**Environment:**
ProcureAI / Frontend React / Vercel Demo / Workflow Purchase Request.

**Reproduction:**

1. Đăng nhập bằng một trong các role `Employee`, `Finance`, `Procurement` hoặc `Admin`.
2. Mở danh sách Purchase Requests.
3. Tìm một PR đang ở trạng thái `pending-approval`.
4. Chọn PR đó.
5. Quan sát khả năng mở PR và các thao tác Approval.
6. Đăng nhập bằng `Manager` và kiểm tra cùng PR.

**Expected:**

* Tất cả role có thể xem thông tin Purchase Request theo phạm vi được phép.
* Với PR ở trạng thái `pending-approval`, chỉ `Manager` được mở PR để thực hiện workflow Approval.
* `Employee`, `Finance`, `Procurement` và `Admin` không được mở PR để xử lý Approval và không hiển thị các nút `Approve`, `Request revision`, `Reject`.
* `Manager` vẫn có thể mở PR và thực hiện các thao tác Approval.

**Actual:**
PR ở trạng thái `pending-approval` hiện vẫn có thể được mở từ danh sách bởi các role không phụ trách bước Approval. Khu vực thao tác Approval cũng chưa được giới hạn hoàn toàn theo role ở frontend.

**Root Cause:**
Frontend `Requests.tsx` đang tạo `<Link>` mở `/requests/:id` cho tất cả Purchase Request mà không kiểm tra role hiện tại khi PR có trạng thái `pending-approval`.

Ngoài ra, `DecisionPanel.tsx` đang kiểm tra trạng thái `pending-approval` nhưng chưa giới hạn phần Approval actions theo role `Manager`.

Backend đã giới hạn endpoint Approval ở `Manager`, nhưng frontend chưa đồng bộ đầy đủ rule này ở lớp hiển thị và điều hướng.

**Solution:**

* Kiểm tra role hiện tại khi render PR ở trạng thái `pending-approval`.
* Chỉ cho `Manager` click/mở PR ở trạng thái `pending-approval`.
* Các role khác vẫn nhìn thấy PR nhưng không có link mở vào workflow Approval.
* Trong `DecisionPanel.tsx`, chỉ `Manager` được render các nút `Approve`, `Request revision`, `Reject`.
* Giữ backend authorization để ngăn truy cập trái phép ngay cả khi người dùng cố truy cập URL trực tiếp.

**Regression Risk:**
Medium

Thay đổi logic điều hướng Purchase Request và quyền thao tác theo workflow state, có khả năng ảnh hưởng đến việc xem PR của các role khác.

**Test Plan:**

* **Unit/UI:** kiểm tra PR `pending-approval` không tạo link mở PR cho Employee, Finance, Procurement và Admin.
* **UI:** kiểm tra Manager vẫn mở được PR `pending-approval` và thấy đầy đủ Approval actions.
* **Authorization:** kiểm tra Employee/Finance/Procurement/Admin không thể thực hiện Approval actions.
* **Regression:** chạy toàn bộ backend approval tests và kiểm tra lại các trạng thái workflow liên quan.
* **E2E:** đăng nhập từng role, mở danh sách PR và kiểm tra quyền truy cập PR `pending-approval`.

**Evidence:**

* Before-fix: `BUG-001-role-workflow-permission.mp4`
* After-fix / regression: `BUG-001-after-regression.mp4`
* Backend regression test: `5 passed` sau khi fix.

**Owner:**
Development Team

**Status:**
Fixed
