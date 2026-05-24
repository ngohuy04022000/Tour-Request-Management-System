using RequestSystem.Api.Models;

namespace RequestSystem.Api.Data;

public class InMemoryStore
{
    private readonly List<TourRequest> _requests = new();
    private readonly object _lock = new();

    public List<TourRequest> GetAll()
    {
        lock (_lock)
            return _requests.OrderByDescending(r => r.CreatedAt).ToList();
    }

    public TourRequest? GetById(Guid id)
    {
        lock (_lock)
            return _requests.FirstOrDefault(r => r.Id == id);
    }

    public TourRequest Add(TourRequest request)
    {
        lock (_lock)
        {
            _requests.Add(request);
            return request;
        }
    }
}