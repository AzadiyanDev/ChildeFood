using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر کاملاً دام (Dumb Controller) داشبورد ادمین
// طبق قوانین طلایی پروژه، یک خط منطق بیزینس هم اینجا نمی‌نویسیم؛ فقط ریکوئست رو می‌گیریم،
// پاس میدیم به لایه زیرساخت (AdminDashboardService) و خروجی رو شیک برمی‌گردونیم.
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;

    public AdminDashboardController(IAdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // دریافت داده‌های تجمیعی داشبورد ادمین (شاخص‌های KPI، نمودارهای دونات، خلاصه‌های مالی و ۵ تراکنش آخر)
    [HttpGet]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboardData(CancellationToken cancellationToken)
    {
        var data = await _dashboardService.GetDashboardDataAsync(cancellationToken);
        return Ok(data);
    }
}
