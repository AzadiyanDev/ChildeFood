using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// ریپازیتوری کوپن تخفیف؛ چک کردن انقضای تاریخ، سقف استفاده، و بررسی حداقل رقم فاکتور سفارش.
public class CouponRepository : GenericRepository<Coupon>, ICouponRepository
{
    public CouponRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Code.ToUpper() == normalizedCode, cancellationToken);
    }

    public async Task<bool> IsCouponValidAsync(string code, decimal orderAmount, CancellationToken cancellationToken = default)
    {
        var coupon = await GetByCodeAsync(code, cancellationToken);
        if (coupon is null)
            return false;

        // کوپن باید فعال باشه
        if (!coupon.IsActive)
            return false;

        // اگر تاریخ انقضا داره، نباید منقضی شده باشه
        if (coupon.ExpiryDate.HasValue && coupon.ExpiryDate.Value < DateTime.UtcNow)
            return false;

        // نباید به سقف مجاز مصرف رسیده باشه
        if (coupon.UsedCount >= coupon.UsageLimit)
            return false;

        // آیا حداقل رقم سفارش رعایت شده؟
        if (coupon.MinOrderAmount.HasValue && orderAmount < coupon.MinOrderAmount.Value)
            return false;

        return true;
    }
}
