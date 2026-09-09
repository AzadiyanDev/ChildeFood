using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سرویس مدیریت مدارس توی پنل ادمین
// هر عملیاتی مربوط به مدارس از اینجا رد میشه
public interface IAdminSchoolService
{
    // همه مدارس رو با آمار خلاصه برمیگردونه (برای جدول اصلی)
    Task<List<AdminSchoolListItemDto>> GetAllSchoolsAsync();

    // دیتیل کامل یه مدرسه خاص — اگه پیدا نشد null برمیگردونه
    Task<AdminSchoolDetailDto?> GetSchoolDetailAsync(Guid schoolId);

    // مدرسه جدید می‌سازه و DTO ساخته‌شده رو برمیگردونه
    Task<AdminSchoolListItemDto> CreateSchoolAsync(CreateSchoolDto dto);

    // وضعیت IsActive مدرسه رو برعکس می‌کنه و وضعیت جدید رو برمیگردونه
    Task<bool> ToggleSchoolStatusAsync(Guid schoolId);
}
