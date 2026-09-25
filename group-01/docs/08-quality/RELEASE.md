**Added**
- Tạo Purchase Request với trạng thái ban đầu `PENDING_APPROVAL`.
- Manager có thể xử lý Purchase Request đang ở trạng thái `PENDING_APPROVAL`.
- Manager có thể Approve Purchase Request.
- Manager có thể Reject Purchase Request.
- Manager có thể Request Revision cho Purchase Request.
- Khi Approve, Purchase Request chuyển sang `APPROVED` và bước tiếp theo là Finance.
- Khi Reject, Purchase Request chuyển sang `REJECTED`.
- Khi Request Revision, Purchase Request chuyển sang `REVISION_REQUIRED`.
- Hệ thống lưu thông tin người thực hiện, thời gian và comment của quyết định Approval.
- Endpoint xử lý Approval yêu cầu quyền `manager`.
- Không cho phép xử lý lại Purchase Request đã rời trạng thái `PENDING_APPROVAL`.
  
**Quality**
- Kiểm thử Approval Workflow: 5/5 test pass.
- Đã kiểm thử Manager Approve, Reject và Request Revision.
- Đã kiểm thử phân quyền: Employee không được thực hiện Approval.
- Đã kiểm thử không cho xử lý lại Purchase Request đã được xử lý.
- 
**Known issues**
- AI feature chưa được triển khai trong phiên bản này.
- Approval workflow hiện sử dụng role được cấu hình sẵn, chưa hỗ trợ cấu hình Approval hierarchy.