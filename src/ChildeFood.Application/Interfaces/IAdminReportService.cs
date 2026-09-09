using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سرویس گزارشات و آمار پنل ادمین؛
// تمامی محاسبات سنگین فیلترها و تولید مستقیم فایل‌های واقعی Excel (.xlsx) و PDF (.pdf) در لایه زیرساخت تعریف شده است.
public interface IAdminReportService
{
    // دریافت اطلاعات جامع گزارش با توجه به فیلترهای ارسالی
    Task<AdminReportResponseDto> GetReportDataAsync(AdminReportFilterDto filter);

    // تولید فایل رسمی و استاندارد مایکروسافت اکسل (.xlsx) با ClosedXML
    Task<(byte[] FileBytes, string FileName, string ContentType)> GenerateExcelReportAsync(AdminReportFilterDto filter);

    // تولید فایل استاندارد پی‌دی‌اف (.pdf) واقعی در سرور دات‌نت با QuestPDF
    Task<(byte[] FileBytes, string FileName, string ContentType)> GeneratePdfReportAsync(AdminReportFilterDto filter);
}
