using System.Linq.Expressions;

namespace ChildeFood.Application.Interfaces;

// اینترفیس جنریک ریپازیتوری؛ عملیات استاندارد پایه‌ای مثل افزودن، ویرایش، حذف و گرفتن دیتا رو اینجا یکپارچه می‌کنیم.
public interface IGenericRepository<T> where T : class
{
    // دریافت یک رکورد با کلید اصلی
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // دریافت تمامی رکوردهای جدول
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);

    // فیلتر کردن رکوردها بر اساس شرط مشخص
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    // افزودن یک انتیتی جدید
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);

    // بروزرسانی وضعیت یک انتیتی در دیتابیس
    void Update(T entity);

    // حذف یک انتیتی
    void Delete(T entity);

    // بررسی سریع وجود داشتن یک رکورد بر اساس آیدی (سبک و بدون لود آبجکت)
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}
