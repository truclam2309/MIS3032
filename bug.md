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

**Phát hiện ban đầu:**
PR ở trạng thái `pending-approval` có thể được mở từ danh sách bởi role không phụ trách bước Approval; khu vực thao tác cũng chưa được giới hạn role ở frontend. Đây là mô tả lúc ghi nhận bug, chưa phải kết quả kiểm tra frontend hiện tại.

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

**Bằng chứng hiện có:**

* Backend có kiểm tra Manager-only; bộ test approval gần nhất: 5 test local pass và 5 test Supabase pass.
* Chưa xác minh hai video nêu trước đây có trong repo hay chưa; không dùng chúng làm bằng chứng.
* Chưa có kết quả chạy UI/unit/E2E trong lần rà soát này, nên chưa thể xác nhận phần frontend đã sửa.

**Owner:**
Development Team

**Status:**
Đã xác nhận ở backend; frontend chưa xác minh. Trạng thái tổng thể: một phần / cần kiểm tra UI.

---

## BUG-002 — Submit Purchase Request chưa lưu qua backend

**Summary:**
Khi Employee gửi Purchase Request trên prototype `frontend-test`, ứng dụng chỉ thêm request vào React state trong trình duyệt. Request không được gửi tới backend và sẽ mất khi tải lại trang.

**Environment:**
`Source-Code/src/pages/NewRequest.tsx`, `Source-Code/src/contexts/ProcurementContext.tsx`; backend API `POST /purchase-requests`.

**Reproduction:**

1. Mở prototype frontend.
2. Điền tên yêu cầu, phòng ban, giá trị, danh mục và lý do.
3. Chọn **Gửi yêu cầu**.
4. Quan sát request mới xuất hiện trên trang.
5. Tải lại trang và xác nhận request mới biến mất.

**Expected:**

* Frontend gửi payload hợp lệ tới `POST /purchase-requests`.
* Backend xác thực, lưu request vào storage đang cấu hình (Supabase khi `USE_SUPABASE=true`, memory khi false) và trả record đã tạo.
* Frontend chỉ báo gửi thành công sau phản hồi thành công từ backend; khi API lỗi thì giữ dữ liệu form và hiển thị lỗi.

**Actual:**

Trước khi sửa, `submit` tạo ID ở frontend và chỉ gọi `setRequests(...)`, không có request HTTP.

**Root Cause:**

`frontend-test/src/App.tsx` triển khai submit và danh sách như một prototype local. Trong code hiện tại, backend đã có `POST /purchase-requests` và router có nhánh insert Supabase, nhưng frontend-test không kết nối endpoint đó.

**Cách sửa:**

* `AuthContext` đăng nhập qua `/auth/login`, lưu JWT cùng phiên đăng nhập; `ProcurementContext` gửi POST có bearer token.
* Gửi payload theo contract backend hiện tại: title, department, tổng amount, category, justification và requester.
* Chỉ thêm record vào state và điều hướng sau phản hồi thành công; API lỗi được đưa vào thông báo chung, không báo thành công giả.
* Form khóa nút trong lúc submit; URL backend cấu hình bằng `VITE_API_URL`.

**Regression Risk:**
Medium — cần giữ validation ngân sách/form hiện tại và xử lý lỗi mạng/API mà không tạo thông báo thành công giả.

**Test Plan:**

* Xác nhận request POST có payload đúng và phản hồi 201 được hiển thị trong danh sách.
* Xác nhận tải lại trang vẫn lấy được request đã lưu từ backend (nếu danh sách được nối với GET API).
* Xác nhận lỗi backend không xóa dữ liệu nhập hoặc hiển thị thành công.

**Bằng chứng hiện có:**

* Đã sửa luồng submit của app chính trong `Source-Code` và nối xác thực frontend với backend.
* Chưa chạy được build app chính vì thư mục chưa có dependencies; `npm run build` thử chạy `npx vite` nhưng môi trường chặn tải package với `ENOTCACHED`.
* Chưa chạy thao tác trình duyệt hoặc xác nhận insert thật vào Supabase.

**Status:**
Đã nối luồng submit trong app chính; cần cài dependencies và chạy backend/frontend cùng nhau để xác nhận insert thật và tương thích CORS trên môi trường.
