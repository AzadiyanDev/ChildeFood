using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سفارشات مدارس؛ پیدا کردن سفارش با کد پیگیری، تاریخچه سفارش‌های والد یا فرزند، و واکشی فاکتور کامل با آیتم‌ها.
public interface IOrderRepository : IGenericRepository<SchoolOrder>
{
    // دریافت سفارش بر اساس کد سفارش اختصاصی کاربر (مثل ORD-...)
    Task<SchoolOrder?> GetOrderByCodeAsync(string orderCode, CancellationToken cancellationToken = default);

    // دریافت لیست تمامی سفارش‌های یک والد
    Task<IReadOnlyList<SchoolOrder>> GetOrdersByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default);

    // دریافت تمامی سفارش‌های ثبت شده برای یک فرزند خاص
    Task<IReadOnlyList<SchoolOrder>> GetOrdersByChildIdAsync(Guid childId, CancellationToken cancellationToken = default);

    // دریافت یک سفارش همراه با کلیه ردیف‌های غذایی و اطلاعات فرزند
    Task<SchoolOrder?> GetOrderWithItemsAsync(Guid orderId, CancellationToken cancellationToken = default);

    // دریافت سفارش‌های یک روز خاص برای هماهنگی با آشپزخانه مدرسه
    Task<IReadOnlyList<SchoolOrder>> GetOrdersByDateAndStatusAsync(DateOnly servingDate, OrderStatus? status, CancellationToken cancellationToken = default);
}
