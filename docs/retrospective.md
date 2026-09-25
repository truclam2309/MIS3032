# Retrospective — Final

**Dự án:** ProcureAI / RoomFlow  
**Ngày tổng hợp:** 2026-09-26  
**Căn cứ:** AI usage logs, QA/security evidence, backlog, release artifacts và traceability hiện có trong repository.

## Điều đã làm

- AI hỗ trợ tạo nhiều tài liệu phân tích và sản phẩm. Vault log có các mục AI-001–AI-038, từ Project Charter/Requirements đến Vault QA benchmark và prompt.
- AI hỗ trợ soạn tài liệu chất lượng và vận hành: [QA Report](../group-01/docs/08-quality/QA_REPORT.md), [Security/NFR](../group-01/docs/08-quality/security-nfr.md), README/CI/Docker, [Release Notes](../RELEASE.md), [Changelog](../CHANGELOG.md) và [Traceability](TRACEABILITY.md).
- Output không được xem là đúng mặc định. Ví dụ rõ nhất là AI-001: metrics 100% bị người dùng phản hồi là phi thực tế và được chỉnh thành 85%, 80–85%, ≥75%; AI-005 được sửa theo quyết định nghiệp vụ đã xác nhận và giữ các câu hỏi thiếu dữ liệu ở trạng thái Open.

## Điều hiệu quả

- Ghi source ID và đường dẫn artifact giúp rà soát lại output. AI-037 đối chiếu câu trả lời Budget với `REQ-BR-04`, `REQ-FR-06`, `REQ-FR-08`; AI-036/038 bổ sung citation, Unknown handling và source-priority cho Vault QA.
- Giữ placeholder/Draft khi thiếu evidence ngăn tài liệu trông như kết quả đã xác nhận. AI-026–AI-035 ghi rõ không có usability result, technical decision, test result hay release sign-off.
- Khi có đối chiếu repository, các khoảng trống được phát hiện thay vì che đi: QA có 15 test definitions nhưng 0 test execution; backlog còn Draft; tag `v1.0.0-final` trỏ `612f80a` trong khi HEAD là `3e93e62`.

## Vấn đề và rủi ro còn lại

- AI-002 mô tả việc tạo/tổng hợp evidence nghiên cứu. Các file log hiện có không thay thế raw interview notes/recordings; cần chủ sở hữu nghiên cứu xác minh từng trích dẫn và nguồn trước khi trình bày là evidence thực địa.
- AI từng tạo chỉ số quá hoàn hảo; các output tổng hợp có nguy cơ biến assumption thành fact nếu không giữ source priority và trạng thái Open.
- Traceability cho thấy mã Story trong Draft Taiga backlog có chỗ không khớp `user-stories.md`; Task ID là kế hoạch, không chứng minh issue đã đóng.
- QA chưa chạy test, chưa có sign-off; Supabase migration/integration chưa xác minh. Do đó không thể suy ra chất lượng, độ đúng production hoặc mức độ hoàn thành chỉ từ tài liệu/code được AI hỗ trợ.
- Không có log prompt đầy đủ cho mọi phiên, nên không thể kiểm toán chính xác từng tương tác hoặc xác nhận toàn bộ output lịch sử đã được con người duyệt.

## Bài học và hành động cải thiện

1. **Gắn output với nguồn ngay khi tạo.** Mỗi claim nghiệp vụ nên có REQ/BR, file và vị trí nguồn; Unknown phải để Open thay vì để AI tự điền.
2. **Lưu raw evidence tách khỏi bản tổng hợp.** Với user research, lưu ghi chú/phê duyệt participant có thể chia sẻ, đánh dấu nội dung nào là quote nguyên văn, paraphrase hay synthesis.
3. **Phân biệt trạng thái tài liệu và trạng thái sản phẩm.** Draft/Planned/Implemented/Verified/Done cần được định nghĩa; chỉ chuyển sang Verified/Done khi có test result/reviewer evidence.
4. **Kiểm tra traceability khi đổi schema/story.** Đồng bộ `user-stories.md`, backlog, endpoint, test ID và commit; task plan không thay cho PR/issue closure.
5. **Ghi thời gian nếu muốn đánh giá năng suất.** Bắt đầu log timestamp, thời lượng AI-assisted và baseline task tương đương làm thủ công; không hồi suy con số cho các phiên cũ.
6. **Đưa kiểm chứng vào release gate.** Chạy CI, test Supabase migration, cập nhật QA evidence và xác nhận tag trỏ đúng release commit trước khi gọi bản phát hành đã xác minh.

## Số liệu và giới hạn

- **AI usage log:** 38 mục được đánh số AI-001 đến AI-038 trong Vault log. Con số này là số dòng log, không phải số prompt/session đã kiểm chứng.
- **QA:** 15 testcase được định nghĩa; 0 thực thi; QA sign-off chưa có, theo QA report.
- **Backlog:** trạng thái được ghi là Draft; không có story nào được xác nhận Done trong nguồn đã rà soát.
- **Thời gian:** không có timestamp/timesheet/baseline; không thể tính thời gian tiết kiệm hoặc tổng công sức.

## Kết luận retrospective

AI hữu ích cho việc phác thảo, cấu trúc và rà soát chéo tài liệu, đặc biệt khi mỗi đề xuất được gắn nguồn và có người chỉnh sửa. Evidence hiện có cũng cho thấy giới hạn rõ: một số output ban đầu cần sửa, nghiên cứu cần đối chiếu raw source, còn QA và production integration chưa xác minh. Retrospective này ghi lại các bằng chứng trong repository; không phải xác nhận độc lập từ toàn bộ thành viên dự án.
