using ChildeFood.Domain.Entities;

namespace ChildeFood.Application.Interfaces;

// اینترفیس ریپازیتوری کوپن تخفیف؛ چک کردن انقضا، سقف مصرف، و اعتبارسنجی زنده موقع ثبت سفارش.
public interface ICouponRepository : IGenericRepository<Coupon>
{
    // واکشی کوپن با کد وارد شده توسط کاربر
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    // اعتبارسنجی هوشمند اینکه آیا کوپن فعاله، منقضی نشده و حداقل مبلغ سفارش رو پاس می‌کنه یا نه
    Task<bool> IsCouponValidAsync(string code, decimal orderAmount, CancellationToken cancellationToken = default);
}
