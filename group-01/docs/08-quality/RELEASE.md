# Ghi chú phát hành — Approval US-03

## Phiên bản

Chưa gán phiên bản phát hành cho riêng US-03. Backend hiện khai báo `RoomFlow API 0.2.0`; đây là phiên bản API, không đồng nghĩa bản phát hành sản phẩm.

## Phạm vi đã triển khai

- Manager có thể xử lý PR ở trạng thái `PENDING_APPROVAL` bằng Approve, Reject hoặc Request Revision.
- Approve đặt trạng thái `APPROVED`, lưu người duyệt/thời điểm/comment và đặt `next_approval_role=Finance`.
- Reject đặt `REJECTED`; Request Revision đặt `REVISION_REQUIRED`.
- Workflow response được tính theo trạng thái PR.
- Endpoint decision chỉ cho role Manager.
- Supabase update chỉ áp dụng khi trạng thái vẫn là `PENDING_APPROVAL`; decision lặp bị từ chối.

## Kiểm thử

- Bộ nhớ: 5/5 test đạt.
- Supabase thật: 5/5 test đạt.
- Chi tiết và giới hạn kiểm thử: [QA_REPORT.md](QA_REPORT.md).

## Việc chưa có trong phiên bản này

- Endpoint để Finance tiếp tục phê duyệt sau Manager.
- Gửi lại PR sau Request Revision.
- Audit event append-only đầy đủ.
- Xác minh UI/E2E và build frontend cho BUG-001.
- Release version/tag và hướng dẫn rollback đã được xác nhận.

Không xem đây là xác nhận phát hành toàn bộ sản phẩm hoặc hoàn tất mọi Acceptance Criteria của US-03.
