using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// قرارداد سرویس مدارس؛ دریافت لیست مدارس برای سلکت‌باکس ثبت فرزند و مدیریت مدارس توسط ادمین
public interface ISchoolService
{
    // دریافت تمامی مدارس فعال جهت نمایش در سلکت‌باکس فرانت‌اند
    Task<IReadOnlyList<SchoolDto>> GetActiveSchoolsAsync(CancellationToken cancellationToken = default);

    // افزودن مدرسه جدید توسط ادمین سامانه
    Task<SchoolDto> CreateSchoolAsync(CreateSchoolDto dto, CancellationToken cancellationToken = default);

    // سید کردن اولیه مدارس شاخص و معتبر در صورت خالی بودن دیتابیس
    Task SeedDefaultSchoolsAsync(CancellationToken cancellationToken = default);
}
