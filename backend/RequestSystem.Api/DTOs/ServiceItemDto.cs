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

    [Range(1, 1_000_000, ErrorMessage = "Số lượng phải từ 1 đến 1,000,000")]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0.01", "1000000000000", ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true, ErrorMessage = "Đơn giá phải > 0 và không vượt quá 1,000,000,000,000")]
    public decimal UnitPrice { get; set; }

    public string? Notes { get; set; }
}