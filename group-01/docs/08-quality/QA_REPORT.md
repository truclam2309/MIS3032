# QA Report — US-03 Approval Workflow

## 1. Scope

QA này tập trung vào **US-03 — Xem và xử lý Approval**.

Phạm vi kiểm tra:

* Manager thực hiện Approve Purchase Request.
* Manager thực hiện Reject Purchase Request.
* Manager thực hiện Request Revision.
* Kiểm tra quyền Approval theo role.
* Kiểm tra các state transition của Approval.
* Kiểm tra không thể xử lý lại Purchase Request đã được xử lý.
* Regression test cho BUG-001.

Các User Story khác không thuộc phạm vi của QA Report này.

## 2. Environment

* Frontend: React + Vite
* Backend: FastAPI
* Automated test: pytest
* Production build: Vite
* Demo environment: Vercel
* Source repository: GitHub

## 3. Result

| Test                             | Result   |
| -------------------------------- | -------- |
| Manager Approve                  | PASS     |
| Manager Reject                   | PASS     |
| Manager Request Revision         | PASS     |
| Employee không được Approval     | PASS     |
| PR đã xử lý không được xử lý lại | PASS     |
| Backend automated tests          | 5 passed |
| Frontend production build        | PASS     |
| BUG-001 regression               | PASS*    |

* Chỉ ghi PASS nếu đã thực sự kiểm tra regression sau khi sửa BUG-001.

## 4. Known Issues

* QA Report này chỉ đánh giá US-03.
* Các User Story khác không nằm trong phạm vi kiểm thử này.
* Các AI features thuộc User Story khác và chưa được đánh giá trong QA của US-03.

## 5. Risk

| Risk                                         | Level  | Mitigation                         |
| -------------------------------------------- | ------ | ---------------------------------- |
| Approval permission có thể bị regression     | High   | Duy trì backend authorization test |
| State transition có thể bị thay đổi sai      | High   | Duy trì automated approval tests   |
| Frontend và backend permission không đồng bộ | Medium | Kiểm tra cả UI và backend          |

## 6. Sign-off

**US-03 — Approval Workflow: PASS**

Trong phạm vi US-03, các test đã thực hiện đạt kết quả yêu cầu.

**Release blockers: 0**

Kết luận `Release blockers = 0` chỉ áp dụng cho **US-03**, không đại diện cho trạng thái hoàn thành của toàn bộ 11 User Story.
