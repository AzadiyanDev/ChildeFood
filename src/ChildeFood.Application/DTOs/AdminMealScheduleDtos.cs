namespace ChildeFood.Application.DTOs;

// DTO برای نمایش هر روز در نوار تقویم افقی بالای صفحه
public class AdminCalendarDayDto
{
    // تاریخ میلادی این روز
    public DateOnly Date { get; set; }

    // نام روز هفته به فارسی (شنبه، یکشنبه، ...)
    public string DayName { get; set; } = string.Empty;

    // روز ماه — فقط عدد نمایشی
    public int DayNumber { get; set; }

    // آیا این روز امروزه؟ — نارنجی میشه
    public bool IsToday { get; set; }

    // آیا این روز گذشته؟ — خاکستری و ریدانلی میشه
    public bool IsPast { get; set; }

    // آیا برنامه غذایی برای این روز ثبت شده؟ — بوردر مشکی میشه
    public bool HasSchedule { get; set; }

    // تعداد آیتم‌های غذایی برنامه‌ریزی شده برای نمایش بج
    public int ScheduledItemCount { get; set; }
}

// DTO برای نمایش یک آیتم برنامه غذایی در روز انتخابی
public class ScheduledMealItemDto
{
    // شناسه ردیف DailyMealSchedule
    public Guid ScheduleId { get; set; }

    // شناسه غذا
    public Guid FoodItemId { get; set; }

    // عنوان غذا (Title نه Name!)
    public string Title { get; set; } = string.Empty;

    // ایموجی غذا برای نمایش فانتزی
    public string? Emoji { get; set; }

    // قیمت پرس کامل
    public decimal Price { get; set; }

    // حداکثر ظرفیت این وعده
    public int MaxCapacity { get; set; }

    // دسته‌بندی غذا برای نمایش بج رنگی
    public string Category { get; set; } = string.Empty;
}

// DTO برای نمایش یک غذا در مودال انتخاب غذا
public class FoodItemPickerDto
{
    // شناسه غذا
    public Guid Id { get; set; }

    // عنوان غذا
    public string Title { get; set; } = string.Empty;

    // ایموجی برای نمایش تصویری
    public string? Emoji { get; set; }

    // قیمت برای راهنمایی مدیر
    public decimal Price { get; set; }

    // دسته‌بندی
    public string Category { get; set; } = string.Empty;

    // آیا الان موجوده؟
    public bool IsAvailable { get; set; }
}

// DTO برای اضافه کردن غذاها به یک روز — پیلود ریکوئست
public class AddMealsToScheduleDto
{
    // تاریخ روز هدف
    public DateOnly Date { get; set; }

    // شناسه غذاهای انتخاب شده
    public List<Guid> FoodItemIds { get; set; } = new();

    // ظرفیت پیش‌فرض هر وعده (اختیاری)
    public int MaxCapacity { get; set; } = 100;

    // شناسه مدرسه — اگر null باشه، برای همه مدارس اعمال میشه
    public Guid? SchoolId { get; set; }
}

// DTO برای حذف یک آیتم از برنامه روز
public class RemoveMealFromScheduleDto
{
    // شناسه ردیف DailyMealSchedule که باید حذف بشه
    public Guid ScheduleId { get; set; }
}
