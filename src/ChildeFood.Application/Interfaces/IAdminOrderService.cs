using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس مدیریت سفارش‌های مدارس در پنل ادمین
// تمام محاسبات تجمیعی اقلام، فیلترهای روزانه و گزارش‌های اکسل/PDF از اینجا ارائه میشه
public interface IAdminOrderService
{
    // دریافت خلاصه سفارش‌ها به تفکیک مدارس برای یک تاریخ مشخص (امروز یا تاریخ انتخابی)
    Task<List<SchoolOrdersSummaryDto>> GetSchoolOrdersSummaryAsync(DateOnly? date);

    // دریافت گزارش ریز مشخصات دانش‌آموزان و سفارش‌های یک مدرسه جهت خروجی اکسل یا پرینت مانیفست
    Task<SchoolOrdersReportDto?> GetSchoolOrdersReportAsync(Guid schoolId, DateOnly? date);

    // تغییر وضعیت آماده‌سازی کلیه سفارش‌های یک مدرسه در یک تاریخ مشخص
    Task<bool> UpdateSchoolOrdersStatusAsync(Guid schoolId, DateOnly date, ChildeFood.Domain.Enums.OrderStatus newStatus);

    // اطمینان از وجود سفارش‌های واقعی و اقلام غذایی برای مدارس در تاریخ‌های جاری و آینده
    Task EnsureSeedSampleSchoolOrdersAsync();
}
