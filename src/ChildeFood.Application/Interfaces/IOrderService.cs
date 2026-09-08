using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سرویس سفارشات؛ واکشی سفارش‌های امروز، صفحه‌بندی ۱۰تایی لیست سفارش‌ها و واکشی جزئیات کامل
public interface IOrderService
{
    // دریافت سفارش‌های امروز ثبت‌شده برای فرزندان یک والد به همراه وضعیت دقیق آماده‌سازی یا تحویل
    Task<IReadOnlyList<TodayOrderDto>> GetTodayOrdersAsync(Guid parentId, DateOnly? date = null, CancellationToken cancellationToken = default);

    // دریافت سفارش‌های امروز با شماره تلفن همراه والد
    Task<IReadOnlyList<TodayOrderDto>> GetTodayOrdersByPhoneAsync(string phone, DateOnly? date = null, CancellationToken cancellationToken = default);

    // دریافت لیست سفارش‌های والد به صورت صفحه‌بندی شده (۱۰ تا ۱۰ تا) با قابلیت اسکرول نامحدود
    Task<PagedOrdersDto> GetParentOrdersPagedAsync(Guid parentId, int pageNumber = 1, int pageSize = 10, string? statusFilter = null, CancellationToken cancellationToken = default);

    // دریافت جزئیات کامل و ریز اقلام یک سفارش خاص برای نمایش در مدال
    Task<OrderDetailDto?> GetOrderDetailAsync(Guid orderId, CancellationToken cancellationToken = default);

    // اطمینان از وجود سفارش‌های نمونه برای تست واقعی اسکرول و صفحه‌بندی
    Task EnsureSampleOrdersAsync(Guid parentId, CancellationToken cancellationToken = default);
}
