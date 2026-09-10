using ChildeFood.Domain.Entities;

namespace ChildeFood.Application.Interfaces;

// اینترفیس مدیریت کدهای یکبارمصرف در دیتابیس؛ ثبت، بررسی اعتبار زمانی، و یکبار مصرف کردن کدها
public interface IOtpRepository : IGenericRepository<OtpCode>
{
    // دریافت جدیدترین کد معتبر (منقضی‌نشده و مصرف‌نشده) برای یک شماره تلفن و تطبیق با کد ورودی
    Task<OtpCode?> GetLatestValidOtpAsync(string phoneNumber, string code, CancellationToken cancellationToken = default);

    // ابطال تمام کدهای قبلی فعال برای یک شماره موبایل موقع صدور کد جدید (تا فقط آخرین کد پیامک‌شده معتبر بمونه)
    Task InvalidatePreviousOtpsAsync(string phoneNumber, CancellationToken cancellationToken = default);
}
