using Microsoft.AspNetCore.Identity;

namespace ChildeFood.Domain.Entities;

// کلاس کاربر اصلی بر پایه آیدنتیتی؛ آیدی از نوع Guid هست تا همه چیز مدرن و یونیک باشه.
public class ApplicationUser : IdentityUser<Guid>
{
    // نام و نام خانوادگی والد یا کاربر سیستم
    public string FullName { get; set; } = string.Empty;

    // کدملی جهت احراز هویت و امنیت
    public string? NationalId { get; set; }

    // آدرس محل سکونت جهت سوابق و هماهنگی‌ها
    public string? Address { get; set; }

    // تصویر پروفایل کاربر
    public string? AvatarUrl { get; set; }

    // عنوان نقش (مثلا والد، مدیر مدرسه یا مدیر رستوران)
    public string? RoleTitle { get; set; }

    // فلگ ارسال پیامک اعلان‌ها؛ کاربر می‌تونه خاموش یا روشنش کنه
    public bool IsSmsNotificationActive { get; set; } = true;

    // زمان عضویت کاربر در سیستم
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ناوبری: بچه‌های تحت تکفل این والد
    public ICollection<Child> Children { get; set; } = new List<Child>();

    // ناوبری: سفارش‌های ثبت‌شده توسط این کاربر
    public ICollection<SchoolOrder> Orders { get; set; } = new List<SchoolOrder>();

    // ناوبری: کیف پول اختصاصی والد
    public Wallet? Wallet { get; set; }

    // ناوبری: تمام تراکنش‌های مالی مرتبط با این والد
    public ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();
}

// نقش‌های استاندارد سیستم به صورت ثابت تا خطای تایپی توی کد پیش نیاد
public static class UserRoles
{
    public const string Parent = "Parent";
    public const string Admin = "Admin";
    public const string RestaurantManager = "RestaurantManager";
}
