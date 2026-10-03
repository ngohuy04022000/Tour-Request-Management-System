using Microsoft.AspNetCore.Mvc;
using RequestSystem.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Trả lỗi validation theo dạng { message, errors } để frontend hiển thị được thông báo
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .ToDictionary(
                    e => e.Key,
                    e => e.Value!.Errors
                        .Select(x => string.IsNullOrEmpty(x.ErrorMessage) ? "Giá trị không hợp lệ" : x.ErrorMessage)
                        .ToArray());

            var message = errors.Values.SelectMany(v => v).FirstOrDefault() ?? "Dữ liệu không hợp lệ";
            return new BadRequestObjectResult(new { message, errors });
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Tour Request API", Version = "v1" });
});

builder.Services.AddSingleton<InMemoryStore>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    is { Length: > 0 } configured
        ? configured
        : new[] { "http://localhost:3000", "http://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

app.Run();
