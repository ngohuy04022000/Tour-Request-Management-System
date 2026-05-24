namespace RequestSystem.Api.Models;

public class TourRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TourName { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }
    public string PersonInCharge { get; set; } = string.Empty;
    public TourType TourType { get; set; }
    public int GuestCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ServiceItem> Services { get; set; } = new();

    public decimal TotalCost => Services.Sum(s => s.TotalAmount);

    public string Status => TotalCost > 100_000_000
        ? "Chờ duyệt quản lý"
        : "Đã tiếp nhận";

    public bool ShowMiceWarning =>
        TourType == TourType.MICE && GuestCount < 10;
}