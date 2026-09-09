using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر دمپ (Dumb Controller) گزارش‌ها و آمارهای مدیریتی؛
// طبق قوانین سفت و سخت معماری تمیز، صفر خط بیزینس لاجیک داخل این کنترلر وجود دارد و تمام وظایف از جمله تولید فایل‌های XLSX و PDF به لایه Infrastructure محول شده است.
[ApiController]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly IAdminReportService _reportService;

    public AdminReportsController(IAdminReportService reportService)
    {
        _reportService = reportService;
    }

    // دریافت داده‌های تحلیلی و لیست سفارشات فیلتر شده
    [HttpGet]
    public async Task<ActionResult<AdminReportResponseDto>> GetReportData([FromQuery] AdminReportFilterDto filter)
    {
        var result = await _reportService.GetReportDataAsync(filter);
        return Ok(result);
    }

    // دانلود مستقیم فایل واقعی اکسل مایکروسافت (.xlsx) تولید شده در سرور دات‌نت با پکیج ClosedXML
    [HttpGet("excel")]
    public async Task<IActionResult> DownloadExcelReport([FromQuery] AdminReportFilterDto filter)
    {
        var (fileBytes, fileName, contentType) = await _reportService.GenerateExcelReportAsync(filter);
        return File(fileBytes, contentType, fileName);
    }

    // دانلود مستقیم فایل استاندارد پی‌دی‌اف (.pdf) تولید شده در سرور دات‌نت با پکیج QuestPDF
    [HttpGet("pdf")]
    public async Task<IActionResult> DownloadPdfReport([FromQuery] AdminReportFilterDto filter)
    {
        var (fileBytes, fileName, contentType) = await _reportService.GeneratePdfReportAsync(filter);
        return File(fileBytes, contentType, fileName);
    }
}
