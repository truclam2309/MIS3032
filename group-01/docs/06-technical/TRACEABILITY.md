# ProcureAI — Ma trận truy vết v1

## Tài liệu nguồn

- User Stories (nguồn giữ nguyên): [`../03-product/user-stories.md`](../03-product/user-stories.md)
- Requirements (nguồn giữ nguyên): [`../02-requirements/requirements.md`](../02-requirements/requirements.md)
- User Flow (nguồn giữ nguyên): [`../03-product/user-flow.md`](../03-product/user-flow.md)
- Hợp đồng API: [`API.md`](API.md); mô hình dữ liệu: [`data-model.md`](data-model.md)

## Story → AC → Requirement → màn hình/API/data → task

| Story/AC nguồn | Requirement | Màn hình prototype | API/data backend hiện tại | Task còn thiếu |
|---|---|---|---|---|
| US-01 AC1–AC3: trường bắt buộc, gợi ý, gửi PR | REQ-FR-01–03, REQ-BR-01 | New Request, Request Form, AssistantCard | `POST /purchase-requests`; chưa có AI endpoint | TASK-01: đồng bộ contract form; xác định/triển khai AI hỗ trợ |
| US-02 AC1–AC2: xem trạng thái PR | REQ-FR-04 | Requests, RequestDetail, WorkflowProgress | `GET /purchase-requests`; DB hiện có 4 trạng thái | TASK-02: xác nhận tích hợp FE/API và quyền xem dữ liệu |
| US-03 AC1–AC4: Manager review/decision | REQ-FR-05–07, REQ-BR-02–04, REQ-NFR-02–03 | Approvals, DecisionPanel | `GET /purchase-requests`; `POST /purchase-requests/{id}/decision`; role Manager; metadata quyết định trên PR | TASK-03: Finance step, resubmission, UI/E2E và audit history; test backend 5/5 memory + 5/5 Supabase, xem [`../08-quality/1.md`](../08-quality/1.md) |
| US-04 AC1–AC2: Budget check/warning | REQ-FR-08–09, REQ-BR-04–05 | BudgetReview, BudgetPanel | `GET /budgets`, `POST /budget-check`; data trong memory | TASK-04: persistence/config Budget và workflow Finance |
| US-05 AC1–AC2: Supplier/Quotation collection | REQ-FR-10–11, REQ-BR-06–07 | Suppliers, Sourcing, QuotationCollection | Chưa có route/table | TASK-05: schema, upload, permission, chuẩn hóa quotation |
| US-06 AC1–AC2: so sánh quotation | REQ-FR-12, REQ-BR-07 | Comparison, QuotationList | Chưa có persistence/API quotation | TASK-06: lưu báo giá và API so sánh |
| US-07 AC1–AC3: AI analysis/recommendation | REQ-FR-13–14, REQ-BR-08–09, CON-03 | Comparison, AiAnalysisPanel | Chưa có AI endpoint; prototype state/sample | TASK-07: contract AI có bằng chứng và human review |
| US-08 AC1–AC3: cảnh báo giá bất thường | REQ-FR-15, CON-03 | Comparison, AnomalyAlerts | Chưa có historical-price data/anomaly API | TASK-08: xác nhận nguồn dữ liệu, ngưỡng và xử lý thiếu dữ liệu |
| US-09 AC1–AC3: chọn Supplier/tạo PO | REQ-FR-16, REQ-BR-10 | Sourcing, Comparison, Orders | Chưa có award/PO route hoặc table | TASK-09: persistence và kiểm tra điều kiện ở server |
| US-10 AC1–AC2: ghi nhận Receiving | REQ-FR-17, REQ-BR-11 | OrderDetail | Chưa có Receiving route/table | TASK-10: partial receiving, constraint số lượng và authorization |
| US-11 AC1–AC2: đóng PR | REQ-FR-18, REQ-BR-11 | RequestDetail, OrderDetail | Chưa có close endpoint/đối soát lưu trữ | TASK-11: xác định điều kiện Close và enforce phía server |

## NFR dùng chung

| Requirement | Hiện trạng | Task |
|---|---|---|
| REQ-NFR-01 | Migration chỉ lưu PR; các entity khác chưa có | TASK-12: thiết kế nhất quán dữ liệu xuyên workflow |
| REQ-NFR-02 | Có demo role guards; thiếu API cho các workflow còn lại | TASK-13: xác nhận object-level access và áp dụng đồng bộ |
| REQ-NFR-03 | Có metadata một số quyết định trên PR; chưa có audit event table | TASK-14: thiết kế audit trail append-only |

## Chú giải

**Có ở backend** nghĩa là tìm thấy route/schema trong `backend-test`; **prototype** nghĩa là UI/state có trong `Source Code/`; **còn thiếu** nghĩa là chưa tìm thấy API/schema tương ứng. Ma trận tham chiếu story gốc, không chỉnh sửa story hoặc AC.
