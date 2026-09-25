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

---

## BUG-002 — Submit Purchase Request chưa lưu qua backend

**Summary:**
Submit trên form US-01 chỉ thêm Purchase Request vào state trong bộ nhớ của frontend, nên request không được lưu bền vững và biến mất khi tải lại trang.

**Environment:**
RoomFlow / React frontend / `Source Code/src/pages/NewRequest.tsx` / Purchase Request flow.

**Reproduction:**

1. Đăng nhập bằng Employee.
2. Mở `New purchase request` và điền đầy đủ các trường bắt buộc cùng line item hợp lệ.
3. Chọn `Submit for approval`.
4. Mở request vừa tạo, sau đó tải lại trang hoặc mở lại ứng dụng.
5. Kiểm tra request vừa tạo.

**Expected:**

* Submit gửi dữ liệu đến API và lưu Purchase Request.
* Request vẫn tồn tại sau khi tải lại trang và có thể được tải lại từ backend.

**Actual:**
`NewRequest.tsx` gọi `createRequest` từ `ProcurementContext`; hàm này chỉ cập nhật React state. Không có lời gọi API ở luồng tạo request này, nên dữ liệu mới không được lưu bền vững.

**Root Cause:**
Luồng tạo PR trong frontend hiện là prototype dùng dữ liệu seed/local state. Chưa tích hợp `createRequest` với endpoint `POST /purchase-requests` và chưa tải danh sách từ backend.

**Solution:**

* Tích hợp submit với endpoint tạo Purchase Request.
* Chuyển đổi payload form sang schema API đã thống nhất.
* Cập nhật state từ response của API và hiển thị lỗi nếu lưu thất bại.
* Tải lại request từ backend khi khởi tạo ứng dụng.

**Regression Risk:**
Medium

Thay đổi nguồn dữ liệu của PR từ local state sang API, có thể ảnh hưởng đến danh sách, chi tiết và các luồng tiếp theo.

**Test Plan:**

* **Unit:** kiểm tra submit tạo payload API đúng và xử lý response/lỗi.
* **Integration:** tạo PR qua API, xác nhận dữ liệu được lưu và đọc lại được.
* **E2E:** tạo PR, tải lại trang và xác nhận PR còn hiển thị.

**Resolution:**

* Frontend lấy JWT từ API login, gửi POST khi Submit và tải lại các PR đã lưu từ API.
* Request response được chuyển thành model frontend; lỗi từ API được đưa ra thông báo trong ứng dụng.
* Backend lưu các trường chi tiết form trong cột JSONB `details`; migration `002` bổ sung cột này.
* Backend bật CORS cho Vite dev origin để frontend gọi API.

**Owner:**
Development Team

**Status:**
Fixed (verification pending)

---

## BUG-003 — API cho phép Submit PR thiếu trường bắt buộc của form

**Summary:**
Purchase Request có thể được gửi trực tiếp tới API mà không có ngày cần hàng, cost centre, địa điểm giao hoặc line item hợp lệ, dù form US-01 đánh dấu các dữ liệu này là bắt buộc.

**Environment:**
RoomFlow / FastAPI backend / `POST /purchase-requests`.

**Reproduction:**

1. Gửi request đăng nhập hợp lệ bằng role Employee.
2. Gọi `POST /purchase-requests` trực tiếp với các trường backend hiện yêu cầu (`title`, `department`, `amount`, `category`, `justification`).
3. Không gửi ngày cần hàng, cost centre, địa điểm giao hay line item.
4. Quan sát response.

**Expected:**

* API từ chối Submit nếu thiếu bất kỳ trường bắt buộc nào trong cấu hình US-01.
* Response chỉ rõ trường còn thiếu hoặc không hợp lệ.

**Actual:**
Schema `PurchaseRequestInput` không khai báo ngày cần hàng, cost centre, địa điểm giao hoặc line item. Payload đủ năm trường API yêu cầu có thể qua validation dù thiếu các trường form đang yêu cầu.

**Root Cause:**
Validation chỉ được thực hiện trong frontend. Pydantic model ở backend không đại diện cho bộ trường bắt buộc và rule line item của US-01.

