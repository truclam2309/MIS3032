# AI Usage Log — Final

**Dự án:** ProcureAI / RoomFlow  
**Ngày tổng hợp:** 2026-09-26  
**Nguồn evidence chính:** [AI Usage Log v1 trong Vault](../group-01/docs/02-vault/AI_USAGE_LOG.md), [AI Usage Log trong docs](../group-01/docs/AI_USAGE_LOG.md), các artifact được liên kết dưới đây và lịch sử hội thoại làm tài liệu trong phiên hiện tại.

## Phạm vi và cách đọc

AI được dùng như công cụ hỗ trợ soạn thảo, tổng hợp, rà soát và coding assistance. Các dòng AI-001–AI-038 được ghi trong Vault log dự án; bảng bên dưới tóm tắt theo nhóm công việc thay vì lặp lại toàn bộ 38 dòng. Các dòng `Finalization` ghi lại đầu ra cụ thể được tạo trong các phiên làm việc gần đây. Chúng có bằng chứng là file trong repository, nhưng không phải bản ghi prompt đầy đủ hay kiểm chứng độc lập của lịch sử hội thoại.

`AI Usage Log v1` có các trường Prompt/Input/Output/Verification/Correction. Log không có timestamp, thời lượng theo task, số token, hay phép đo thời gian trước/sau. Vì vậy không báo cáo số giờ tiết kiệm.

## AI dùng ở đâu và output được rà soát/chỉnh như thế nào

| Nhóm / ID tham chiếu | Dùng AI cho | Output có thể kiểm tra | Evidence review, sửa đổi hoặc quyết định của con người |
|---|---|---|---|
| AI-001 | Soạn Project Charter và metrics | [Project Charter](../group-01/docs/01-discovery/1.project-charter.md) | Log ghi nhận AI đề xuất metrics 100% quá lạc quan; người dùng yêu cầu sửa thành workflow 85%, extraction 80–85%, precision cảnh báo ≥75%, giữ No Self-Approval 0%. |
| AI-002–AI-005 | Tổng hợp user research, requirements, persona và quyết định nghiệp vụ | [User Research](../group-01/docs/01-discovery/2.user-research.md), [Requirements](../group-01/docs/02-requirements/requirements.md), [Decision Log](../group-01/docs/02-vault/08-decisions/decision-log.md) | Log ghi AI-002 tạo/tổng hợp evidence phỏng vấn; cần giữ nguồn phỏng vấn gốc để xác minh tính xác thực. AI-005 được sửa theo quyết định người dùng: Manager reject hoặc chuyển Finance; Invoice ra phase sau; AI không approve/reject; ngưỡng giá ≥20% và các điểm thiếu dữ liệu còn Open. |
| AI-006–AI-025 | Tạo/chuẩn hóa source-of-truth, Vault, PRD, epic, flow, stories và backlog | [MVP Scope](../group-01/docs/01-discovery/7.MVP-Scope.md), [User Stories](../group-01/docs/03-product/user-stories.md), [Taiga Backlog](../group-01/docs/03-product/taiga-backlog.md) | Log nêu việc đối chiếu ID REQ/BR; giữ các bản nguồn; đánh dấu interpretation/backlog là Draft; không biến Open Decision thành rule. Backlog hiện vẫn Draft và có chỗ lệch mã US giữa backlog với user stories, được nêu trong [Traceability](TRACEABILITY.md). |
| AI-026–AI-035 | Tạo usability/prototype scaffolding, design/technical/testing/release placeholders | [Testing README](../group-01/docs/06-testing/README.md), [Release README](../group-01/docs/07-release/README.md) | Log xác nhận không bịa usability result, technical decision, test execution hay release readiness; placeholder giữ trạng thái chưa xác nhận. |
| AI-036–AI-038 | Vault Q&A benchmark, trả lời câu hỏi Budget và soạn system prompt QA | [Vault QA Benchmark](../group-01/docs/02-vault/vault-qa-benchmark.md), [Vault QA Prompt](../group-01/docs/02-vault/vault-qa-prompt.md) | AI-037 được đối chiếu với REQ-BR-04/FR-06/FR-08, không tự tạo threshold. AI-038 được ghi Draft, yêu cầu nhóm xác nhận trước sử dụng. |
| Finalization — QA/security/CI/docs | Hỗ trợ soạn QA report, security/NFR evidence, README/CI/Docker và dịch các file được yêu cầu | [QA Report](../group-01/docs/08-quality/QA_REPORT.md), [Security/NFR](../group-01/docs/08-quality/security-nfr.md), [CI workflow](../.github/workflows/ci.yml), [README](../README.md) | QA report giữ đúng bằng chứng: 15 test được định nghĩa, 0 test chạy vì thiếu pytest; Supabase chưa xác minh. Security/NFR ghi CI được cấu hình nhưng chưa chạy. Các giới hạn chưa xác minh vẫn được giữ trong release và traceability. |
| Finalization — release/traceability | Hỗ trợ lập release notes, changelog và ma trận traceability | [Release Notes](../RELEASE.md), [Changelog](../CHANGELOG.md), [Traceability](TRACEABILITY.md), [Traceability XLSX](TRACEABILITY.xlsx) | Kiểm tra tag thực tế: `v1.0.0-final` trỏ `612f80a`, HEAD là `3e93e62`; ghi sai khác vào traceability. Không tuyên bố QA sign-off hoặc toàn scope Done; workbook được mở kiểm tra cấu trúc sau khi tạo. |

## Rủi ro AI và cách kiểm soát

- **Số liệu/khẳng định không có căn cứ:** AI từng đề xuất metrics 100% (AI-001). Đã hạ metrics theo review; mọi số liệu cuối cần source hoặc được ghi rõ là target/assumption.
- **Nghiên cứu người dùng bị tạo/tóm tắt quá mức:** AI-002 mô tả output là tổng hợp evidence phỏng vấn. Log này không thay cho bản ghi phỏng vấn gốc; cần đối chiếu participant/source trước khi dùng làm bằng chứng thực địa.
- **Biến đề xuất thành quy tắc:** AI có thể lấp chỗ trống về budget, approval, quotation hoặc lịch sử giá. AI-005/016 ghi open decisions; các tài liệu cuối vẫn giữ trạng thái Open.
- **Lệch giữa tài liệu và implementation:** backlog/story IDs không đồng nhất hoàn toàn; implementation chỉ bao phủ một phần yêu cầu. Traceability nêu mapping chưa xác nhận và trạng thái partial.
- **Test/release claim sai:** test chưa chạy, migration Supabase chưa xác minh, tag version không trỏ HEAD. QA report, security/NFR, release và traceability công khai các giới hạn này.
- **Code suggestion không tự chứng minh chất lượng:** test definitions, CI config và source inspection không thay cho test run hoặc review độc lập.

## Số liệu thời gian

**Không có số liệu thời gian đáng tin cậy trong evidence được rà soát.** Log AI-001–AI-038 không ghi timestamp hoặc thời lượng; repository không có timesheet, baseline làm thủ công hay phép đo thời gian có/không dùng AI. Không ước lượng giờ tiết kiệm.

## Nguyên tắc sử dụng cuối

AI không có quyền phê duyệt scope, business rule, ngân sách, quyền truy cập hoặc quyết định release. Người phụ trách phải xác minh nội dung theo source-of-truth, kiểm tra code/test thật và đánh dấu rõ nội dung chưa được chứng minh. Log này không khẳng định mọi output AI trong lịch sử đã qua review độc lập.
