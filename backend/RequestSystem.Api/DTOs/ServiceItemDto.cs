using System.ComponentModel.DataAnnotations;

namespace RequestSystem.Api.DTOs;

public class ServiceItemDto
{
    [Required(ErrorMessage = "Loại dịch vụ là bắt buộc")]
    public string ServiceType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên dịch vụ là bắt buộc")]
    public string ServiceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nhà cung cấp là bắt buộc")]
    public string Supplier { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải > 0")]
    public int Quantity { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Đơn giá phải > 0")]
    public decimal UnitPrice { get; set; }

    public string? Notes { get; set; }
}