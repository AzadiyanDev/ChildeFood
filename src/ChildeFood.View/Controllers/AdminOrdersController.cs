using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدیریت سفارش‌های مدارس در پنل ادمین
// کاملاً Dumb؛ صفر لاجیک بیزینس، صرفاً روتینگ و بازگرداندن پاسخ
[ApiController]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IAdminOrderService _orderService;

    public AdminOrdersController(IAdminOrderService orderService)
    {
        _orderService = orderService;
    }

    // دریافت خلاصه سفارش‌های روزانه به تفکیک مدارس
    // GET: api/admin/orders?date=2026-09-09
    [HttpGet]
    public async Task<IActionResult> GetSchoolOrders([FromQuery] DateOnly? date)
    {
        var result = await _orderService.GetSchoolOrdersSummaryAsync(date);
        return Ok(result);
    }

    // دریافت گزارش تفصیلی سفارش‌های یک مدرسه (جهت دانلود اکسل یا پرینت مانیفست)
    // GET: api/admin/orders/school/{schoolId}/report?date=2026-09-09
    [HttpGet("school/{schoolId:guid}/report")]
    public async Task<IActionResult> GetSchoolReport(Guid schoolId, [FromQuery] DateOnly? date)
    {
        var report = await _orderService.GetSchoolOrdersReportAsync(schoolId, date);
        if (report == null)
            return NotFound(new { message = "اطلاعات مدرسه‌ای با این مشخصات یافت نشد." });

        return Ok(report);
    }

    // تغییر وضعیت آماده‌سازی کلیه سفارش‌های یک مدرسه
    // PUT: api/admin/orders/school/{schoolId}/status
    [HttpPut("school/{schoolId:guid}/status")]
    public async Task<IActionResult> UpdateSchoolStatus(Guid schoolId, [FromBody] UpdateSchoolOrderStatusDto request)
    {
        var success = await _orderService.UpdateSchoolOrdersStatusAsync(schoolId, request.Date, request.NewStatus);
        var statusLabel = request.NewStatus switch
        {
            ChildeFood.Domain.Enums.OrderStatus.Preparing => "در حال پخت و بسته‌بندی",
            ChildeFood.Domain.Enums.OrderStatus.Delivered => "تحویل داده شده به مدرسه",
            ChildeFood.Domain.Enums.OrderStatus.Paid => "در انتظار آماده‌سازی",
            _ => "در صف آماده‌سازی"
        };

        return Ok(new { success, statusLabel });
    }
}
