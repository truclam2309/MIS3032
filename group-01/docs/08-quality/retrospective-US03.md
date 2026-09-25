# Nhìn lại — US-03 Approval

## Việc đã làm

- Rà soát code API, migration và hai bộ test.
- Chuẩn hóa test còn 5 hành động nghiệp vụ ở memory và 5 hành động trên Supabase thật.
- Bổ sung điều kiện update theo `PENDING_APPROVAL` để một decision đến sau không ghi đè decision đã lưu.
- Bổ sung SELECT sau INSERT PR để response phản ánh record vừa ghi.
- Cập nhật tài liệu để tách rõ backend đã kiểm thử và phần UI/workflow còn thiếu.

## Kết quả và giới hạn

- Memory: 5/5 test đạt.
- Supabase thật: 5/5 test đạt.
- Supabase role dùng cho test không có quyền DELETE; các dòng thử có ID UUID riêng và được giữ lại.
- Chưa có UI/E2E, audit append-only, Finance decision endpoint hoặc resubmission.
- Chưa ghi nhận thời lượng công việc có thể đo lường; không ước lượng số giờ tiết kiệm.

## Bài học

- Test phải xác nhận storage mode từ cấu hình thực tế; nếu test tự ép mode có thể tạo kết quả xanh nhưng không chạm Supabase.
- Integration test phải xác nhận INSERT thành công và dùng đúng ID khi gọi API.
- Không cấp quyền DELETE rộng chỉ để dọn dữ liệu thử; dùng namespace/mã test duy nhất và ghi rõ dữ liệu tồn lưu.
- Pass của backend không chứng minh UI permission hoặc toàn bộ Acceptance Criteria đã hoàn tất.
