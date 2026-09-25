# Báo cáo QA — US-01: Tạo và chuẩn hóa Purchase Request

**Ngày báo cáo:** 2026-09-25  
**Trạng thái QA:** Chưa đủ điều kiện phê duyệt  
**Nguồn yêu cầu:** `group-01/docs/03-product/user-stories.md` — US-01, REQ-FR-01, REQ-FR-02, REQ-FR-03

## Phạm vi

Đánh giá US-01 theo ba tiêu chí chấp nhận:

- **AC1 — Trường bắt buộc:** hệ thống phát hiện và hiển thị thông tin còn thiếu trước khi Submit.
- **AC2 — Hỗ trợ AI:** trợ lý gợi ý thông tin cần bổ sung khi PR còn thiếu dữ liệu.
- **AC3 — Submit:** cho phép gửi PR khi dữ liệu bắt buộc đã đầy đủ.

Evidence hiện có tập trung vào API backend: xác thực, quyền tạo PR, kiểm tra một số trường, tạo PR và đọc lại danh sách trong bộ nhớ. Bộ test chưa bao phủ UI/trình duyệt, hành vi AI hoặc xác nhận dữ liệu còn tồn tại sau khi backend khởi động lại.

## Môi trường

| Thành phần | Môi trường được ghi nhận |
|---|---|
| Hệ điều hành / workspace | Windows, workspace `D:\MIS3032-1` |
| Python | Python 3.13 |
| Backend | FastAPI, kiểm thử qua `fastapi.testclient.TestClient` |
| Kho dữ liệu trong test | In-memory (`USE_SUPABASE=false`) theo cấu hình trong file test |
| Test runner | Đã thử `python -m pytest -q` tại `backend-test/`; môi trường Python chưa có pytest |
| Supabase | Không được kiểm tra trong lượt QA này |

## Kết quả

**Kết quả chạy:** Bị chặn trước bước thu thập test. Không có test nào được thực thi; pass = 0, fail = 0, skipped = 0. Số 15 dưới đây là số testcase được định nghĩa trong file test, không phải số đã chạy.

| File evidence | Testcase được định nghĩa | Kết quả thực thi |
|---|---:|---|
| `backend-test/test_00_main_api.py` | 10 (gồm 3 trường hợp tham số hóa) | Chưa chạy |
| `backend-test/test_approval.py` | 5 | Chưa chạy |
| **Tổng** | **15** | **0 được thực thi** |

**Bằng chứng chạy:** lệnh `python -m pytest -q` kết thúc với exit code `1` và thông báo `No module named pytest`. Vì vậy chưa có evidence pass/fail để xác nhận AC1, AC2 hoặc AC3.

**Độ bao phủ theo tiêu chí chấp nhận:**

| AC | Evidence hiện có | Đánh giá |
|---|---|---|
| AC1 — Hiển thị trường còn thiếu | Test hiện có kiểm tra API từ chối một số giá trị không hợp lệ; chưa kiểm tra thông báo trường thiếu trên giao diện | Chưa xác minh |
| AC2 — AI gợi ý thông tin | Backend test suite không có test cho AI/trợ lý | Chưa xác minh |
| AC3 — Submit PR hợp lệ | Có testcase định nghĩa tạo PR và GET lại trong cùng tiến trình in-memory; chưa chạy và chưa xác minh lưu dữ liệu qua refresh trình duyệt hoặc Supabase | Chưa xác minh |

## Vấn đề đã biết

- **BUG-003:** Backend chưa bắt buộc `costCenter`, `neededBy`, `deliveryLocation` và line item như form yêu cầu; API hiện cho phép thiếu hoặc chưa kiểm tra đầy đủ các dữ liệu này.
- **BUG-006:** Chuẩn hóa ghi chú và gợi ý hiện dựa vào regex/từ khóa và dữ liệu tĩnh; chưa có evidence cho hành vi AI theo đặc tả.
- Kiểm tra Submit mới có test API. Chưa có UI/E2E coverage cho trạng thái nút Submit, lỗi trường thiếu, đăng nhập frontend và điều hướng sau khi lưu.
- Chưa chạy migration Supabase `002_add_purchase_request_details.sql` hoặc kiểm tra lưu/đọc PR qua Supabase.

## Rủi ro

**Mức rủi ro tổng thể: Cao — chưa đủ evidence để phát hành hoặc phê duyệt US-01.**

- Test runner chưa được cài nên toàn bộ suite chưa thực thi.
- AC1 và AC2 chưa có coverage thực thi.
- Persistence mới được định nghĩa trong code/migration; chưa có kết quả integration xác nhận schema đã áp dụng và dữ liệu đọc lại được sau refresh.
- Validation frontend và backend có thể không đồng nhất do API chưa bắt buộc toàn bộ trường form.

## Phê duyệt

**QA sign-off: Chưa phê duyệt / Chờ evidence.**

Điều kiện để phê duyệt:

1. Cài/khai báo `pytest` trong môi trường test và chạy đủ 15 backend testcase; lưu kết quả lệnh cùng số pass/fail thực tế.
2. Bổ sung và chạy UI/E2E checks cho AC1 và AC3, gồm Submit thành công và xác nhận request còn hiển thị sau khi tải lại trang.
3. Bổ sung evidence cho AC2 theo hành vi trợ lý trong đặc tả; hiện chưa có evidence test AI.
4. Chạy integration test với Supabase sau khi áp dụng migration `002_add_purchase_request_details.sql`.

**Người phê duyệt:** Chưa ký  
**Ngày ký:** Chưa có
