using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// موجودیت فرزند؛ دانش‌آموزی که غذا براش سفارش داده میشه و وابسته به والد و مدرسه‌ست.
public class Child : BaseEntity
{
    // شناسه والدی که این فرزند متعلق به اونه
    public Guid ParentId { get; set; }

    // شناسه مدرسه‌ای که کودک در حال حاضر در اون تحصیل می‌کنه
    public Guid SchoolId { get; set; }

    // نام و نام خانوادگی کامل کودک
    public string FullName { get; set; } = string.Empty;

    // پایه تحصیلی (مثلاً: دوم دبستان، پیش‌دبستانی)
    public string Grade { get; set; } = string.Empty;

    // سن کودک به سال
    public int Age { get; set; }

    // تصویر آواتار انتخابی برای فرزند
    public string? AvatarUrl { get; set; }

    // یادداشت‌های تغذیه‌ای، حساسیت‌ها یا نکات ویژه (مثل حساسیت به بادام‌زمینی)
    public string? DietaryNotes { get; set; }

    // غذای مورد علاقه فرزند جهت پیشنهاددهی هوشمند
    public string? FavoriteFood { get; set; }

    // وضعیت فعال بودن فرزند در پروفایل والد
    public bool IsActive { get; set; } = true;

    // ناوبری: والد کودک
    public ApplicationUser? Parent { get; set; }

    // ناوبری: مدرسه محل تحصیل
    public School? School { get; set; }

    // ناوبری: تاریخچه سفارش‌های ثبت شده برای این فرزند
    public ICollection<SchoolOrder> Orders { get; set; } = new List<SchoolOrder>();

    // ناوبری: تراکنش‌هایی که بابت این فرزند انجام شده
    public ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();
}
