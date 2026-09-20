# Prototype Brief - ProcureAI

> **Status:** Draft planning brief. Không phải source-of-truth nghiệp vụ.

## Prototype objective

Kiểm tra các luồng quan trọng nhất của MVP bằng prototype web có thể tương tác.

## Critical screens

| Screen | User | Purpose | Traceability |
|---|---|---|---|
| PR Creation | Employee | Nhập PR, xem AI suggestion và Submit. | REQ-FR-01 đến REQ-FR-04 |
| Manager Approval | Manager | Xem PR, Budget và quyết định. | REQ-FR-05 đến REQ-FR-09 |
| Quotation Comparison | Procurement | Review extraction, so sánh và chọn Supplier. | REQ-FR-10 đến REQ-FR-15 |
| PO Creation | Procurement | Tạo PO từ PR và Supplier đã chọn. | REQ-FR-16 |
| Receiving | Người dùng có quyền | Ghi nhận nhận đủ, một phần hoặc sai lệch. | REQ-FR-17 |
| Workflow Dashboard | Các role liên quan | Theo dõi trạng thái và Audit Trail. | REQ-FR-04, REQ-NFR-03 |

## Prototype states to demonstrate

- PR thiếu trường bắt buộc.
- AI suggestion cần human review.
- PR vượt Budget và nhánh chuyển Finance.
- Quotation extraction có thể chỉnh sửa.
- Receiving có sai lệch và không được Close ngay.
- Self-Approval bị chặn.

## Not decided yet

Visual design system, navigation model, responsive breakpoints và dữ liệu demo chưa được xác nhận.

# Prototype Brief – ProcureAI

## 1. Prototype Overview

**Project:** ProcureAI – Internal Procurement & Approval System

**Prototype purpose:**  
Tạo prototype tương tác để kiểm chứng sớm các critical user flows, business rules, wording, permission và các trạng thái ngoại lệ của hệ thống mua sắm nội bộ.

Prototype chỉ dùng để kiểm chứng UX và workflow, **không phải production code**.

---

## 2. Prototype Objectives

Prototype cần kiểm chứng:

- Người dùng có hiểu và hoàn thành được workflow hay không.
- Người dùng có hiểu các action chính hay không.
- Người dùng có hiểu trạng thái của PR/PO hay không.
- Người dùng có hiểu AI Suggestion / Recommendation hay không.
- Người dùng có hiểu rằng AI chỉ hỗ trợ và con người phải review hay không.
- Người dùng có nhận biết được lỗi và nguyên nhân lỗi hay không.
- Người dùng có hiểu các điều kiện Approval, Budget, Receiving và Close hay không.
- Các permission/business rule quan trọng có được thể hiện rõ trong UI hay không.

---

# 3. Critical User Flows

## F01 – Tạo PR + AI kiểm tra & gợi ý bổ sung

**Requirements:** FR-01 → FR-04

**Persona:** Employee

**Goal:**  
Employee tạo Purchase Request, nhận AI suggestion khi thông tin chưa đầy đủ, bổ sung thông tin và Submit PR khi hoàn chỉnh.

### Main Flow

```text
Employee
   ↓
Create Purchase Request
   ↓
Nhập thông tin PR
   ↓
AI kiểm tra & chuẩn hóa
   ↓
Thông tin đầy đủ?
   ├── Không → AI gợi ý → Employee bổ sung/chỉnh sửa
   │                         ↓
   │                    AI kiểm tra lại
   │
   └── Có → Employee Submit
                  ↓
             PR = Submitted
