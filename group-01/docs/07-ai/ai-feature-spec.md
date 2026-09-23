# AI Feature Specification

## 1. Feature Overview

**Feature:** AI Purchase Request Risk & Category Analysis

**Purpose:**
Hỗ trợ người dùng đánh giá Purchase Request bằng AI trước khi thực hiện các bước xử lý tiếp theo.

AI phân tích thông tin Purchase Request và trả về:

* Category
* Risk level
* Urgency
* Recommendation
* Reason

AI chỉ đóng vai trò **hỗ trợ phân tích**. AI không được tự động Approve hoặc Reject Purchase Request.

---

## 2. Business Value

Feature giúp:

* Hỗ trợ phát hiện Purchase Request có mức rủi ro cao.
* Hỗ trợ phân loại yêu cầu mua sắm.
* Hỗ trợ người duyệt nhận biết các trường hợp cần kiểm tra thêm.
* Giảm thời gian xem xét thủ công các Purchase Request.
* Đảm bảo quyết định cuối cùng vẫn thuộc về người có thẩm quyền.

---

## 3. Input

AI nhận thông tin từ Purchase Request:

```json
{
  "title": "Mua 20 laptop cho phòng IT",
  "department": "Engineering",
  "amount": 280000000,
  "category": "IT Equipment",
  "justification": "Trang bị laptop cho nhân viên mới"
}
```

---

## 4. Structured Output

AI phải trả về JSON theo cấu trúc:

```json
{
  "category": "IT Equipment",
  "risk_level": "MEDIUM",
  "urgency": "NORMAL",
  "recommendation": "REVIEW",
  "reason": "Giá trị mua sắm cao và cần kiểm tra ngân sách."
}
```

---

## 5. Output Validation

### category

Phải là một category hợp lệ của hệ thống.

### risk_level

Chỉ chấp nhận:

```text
LOW
MEDIUM
HIGH
```

### urgency

Chỉ chấp nhận:

```text
LOW
NORMAL
HIGH
```

### recommendation

Chỉ chấp nhận:

```text
APPROVE_REVIEW
REVIEW
MANUAL_REVIEW
```

Nếu AI trả về giá trị không hợp lệ thì hệ thống phải chuyển sang `MANUAL_REVIEW`.

---

## 6. Business Rules

1. AI không được tự động Approve Purchase Request.
2. AI không được tự động Reject Purchase Request.
3. AI chỉ đưa ra recommendation để hỗ trợ người dùng.
4. Purchase Request có `risk_level = HIGH` phải được đánh dấu để người dùng kiểm tra.
5. Nếu AI không trả về đúng cấu trúc JSON thì hệ thống phải sử dụng fallback.
6. Nếu AI không phản hồi
