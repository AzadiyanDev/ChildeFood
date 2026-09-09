using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// قرارداد لایه اپلیکیشن؛ اینجا مشخص می‌کنیم برای داشبورد ادمین به چه متدهایی نیاز داریم
public interface IAdminDashboardService
{
    // دریافت یکجای تمام دیتای تحلیلی، نمودارها و تراکنش‌های زنده داشبورد
    Task<AdminDashboardDto> GetDashboardDataAsync(CancellationToken cancellationToken = default);
}
