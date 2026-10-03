using Microsoft.AspNetCore.Mvc;
using RequestSystem.Api.Data;
using RequestSystem.Api.DTOs;
using RequestSystem.Api.Models;

namespace RequestSystem.Api.Controllers;

[ApiController]
[Route("api/requests")]
public class RequestsController : ControllerBase
{
    private readonly InMemoryStore _store;

    public RequestsController(InMemoryStore store)
    {
        _store = store;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TourRequestResponseDto>> GetAll()
    {
        var requests = _store.GetAll();
        return Ok(requests.Select(MapToResponse));
    }

    [HttpGet("{id:guid}")]
    public ActionResult<TourRequestResponseDto> GetById(Guid id)
    {
        var request = _store.GetById(id);
        if (request is null)
            return NotFound(new { message = $"Không tìm thấy phiếu có ID: {id}" });

        return Ok(MapToResponse(request));
    }

    [HttpPost]
    public ActionResult<TourRequestResponseDto> Create([FromBody] CreateTourRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TourName))
            return BadRequest(new { message = "Tên tour là bắt buộc" });

        if (dto.DepartureDate is null)
            return BadRequest(new { message = "Ngày khởi hành là bắt buộc" });

        if (dto.DepartureDate.Value.Date < DateTime.Today)
            return BadRequest(new { message = "Ngày khởi hành không được ở trong quá khứ" });

        if (dto.GuestCount is null or <= 0)
            return BadRequest(new { message = "Số lượng khách phải > 0" });

        if (dto.Services == null || dto.Services.Count == 0)
            return BadRequest(new { message = "Phải có ít nhất 1 dịch vụ" });

        foreach (var svc in dto.Services)
        {
            if (svc is null)
                return BadRequest(new { message = "Dữ liệu dịch vụ không hợp lệ" });
            if (svc.Quantity <= 0)
                return BadRequest(new { message = $"Số lượng dịch vụ '{svc.ServiceName}' phải > 0" });
            if (svc.UnitPrice <= 0)
                return BadRequest(new { message = $"Đơn giá dịch vụ '{svc.ServiceName}' phải > 0" });
        }

        if (!Enum.TryParse<TourType>(dto.TourType, ignoreCase: true, out var tourType)
            || !Enum.IsDefined(tourType))
            return BadRequest(new { message = "Loại tour không hợp lệ. Chấp nhận: FIT, GIT, MICE" });

        var request = new TourRequest
        {
            TourName = dto.TourName.Trim(),
            DepartureDate = dto.DepartureDate.Value.Date,
            PersonInCharge = dto.PersonInCharge?.Trim() ?? string.Empty,
            TourType = tourType,
            GuestCount = dto.GuestCount.Value,
            Services = dto.Services.Select(s => new ServiceItem
            {
                ServiceType = s.ServiceType.Trim(),
                ServiceName = s.ServiceName.Trim(),
                Supplier = s.Supplier.Trim(),
                Quantity = s.Quantity,
                UnitPrice = s.UnitPrice,
                Notes = string.IsNullOrWhiteSpace(s.Notes) ? null : s.Notes.Trim()
            }).ToList()
        };

        _store.Add(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = request.Id },
            MapToResponse(request)
        );
    }

    private static TourRequestResponseDto MapToResponse(TourRequest r) => new()
    {
        Id = r.Id,
        TourName = r.TourName,
        DepartureDate = r.DepartureDate,
        PersonInCharge = r.PersonInCharge,
        TourType = r.TourType.ToString(),
        GuestCount = r.GuestCount,
        TotalCost = r.TotalCost,
        Status = r.Status,
        ShowMiceWarning = r.ShowMiceWarning,
        CreatedAt = r.CreatedAt,
        Services = r.Services.Select(s => new ServiceItemResponseDto
        {
            ServiceType = s.ServiceType,
            ServiceName = s.ServiceName,
            Supplier = s.Supplier,
            Quantity = s.Quantity,
            UnitPrice = s.UnitPrice,
            TotalAmount = s.TotalAmount,
            Notes = s.Notes
        }).ToList()
    };
}