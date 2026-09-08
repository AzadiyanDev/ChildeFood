using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// جدول زمان‌بندی روزانه وعده‌های غذایی مدارس؛ مشخص می‌کنه فلان روز در فلان مدرسه چه غذایی با چه ظرفیتی سرو میشه.
public class DailyMealSchedule : BaseEntity
{
    // تاریخ روز سرو غذا (بدون بخش ساعت)
    public DateOnly Date { get; set; }

    // شناسه غذایی که برای این روز برنامه‌ریزی شده
    public Guid FoodItemId { get; set; }

    // شناسه مدرسه‌ای که این برنامه براش تنظیم شده
    public Guid SchoolId { get; set; }

    // حداکثر ظرفیت سفارش برای این وعده (جهت جلوگیری از سفارش بیش از حد توان آشپزخانه)
    public int MaxCapacity { get; set; } = 100;

    // آیا این روز تعطیل رسمیه و نباید امکان سفارش داده بشه؟
    public bool IsHoliday { get; set; } = false;

    // ناوبری: اطلاعات غذای اختصاص یافته
    public FoodItem? FoodItem { get; set; }

    // ناوبری: اطلاعات مدرسه مربوطه
    public School? School { get; set; }
}
