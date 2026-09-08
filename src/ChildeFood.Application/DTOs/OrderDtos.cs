using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// اطلاعات کارت‌های سفارش امروز جهت نمایش در صفحه اصلی اپلیکیشن
public class TodayOrderDto
{
    // شناسه یکتای سفارش
    public Guid Id { get; set; }

    // کد پیگیری سفارش (مثلاً ORD-14030610-01)
    public string OrderCode { get; set; } = string.Empty;

    // شناسه فرزند
    public Guid ChildId { get; set; }

    // نام و نام خانوادگی فرزند
    public string ChildName { get; set; } = string.Empty;

    // تصویر آواتار فرزند
    public string? ChildAvatar { get; set; }

    // نام مدرسه فرزند
    public string SchoolName { get; set; } = string.Empty;

    // پایه تحصیلی یا کلاس
    public string Grade { get; set; } = string.Empty;

    // عنوان غذای سفارش داده شده
    public string FoodTitle { get; set; } = string.Empty;

    // توضیح پرس (مثلاً پرس کامل یا نیم‌پرس)
    public string FoodSubtitle { get; set; } = "پرس کامل";

    // ایموجی اختصاصی غذا برای نمایش فانتزی
    public string FoodEmoji { get; set; } = "🍱";

    // ساعت سرو و تحویل در مدرسه (مثلاً ۱۲:۳۰)
    public string DeliveryTime { get; set; } = "12:30";

    // برچسب تاریخ فارسی (مثلاً ۱۰ شهریور)
    public string DateLabel { get; set; } = string.Empty;

    // تاریخ میلادی سرو جهت مقایسه‌های فنی
    public DateOnly ServingDate { get; set; }

    // اینام وضعیت سفارش
    public OrderStatus Status { get; set; }

    // متن وضعیت فارسی برای بج (در حال آماده‌سازی / تحویل شده)
    public string StatusBadgeText { get; set; } = "در حال آماده‌سازی";

    // نوع بج برای استایل‌دهی تیل‌ویند (preparing یا delivered)
    public string StatusBadgeType { get; set; } = "preparing";

    // مبلغ نهایی سفارش به تومان
    public decimal TotalPrice { get; set; }

    // کد رهگیری بانکی یا پیگیری سیستمی
    public string TrackingCode { get; set; } = string.Empty;
}

// مدل فشرده و سبک کارت سفارش در صفحه لیست سفارش‌ها؛ بدون داده‌های سنگین برای لود سریع
public class OrderSummaryItemDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public Guid ChildId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public string? ChildAvatar { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string FoodTitle { get; set; } = string.Empty;
    public string FoodSubtitle { get; set; } = string.Empty;
    public string FoodEmoji { get; set; } = "🍱";
    public string DeliveryTime { get; set; } = "12:30";
    public string DateLabel { get; set; } = string.Empty;
    public DateOnly ServingDate { get; set; }
    public string Status { get; set; } = "active"; // "active" | "delivered"
    public string StatusText { get; set; } = "در حال آماده‌سازی";
    public decimal Price { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
}

// نتیجه صفحه‌بندی‌شده ۱۰تایی سفارش‌ها همراه با وضعیت اسکرول
public class PagedOrdersDto
{
    // لیست سفارش‌های صفحه جاری (۱۰ عدد)
    public IReadOnlyList<OrderSummaryItemDto> Items { get; set; } = Array.Empty<OrderSummaryItemDto>();

    // تعداد کل سفارش‌های این والد
    public int TotalCount { get; set; }

    // تعداد کل سفارش‌های فعال برای تگ تب
    public int ActiveCount { get; set; }

    // تعداد کل سفارش‌های تحویل شده
    public int DeliveredCount { get; set; }

    // شماره صفحه کنونی
    public int PageNumber { get; set; } = 1;

    // اندازه صفحه (۱۰)
    public int PageSize { get; set; } = 10;

    // آیا صفحه بعدی وجود دارد تا اسکرول ۱۰ تای بعدی رو لود کنه؟
    public bool HasMore { get; set; }
}

// جزئیات کامل سفارش که فقط وقتی روی "جزئیات بیشتر" کلیک شد از سرور واکشی میشه
public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public Guid ChildId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public string? ChildAvatar { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string? DietaryNotes { get; set; }
    public DateOnly ServingDate { get; set; }
    public string DateLabel { get; set; } = string.Empty;
    public string DeliveryTime { get; set; } = "12:30";
    public string Status { get; set; } = "active";
    public string StatusText { get; set; } = "در حال آماده‌سازی";
    public decimal TotalRawPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalPayablePrice { get; set; }
    public string PaymentMethod { get; set; } = "کیف پول دیجیتال";
    public string TrackingCode { get; set; } = string.Empty;
    public string? CouponCode { get; set; }
    public DateTime CreatedAt { get; set; }

    // ریز آیتم‌های داخل سفارش با قیمت‌ها و کالری
    public List<OrderItemDetailDto> Items { get; set; } = new();

    // مراحل آماده‌سازی و ارسال (تایم‌لاین استپر)
    public List<OrderTimelineStepDto> TimelineSteps { get; set; } = new();
}

// آیتم‌های ریز داخل یک سفارش
public class OrderItemDetailDto
{
    public Guid Id { get; set; }
    public Guid FoodItemId { get; set; }
    public string FoodTitle { get; set; } = string.Empty;
    public string Portion { get; set; } = "کامل";
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string Emoji { get; set; } = "🍱";
    public string? ImageUrl { get; set; }
    public int Calories { get; set; }
    public string? Ingredients { get; set; }
}

// مراحل زمانی تایم‌لاین سفارش برای پیگیری زنده
public class OrderTimelineStepDto
{
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public bool IsCurrent { get; set; }
    public string Icon { get; set; } = "✓";
}
