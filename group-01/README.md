# ProcureAI — Nền tảng đề xuất mua sắm và phê duyệt nội bộ

## Dự án

Hệ thống hỗ trợ Purchase Request, Approval và các bước mua sắm tiếp theo trong phạm vi đồ án MIS3032.

## Điểm bắt đầu tài liệu

- [Chỉ mục dự án](docs/00-project-index.md)
- [Project Charter](docs/01-discovery/1.project-charter.md)
- [Requirements](docs/02-requirements/requirements.md)
- [User Stories](docs/03-product/user-stories.md)
- [Business Rules và workflow](Vault/domain.md)
- [Ma trận truy vết](docs/06-technical/TRACEABILITY.md)
- [Báo cáo QA US-03](docs/08-quality/QA_REPORT.md)
- [Checklist tài liệu US-03](docs/08-quality/US03-artifact-checklist.md)
- [Runbook test US-03](docs/08-quality/RUNBOOK-US03.md)

## Workflow mục tiêu

`Purchase Request → Approval → Collect Quotations → Compare → Purchase Order → Receiving → Close`

Trong backend hiện tại, US-03 mới hỗ trợ quyết định Manager; Finance handoff/decision và các bước sau vẫn đang thiếu.

## Chạy backend test US-03

Làm việc trong `backend-test`; xem [RUNBOOK-US03.md](docs/08-quality/RUNBOOK-US03.md) để biết cách cấu hình `.env` và chạy riêng chế độ memory hoặc Supabase thật.

## Quy tắc nguồn chuẩn

Requirements và Business Rules đã được xác nhận có ưu tiên cao hơn Product, Design, Technical, Testing và nội dung do AI đề xuất.