**Solution:**

* Thống nhất danh sách trường bắt buộc giữa đặc tả, frontend và backend.
* Bổ sung các trường PR và model line item vào API schema.
* Thực hiện validation ở backend cho dữ liệu bắt buộc, số lượng dương và các rule nghiệp vụ.

**Regression Risk:**
Medium

Thay đổi schema có thể ảnh hưởng client/API caller hiện tại và dữ liệu đã lưu.

**Test Plan:**

* **Unit:** kiểm tra thiếu từng trường bắt buộc, line item rỗng, số lượng/đơn giá không hợp lệ.
* **Integration:** gửi payload thiếu trường tới API và xác nhận nhận `422`.
* **E2E:** xác nhận form và API đưa ra kết quả validation nhất quán.

**Evidence:**

* `Source Code/src/components/RequestForm.tsx` khai báo các trường bắt buộc và kiểm tra line item.
* `backend-test/main.py` — `PurchaseRequestInput` chỉ khai báo title, department, amount, category, justification và requester.

**Owner:**
Development Team

**Status:**
Open

---

## BUG-004 — Payload form US-01 không tương thích schema API

**Summary:**
Form tạo PR và endpoint backend dùng hai cấu trúc dữ liệu khác nhau; nối frontend với API hiện tại sẽ không thể Submit thành công nếu không chuyển đổi schema.

**Environment:**
RoomFlow / React frontend + FastAPI backend / Purchase Request creation.

**Reproduction:**

1. Điền và Submit form `New purchase request`.
2. Gửi payload form tới `POST /purchase-requests`.
3. Quan sát lỗi validation của API.

**Expected:**

* Frontend gửi đúng schema API hoặc có adapter chuyển đổi rõ ràng.
* Các trường quan trọng, gồm tổng tiền và line items, được lưu đúng.

**Actual:**
Frontend payload có `costCenter`, `neededBy`, `deliveryLocation`, `items` và không có `amount`; backend yêu cầu `amount` và không khai báo các trường form nói trên. Hai schema không thể trao đổi trực tiếp.

**Root Cause:**
Form frontend và Pydantic model backend được phát triển với hai mô hình Purchase Request khác nhau, chưa có hợp đồng API/adapter chung.

**Solution:**

* Chốt một schema PR dùng chung, bao gồm line items và cách tính tổng tiền.
* Cập nhật Pydantic model/database migration và frontend types theo schema đó.
* Thêm adapter nếu cần giữ tương thích với dữ liệu cũ.

**Regression Risk:**
High

Thay đổi cấu trúc PR tác động đến tạo, đọc, cập nhật và hiển thị dữ liệu ở các luồng phụ thuộc.

**Test Plan:**

* **Contract:** kiểm tra payload frontend khớp OpenAPI/API schema.
* **Integration:** tạo PR có nhiều line items và xác nhận giá trị lưu/đọc lại chính xác.
* **Regression:** kiểm tra danh sách, chi tiết và workflow với cả dữ liệu cũ lẫn mới.

**Evidence:**

* `Source Code/src/contexts/ProcurementContext.tsx` định nghĩa `NewRequestPayload`.
* `backend-test/main.py` — `PurchaseRequestInput` và `create_request` định nghĩa payload/API hiện tại.

**Owner:**
Development Team

**Status:**
Open

---

## BUG-005 — Requester của PR bị gán tên cố định

**Summary:**
PR tạo từ frontend luôn gán requester là `Nguyễn Hoài An`, không lấy danh tính Employee đang đăng nhập.

**Environment:**
RoomFlow / React frontend / Employee Purchase Request flow.

**Reproduction:**

1. Đăng nhập bằng một Employee khác với Nguyễn Hoài An.
2. Tạo và Submit một Purchase Request.
3. Mở chi tiết PR và kiểm tra requester.

**Expected:**

* Requester phản ánh người dùng đang đăng nhập.
* Backend xác định người tạo từ danh tính đã xác thực, không tin giá trị requester do client tự gửi.

