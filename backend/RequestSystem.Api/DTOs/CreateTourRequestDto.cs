using System.ComponentModel.DataAnnotations;

namespace RequestSystem.Api.DTOs;

public class CreateTourRequestDto
{
    [Required(ErrorMessage = "Tên tour là bắt buộc")]
    public string TourName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ngày khởi hành là bắt buộc")]
    public DateTime DepartureDate { get; set; }

    public string PersonInCharge { get; set; } = string.Empty;

    [Required(ErrorMessage = "Loại tour là bắt buộc")]
    [RegularExpression("^(FIT|GIT|MICE)$", ErrorMessage = "Loại tour phải là FIT, GIT hoặc MICE")]
    public string TourType { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng khách phải > 0")]
    public int GuestCount { get; set; }

    [MinLength(1, ErrorMessage = "Phải có ít nhất 1 dịch vụ")]
    public List<ServiceItemDto> Services { get; set; } = new();
}