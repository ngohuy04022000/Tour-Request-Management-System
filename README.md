# Tour Request Management System

Mini system quản lý Phiếu đề nghị đặt dịch vụ tour cho bài ứng tuyển Vietravel.

---

## Cấu trúc dự án

```
.
├── backend/
│   └── RequestSystem.Api/   # Backend - ASP.NET Core 8 Web API
│       ├── Controllers/
│       │   └── RequestsController.cs
│       ├── Data/
│       │   └── InMemoryStore.cs     (thread-safe singleton store)
│       ├── DTOs/
│       │   ├── CreateTourRequestDto.cs
│       │   ├── ServiceItemDto.cs
│       │   ├── ServiceItemResponseDto.cs
│       │   └── TourRequestResponseDto.cs
│       ├── Models/
│       │   ├── TourRequest.cs
│       │   ├── ServiceItem.cs
│       │   └── TourType.cs
│       ├── Properties/
│       │   └── launchSettings.json  (chạy local ở cổng 5000, môi trường Development)
│       ├── Program.cs
│       └── RequestSystem.Api.csproj
│
└── tour-frontend/           # Frontend - Next.js 14 + Tailwind CSS
    ├── components/
    │   ├── Layout.js
    │   └── utils.js         (format tiền/ngày, badge, đọc lỗi API)
    ├── pages/
    │   ├── _app.js
    │   ├── index.js         (Danh sách phiếu)
    │   └── create.js        (Tạo phiếu)
    ├── styles/globals.css
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Cách Chạy

### Chạy backend local

**Yêu cầu:** .NET 8 SDK

```bash
cd backend/RequestSystem.Api
dotnet restore
dotnet run
```

API chạy tại: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

### Chạy frontend local

**Yêu cầu:** Node.js 18+

```bash
cd tour-frontend
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

### Chạy bằng Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8081`

Lần chạy đầu có thể mất vài phút để tải image và cài dependencies.

---

## API Endpoints

| Method | Endpoint             | Mô tả                     |
|--------|----------------------|---------------------------|
| POST   | /api/requests        | Tạo phiếu đề nghị mới     |
| GET    | /api/requests        | Lấy danh sách tất cả phiếu|
| GET    | /api/requests/{id}   | Lấy chi tiết 1 phiếu      |

## Phân Tích BA Mini

### Tôi hiểu bài toán này như thế nào

Đây là một mini system để tiếp nhận và quản lý phiếu đề nghị đặt dịch vụ tour. Người dùng cần tạo phiếu gồm thông tin chung của tour và nhiều dòng dịch vụ, sau đó xem danh sách và chi tiết phiếu. Hệ thống phải tự tính tổng chi phí, xác định trạng thái theo ngưỡng chi phí, và cảnh báo riêng cho trường hợp tour MICE dưới 10 khách.

### Các giả định nghiệp vụ đang dùng

- Dữ liệu được lưu tạm trong bộ nhớ để đáp ứng bài toán nhanh, chưa cần cơ sở dữ liệu.
- Một phiếu luôn có ít nhất 1 dịch vụ trước khi lưu.
- Ngày khởi hành được nhập theo định dạng ngày hợp lệ và backend sẽ chuẩn hoá về kiểu `DateTime`.
- Trạng thái phiếu chỉ dựa trên tổng chi phí của phiếu.
- Cảnh báo MICE < 10 khách chỉ là cảnh báo nghiệp vụ, không chặn lưu phiếu.

### Câu hỏi cần hỏi thêm nếu triển khai thực tế

- Phiếu có cần quy trình duyệt nhiều bước hay chỉ một trạng thái cuối cùng.
- Có cần sửa hoặc xoá phiếu sau khi tạo không.
- Dữ liệu dịch vụ có cần danh mục chuẩn hay người dùng được nhập tự do.
- Có cần lưu lịch sử chỉnh sửa, người tạo, người duyệt và thời gian duyệt không.
- Có cần phân quyền theo vai trò giữa nhân viên, quản lý và admin không.

### POST /api/requests - Request body mẫu

```json
{
  "tourName": "Tour Đà Nẵng 4N3Đ",
  "departureDate": "2025-08-15",
  "personInCharge": "Nguyễn Văn A",
  "tourType": "FIT",
  "guestCount": 20,
  "services": [
    {
      "serviceType": "Khách sạn",
      "serviceName": "Khách sạn Mường Thanh",
      "supplier": "Mường Thanh Group",
      "quantity": 10,
      "unitPrice": 1500000,
      "notes": "2 đêm"
    },
    {
      "serviceType": "Vận chuyển",
      "serviceName": "Xe đưa đón sân bay",
      "supplier": "Công ty vận tải ABC",
      "quantity": 2,
      "unitPrice": 800000,
      "notes": null
    }
  ]
}
```

---

## ⚙️ Quy tắc nghiệp vụ

| Rule | Mô tả |
|------|-------|
| Bắt buộc | Tên tour, ngày khởi hành, loại tour, số lượng khách |
| Dịch vụ | Phải có ít nhất 1 dịch vụ |
| Số lượng/Đơn giá | Phải > 0 |
| Thành tiền dòng | = Số lượng × Đơn giá |
| Tổng chi phí | = Tổng các dòng |
| Cảnh báo MICE | Nếu loại tour = MICE và số khách < 10 |
| Trạng thái | Tổng > 100,000,000 → "Chờ duyệt quản lý"; ngược lại → "Đã tiếp nhận" |

---

## Tech Stack

- **Backend:** ASP.NET Core 8, C# 12, Swagger/OpenAPI
- **Frontend:** Next.js 14 (Pages Router), React 18, Tailwind CSS 3
- **Storage:** In-memory (Singleton) để có thể migrate sang EF Core + SQL Server

CORS mặc định cho phép `http://localhost:3000` và `http://localhost:3001`; có thể thay đổi qua cấu hình `Cors:AllowedOrigins` (ví dụ biến môi trường `Cors__AllowedOrigins__0`).

API URL cho frontend đã được cấu hình trong Docker Compose để trỏ tới backend trên cổng 8081.
