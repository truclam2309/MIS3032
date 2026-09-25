# ProcureAI — Kế hoạch kiểm thử khả năng sử dụng

## Trạng thái

Đây là kế hoạch và mẫu ghi nhận, chưa phải kết quả kiểm thử. Repo chưa có dữ liệu phiên test, observation hoặc participant; không điền kết quả giả định.

## Mục tiêu

Đánh giá khả năng hiểu và thao tác các workflow chính của prototype: tạo Purchase Request, xem xét approval/ngân sách, so sánh báo giá, tạo đơn hàng và ghi nhận nhận hàng.

## Người tham gia

Tuyển tối thiểu 3 người phù hợp với các vai trò Employee, Manager, Finance hoặc Procurement. Dùng mã `P-01` đến `P-03` thay cho tên trong tài liệu. Ghi vai trò và kinh nghiệm liên quan; không đưa thông tin mua sắm mật vào phiên test.

| Mã | Vai trò | Ngày | Trạng thái |
|---|---|---|---|
| P-01 | Chưa tuyển | — | Chưa thực hiện |
| P-02 | Chưa tuyển | — | Chưa thực hiện |
| P-03 | Chưa tuyển | — | Chưa thực hiện |

## Tình huống kiểm thử

| ID | Vai trò | Nhiệm vụ | Kết quả cần quan sát | Requirement |
|---|---|---|---|---|
| UT-01 | Employee | Tạo PR với một trường thông tin còn thiếu; xem gợi ý và hoàn thiện request | Người dùng có nhận ra trường thiếu, hiểu gợi ý và biết cách gửi request không? | REQ-FR-01–03 |
| UT-02 | Manager | Tìm PR đang chờ xử lý, xem chi tiết và chọn Approve/Reject/Request Revision | Trạng thái, lý do và bước xác nhận có dễ hiểu không? | REQ-FR-05–07 |
| UT-03 | Finance | Mở Budget Review và giải thích tình trạng ngân sách của PR | Người dùng có hiểu số còn lại và cảnh báo vượt ngân sách không? | REQ-FR-08–09 |
| UT-04 | Procurement | Xem các quotation, so sánh và chọn Supplier | Người dùng có phân biệt dữ liệu nguồn, phân tích AI và quyết định của mình không? | REQ-FR-10–15 |
| UT-05 | Người được phân quyền | Xem PO/Receiving và xác định request đã đủ điều kiện đóng chưa | Người dùng có hiểu số lượng nhận, sai lệch và điều kiện Close không? | REQ-FR-16–18 |

Chạy task trên prototype hiện có; ghi rõ nếu thao tác chỉ được mô phỏng phía frontend hoặc không gọi được backend. Điều phối viên không hướng dẫn đáp án, trừ khi cần kết thúc tình huống bị kẹt.

## Chỉ số và phân loại vấn đề

- Hoàn thành task: hoàn thành / một phần / không hoàn thành.
- Thời gian, lỗi, thao tác quay lại và yêu cầu trợ giúp.
- Mức tự tin sau task: 1–5.
- Mức độ: S1 chặn task; S2 gây nhầm lẫn/lỗi đáng kể; S3 có thể khắc phục; S4 vấn đề nhỏ.

## Mẫu ghi nhận

| Participant | Task | Hoàn thành | Thời gian | Quan sát/bằng chứng | Mức độ | Quyết định/người phụ trách |
|---|---|---|---|---|---|---|
| P-__ | UT-__ | Chưa chạy | — | Chưa có dữ liệu | — | Chờ phiên test |

Sau mỗi phiên, tổng hợp issue có bằng chứng, liên kết Requirement và quyết định tiếp theo. Xin phép trước khi ghi âm hoặc lưu trích dẫn nhận diện được cá nhân.