**Actual:**
Frontend gán cứng `requester: 'Nguyễn Hoài An'`. Backend hiện cũng nhận `requester` trong input với giá trị mặc định, trong khi chỉ `created_by` lấy từ user đã xác thực.

**Root Cause:**
Prototype dùng danh tính demo cố định và trường requester chưa được liên kết với Auth context/API identity.

**Solution:**

* Lấy requester từ user đã đăng nhập hoặc profile trả về từ backend.
* Đặt requester/created-by ở server dựa trên token; không dùng requester do client quyết định làm danh tính tin cậy.

**Regression Risk:**
Low

Thay đổi nguồn hiển thị requester; cần kiểm tra dữ liệu demo và request cũ.

**Test Plan:**

* **Integration:** tạo PR bằng hai tài khoản và xác nhận requester/created-by đúng từng tài khoản.
* **Security:** gửi requester giả trong payload và xác nhận backend vẫn gắn user theo token.
* **E2E:** kiểm tra requester hiển thị đúng trên PR vừa tạo.

**Evidence:**

* `Source Code/src/contexts/ProcurementContext.tsx` gán requester cố định.
* `backend-test/main.py` lấy `created_by` từ `current_user` nhưng vẫn nhận `requester` từ input.

**Owner:**
Development Team

**Status:**
Open

---

## BUG-006 — Hỗ trợ AI cho US-01 đang dùng quy tắc cố định

**Summary:**
Tính năng được trình bày là AI hỗ trợ tạo và chuẩn hóa PR hiện dùng parser từ khóa/regex và danh sách gợi ý tĩnh, nên không đáp ứng hành vi AI được mô tả trong US-01 và đặc tả.

**Environment:**
RoomFlow / React frontend / Request form assistant.

**Reproduction:**

1. Mở form tạo PR.
2. Nhập một ghi chú tự do có cách diễn đạt hoặc đơn vị không nằm trong các regex/từ khóa hỗ trợ.
3. Chọn `Structure this note`.
4. Quan sát bản nháp và thông tin còn thiếu được trích xuất.

**Expected:**

* Hệ thống chuẩn hóa nội dung tự do theo schema đặc tả, chỉ dùng thông tin có căn cứ.
* Trường thiếu/mơ hồ được hỏi lại; người dùng xác nhận trước khi áp dụng.

**Actual:**
`normalizeFreeText` dùng tách chuỗi, regex và bảng từ khóa cố định; gợi ý trường thiếu lấy từ `aiFieldSuggestions` hardcode theo department. Không có lời gọi model/service AI trong luồng này.

**Root Cause:**
Assistant hiện là deterministic demo implementation, chưa tích hợp chức năng AI theo đặc tả.

**Solution:**

* Tích hợp dịch vụ AI trả về schema có kiểm tra, theo đặc tả US-01.
* Giữ validation ở ứng dụng/API, hiển thị trường thiếu và yêu cầu người dùng xác nhận gợi ý trước khi áp dụng.
* Giữ fallback an toàn khi dịch vụ lỗi hoặc đầu vào không thể diễn giải.

**Regression Risk:**
Medium

Thay đổi cách phân tích ghi chú có thể ảnh hưởng độ ổn định, thời gian phản hồi và các gợi ý người dùng đang quen thuộc.

**Test Plan:**

* **Unit:** kiểm tra parse schema, trường thiếu, dữ liệu mơ hồ và fallback.
* **Evaluation:** chạy tập ca đánh giá trong đặc tả AI, bao gồm số lượng/giá không rõ và đầu vào bất thường.
* **E2E:** xác nhận gợi ý chỉ được áp dụng sau hành động xác nhận của Employee và không tự Submit.

**Evidence:**

* `Source Code/src/utils/normalize.ts` triển khai chuẩn hóa bằng regex/từ khóa.
* `Source Code/src/data/seed.ts` chứa danh sách gợi ý tĩnh.
* `group-01/docs/07-ai/ai-feature-spec.md` mô tả schema AI và hành vi cần có.

**Owner:**
Development Team

**Status:**
Open
