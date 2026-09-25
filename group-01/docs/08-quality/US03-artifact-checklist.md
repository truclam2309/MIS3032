# Danh mục tài liệu bàn giao — US-03

Mục 11 (CI/CD + Docker/Deployment) được bỏ theo yêu cầu. Các mục khác được đối chiếu với repository và bằng chứng hiện có.

| Số | Hạng mục | Tài liệu/bằng chứng | Trạng thái US-03 |
|---:|---|---|---|
| 9 | Báo cáo QA | [QA_REPORT.md](QA_REPORT.md) | Đã cập nhật bằng tiếng Việt; ghi riêng kết quả backend memory/Supabase và các AC còn thiếu. |
| 10 | Bằng chứng Security + NFR | [security-nfr.md](security-nfr.md) | Đã bổ sung RBAC, auth/validation, lưu trữ, secrets và ghi rõ dependency/performance/a11y chưa đánh giá. |
| 12 | README + Runbook | [README dự án](../../README.md), [RUNBOOK-US03.md](RUNBOOK-US03.md) | Có điểm vào tài liệu và lệnh chạy hai chế độ; deploy/rollback chưa có bằng chứng. |
| 13 | Release Notes + Changelog | [RELEASE.md](RELEASE.md), [CHANGELOG.md](CHANGELOG.md) | Có scope, thay đổi và known issues; chưa gán phiên bản phát hành chính thức. |
| 14 | Traceability cuối | [Ma trận truy vết US-03](1.md), [TRACEABILITY.md](../06-technical/TRACEABILITY.md) | Đã nối REQ → US/AC → task → API → test; mã commit/PR không có trong nguồn nên để rõ là chưa cung cấp. |
| 15 | AI Usage Log + retrospective | [AI_USAGE_LOG.md](../AI_USAGE_LOG.md), [retrospective-US03.md](retrospective-US03.md) | Đã ghi phạm vi hỗ trợ AI, phần được rà soát, giới hạn và bài học; không ước lượng thời gian khi không có số liệu. |

## Kết luận

Backend action của US-03 có 5/5 test đạt ở memory và 5/5 ở Supabase thật. Story chưa hoàn tất toàn bộ: Finance workflow, gửi lại sau Revision, audit event đầy đủ và xác minh UI/E2E còn thiếu. Mục 11 không nằm trong danh mục này.
