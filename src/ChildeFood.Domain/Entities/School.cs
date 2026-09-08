using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// موجودیت مدرسه؛ مدرسه‌ای که سفارش‌ها قراره براش ارسال بشه و دانش‌آموزان اونجا درس می‌خونن.
public class School : BaseEntity
{
    // نام مدرسه یا مجتمع آموزشی
    public string Name { get; set; } = string.Empty;

    // کد شعبه یا شناسه یکتای مدرسه
    public string BranchCode { get; set; } = string.Empty;

    // نشانی دقیق پستی مدرسه
    public string Address { get; set; } = string.Empty;

    // ساعت پیش‌فرض تحویل و سرو ناهار (مثلاً ۱۲:۳۰)
    public string DefaultLunchTime { get; set; } = "12:30";

    // نام و شماره تماس رابط یا مسئول پذیرایی مدرسه
    public string? ContactPerson { get; set; }

    // وضعیت فعال/غیرفعال بودن همکاری با مدرسه
    public bool IsActive { get; set; } = true;

    // ناوبری: دانش‌آموزانی که در این مدرسه ثبت‌نام هستند
    public ICollection<Child> Children { get; set; } = new List<Child>();

    // ناوبری: برنامه زمان‌بندی وعده‌های ناهار مدرسه
    public ICollection<DailyMealSchedule> MealSchedules { get; set; } = new List<DailyMealSchedule>();
}
