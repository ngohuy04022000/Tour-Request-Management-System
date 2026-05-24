# AI Usage Report

## 1) Phần đã dùng AI cho bài này
Tôi sử dụng AI để hỗ trợ:
- Phân tích đề bài và tách yêu cầu thành backend, frontend, nghiệp vụ, tài liệu
- Thiết kế cấu trúc dữ liệu cho phiếu đề nghị đặt dịch vụ tour
- Đề xuất rule nghiệp vụ và cách hiển thị cảnh báo / trạng thái
- Tạo khung README, AI_USAGE và nội dung mô tả giải pháp
- Hỗ trợ kiểm tra tính hợp lý của luồng màn hình tạo phiếu và danh sách phiếu

## 2) Prompt chính đã dùng
```text
Hãy phân tích đề bài ứng tuyển vị trí Fullstack C#/.NET Core + Next.js:
- Xây dựng mini system quản lý Phiếu đề nghị đặt dịch vụ tour
- Backend ASP.NET Core Web API với các endpoint POST /api/requests, GET /api/requests, GET /api/requests/{id}
- Frontend Next.js gồm màn hình tạo phiếu và màn hình danh sách phiếu
- Áp dụng các rule nghiệp vụ:
  + Tên tour, ngày khởi hành, loại tour, số lượng khách là bắt buộc
  + Phải có ít nhất 1 dịch vụ
  + Số lượng và đơn giá > 0
  + Thành tiền dòng = số lượng x đơn giá
  + Tổng chi phí phiếu = tổng các dòng
  + Nếu loại tour là MICE và số lượng khách < 10 thì hiển thị cảnh báo
  + Nếu tổng chi phí > 100,000,000 thì trạng thái = "Chờ duyệt quản lý", ngược lại = "Đã tiếp nhận"
- Hãy đề xuất cấu trúc dữ liệu, luồng xử lý, và nội dung README/AI_USAGE cần có.
```

## 3) Bản chỉnh lại từ output AI
Tôi đã chỉnh lại output AI để phù hợp với bài nộp thực tế như sau:
- Chọn lưu trữ in-memory thay vì thêm DB để hoàn thành nhanh và đúng phạm vi đề
- Chuẩn hoá tên route theo `/api/requests`
- Tách rõ DTO request / response
- Thêm phần cảnh báo MICE < 10 khách ở UI
- Hiển thị trạng thái theo tổng chi phí
- Viết README theo hướng nêu rõ giả định nghiệp vụ và câu hỏi mở nếu triển khai thực tế
- Giữ UI đơn giản, dễ đọc, phục vụ mục tiêu bài test trong thời gian ngắn

## 4) Lưu ý
AI chỉ được dùng như công cụ hỗ trợ phân tích và tăng tốc triển khai.
Phần final vẫn cần kiểm tra lại logic, naming, và khả năng chạy thực tế trước khi nộp.
