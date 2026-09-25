# ProcureAI — Hợp đồng API backend hiện có

## Phạm vi

Tài liệu phản ánh route trong `backend-test/routers/` và `main.py`, không phải API đầy đủ cho product workflow. API app đang khai báo tên `RoomFlow API`, phiên bản `0.2.0`. Base URL phụ thuộc môi trường. Route bảo vệ dùng `Authorization: Bearer <access_token>`.

## Endpoint

| Phương thức/path | Xác thực/role | Request | Kết quả chính |
|---|---|---|---|
| `GET /` | Công khai | — | Thông tin API/version |
| `GET /health` | Công khai | — | `{ "status": "ok" }` |
| `POST /auth/login` | Công khai | Form OAuth2: `username`, `password` | `200`; access token, loại token, user |
| `GET /auth/me` | Bearer | — | `200`; id, name, email, role |
| `GET /auth/permissions` | Bearer | — | `200`; role và permission list |
| `GET /budgets` | Finance, Admin | — | `200`; ngân sách theo department |
| `POST /budget-check?department=...&amount=...` | Finance, Admin | Query department/amount | `200`; limit, spent, available, remaining, `is_within_budget` |
| `GET /purchase-requests` | User đã xác thực | — | `200`; danh sách PR và workflow tính động |
| `POST /purchase-requests` | Employee, Admin | JSON tạo PR | `201`; PR được tạo |
| `POST /purchase-requests/{request_id}/decision` | Manager | JSON quyết định | `200`; PR sau quyết định |

## Request tạo PR

```http
POST /purchase-requests
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Office chairs",
  "department": "Operations",
  "amount": 12500000,
  "category": "Office",
  "justification": "Replace damaged chairs",
  "requester": "Nguyen Minh Anh"
}
```

`title`: 3–120 ký tự; `amount` phải dương; `justification` tối thiểu 5 ký tự. `requester` có giá trị mặc định. Department không có trong budget data trả lỗi 400. PR mới có trạng thái `PENDING_APPROVAL`.

## Request quyết định Manager

```http
POST /purchase-requests/PR-2026-ABC12345/decision
Authorization: Bearer <manager_access_token>
Content-Type: application/json
```

```json
{ "action": "approved", "comment": "Reviewed" }
```

`action` nhận `approved`, `rejected`, `revision`; `comment` mặc định rỗng. Chỉ PR đang `PENDING_APPROVAL` mới được xử lý. Approve đặt trạng thái `APPROVED` và `next_approval_role=Finance`; hai hành động còn lại lần lượt đặt `REJECTED` hoặc `REVISION_REQUIRED`.

## Xác thực và lỗi

JWT có thời hạn cấu hình 60 phút. Các lỗi dùng JSON dạng `{ "detail": "..." }`. Theo code hiện tại: 400 sai department/trạng thái/action; 401 thiếu hoặc sai token; 403 sai role/user disabled; 404 không tìm thấy PR; 500 lỗi thao tác persistence; Pydantic validation trả 422.

## Lưu trữ và endpoint chưa có

Khi bật `USE_SUPABASE`, PR dùng bảng `purchase_requests`; nếu tắt, dữ liệu request lưu trong memory tiến trình. User và budget demo cũng nằm trong bộ nhớ. Chưa có backend route cho Finance approval, Supplier/Quotation CRUD/upload, AI analysis, anomaly detection, PO, Receiving hoặc Close. Chưa xác nhận frontend đang gọi các endpoint này.
