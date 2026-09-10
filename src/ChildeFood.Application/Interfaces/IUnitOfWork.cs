namespace ChildeFood.Application.Interfaces;

// الگوی واحد کار (Unit Of Work)؛ تضمین می‌کنه تمام تغییرات در قالب یک تراکنش اتمیک (یا همه یا هیچ) در دیتابیس ذخیره بشن.
public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    // دسترسی مستقیم به ریپازیتوری فرزندان
    IChildRepository Children { get; }

    // دسترسی مستقیم به ریپازیتوری غذاها
    IFoodRepository Foods { get; }

    // دسترسی مستقیم به ریپازیتوری سفارش‌ها
    IOrderRepository Orders { get; }

    // دسترسی مستقیم به ریپازیتوری کیف پول
    IWalletRepository Wallets { get; }

    // دسترسی مستقیم به ریپازیتوری کوپن‌ها
    ICouponRepository Coupons { get; }

    // دسترسی مستقیم به ریپازیتوری کدهای یکبارمصرف ورود (OTP)
    IOtpRepository OtpCodes { get; }

    // ذخیره کردن تمامی تغییرات در دیتابیس
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    // شروع یک ترنزکشن جدید
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    // ثبت نهایی و کامیت ترنزکشن
    Task CommitAsync(CancellationToken cancellationToken = default);

    // رول‌بک کردن تغییرات در صورت بروز هرگونه خطا
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
