using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// پیاده‌سازی ریپازیتوری کدهای یکبارمصرف؛ چک کردن انقضای زمانی و یکبار مصرف بودن کدها مستقیماً با کوئری دیتابیس
public class OtpRepository : GenericRepository<OtpCode>, IOtpRepository
{
    public OtpRepository(ApplicationDbContext context) : base(context)
    {
    }

    // دریافت جدیدترین کد معتبر؛ کدی که برای همین شماره موبایل صادر شده، دقیقا با کد ورودی برابره،
    // هنوز نسوخته (IsUsed == false) و تاریخ انقضاش نرسیده (ExpiresAt >= UtcNow)
    public async Task<OtpCode?> GetLatestValidOtpAsync(string phoneNumber, string code, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var cleanPhone = phoneNumber.Trim();
        var cleanCode = code.Trim();

        return await _dbSet
            .Where(x => x.PhoneNumber == cleanPhone &&
                        x.Code == cleanCode &&
                        !x.IsUsed &&
                        x.ExpiresAt >= now)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    // وقتی کاربر دوباره درخواست کد میده، کدهای مصرف‌نشده قبلیش رو می‌سوزونیم تا فقط آخرین کد کار کنه
    public async Task InvalidatePreviousOtpsAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var cleanPhone = phoneNumber.Trim();
        var activeOtps = await _dbSet
            .Where(x => x.PhoneNumber == cleanPhone && !x.IsUsed)
            .ToListAsync(cancellationToken);

        if (activeOtps.Count != 0)
        {
            var now = DateTime.UtcNow;
            foreach (var otp in activeOtps)
            {
                otp.IsUsed = true;
                otp.UsedAt = now;
            }
        }
    }
}
