namespace ChildeFood.Application.DTOs;

// ─── مدل خلاصه سفارش‌های یک مدرسه در یک تاریخ خاص ───────────────────────────
// این مدل برای هر سطر جدول در صفحه سفارش‌های مدارس استفاده میشه
public class SchoolOrdersSummaryDto
{
    // شناسه یکتای مدرسه
    public Guid SchoolId { get; set; }

    // نام مدرسه طرف قرارداد
    public string SchoolName { get; set; } = string.Empty;

    // کد شعبه مدرسه
    public string BranchCode { get; set; } = string.Empty;

    // آدرس پستی مدرسه
    public string Address { get; set; } = string.Empty;

    // ساعت پیش‌فرض توزیع ناهار مدرسه (مثلاً ۱۲:۳۰)
    public string DefaultLunchTime { get; set; } = "12:30";

    // نام رابط یا مسئول بوفه مدرسه
    public string? ContactPerson { get; set; }

    // تاریخ روزی که سفارش‌ها برای آن سرو می‌شوند
    public DateOnly ServingDate { get; set; }

    // تعداد کل سفارش‌های ثبت شده در این مدرسه
    public int TotalOrdersCount { get; set; }

    // مجموع کل پرس‌ها و اقلام غذایی درخواستی
    public int TotalFoodItemsCount { get; set; }

    // مجموع مبلغ کل سفارش‌های این مدرسه
    public decimal TotalRevenue { get; set; }

    // وضعیت کلی سفارشات این مدرسه (در حال پخت، تحویل داده شده، در صف توزیع)
    public string StatusLabel { get; set; } = "در حال آماده‌سازی";

    // اقلام تجمیع‌شده غذا که با کلیک روی سطر در زیرمجموعه (Accordion) باز میشه
    public List<AggregatedFoodItemDto> AggregatedFoods { get; set; } = new();
}

// ─── مدل اقلام تجمیع شده غذا برای آشپزخانه و توزیع بوفه ───────────────────────
// نشون میده از هر غذا دقیقاً چند پرس برای این مدرسه سفارش داده شده
public class AggregatedFoodItemDto
{
    // شناسه آیتم غذایی
    public Guid FoodItemId { get; set; }

    // نام غذا (مثلاً: چلو کباب کوبیده زعفرانی)
    public string FoodTitle { get; set; } = string.Empty;

    // عنوان دسته‌بندی غذا (غذای اصلی، پیش‌غذا، نوشیدنی، دسر)
    public string CategoryTitle { get; set; } = "غذای اصلی";

    // تصویر غذا
    public string? ImageUrl { get; set; }

    // ایموجی اختصاصی غذا برای نمایش سریع و جذاب
    public string? Emoji { get; set; }

    // تعداد کل پرس‌های سفارش داده شده از این آیتم
    public int TotalQuantity { get; set; }

    // تعداد پرس کامل
    public int FullPortionQuantity { get; set; }

    // تعداد نیم‌پرس
    public int HalfPortionQuantity { get; set; }

    // قیمت واحد غذا
    public decimal UnitPrice { get; set; }

    // مبلغ مجموع این آیتم برای این مدرسه
    public decimal TotalPrice { get; set; }
}

// ─── مدل تفصیلی هر دانش‌آموز جهت خروجی اکسل یا پرینت مانیفست ────────────────
// شامل اطلاعات شخصی و رژیمی کسانی که غذا سفارش داده‌اند
public class SchoolOrderStudentDetailDto
{
    // کد یکتای سفارش
    public string OrderCode { get; set; } = string.Empty;

    // نام کامل دانش‌آموز
    public string StudentName { get; set; } = string.Empty;

    // پایه تحصیلی دانش‌آموز (مثلاً: چهارم ابتدایی)
    public string Grade { get; set; } = string.Empty;

    // سن دانش‌آموز
    public int Age { get; set; }

    // نام کامل والد یا سرپرست
    public string ParentName { get; set; } = string.Empty;

    // شماره تماس والد جهت هماهنگی بوفه
    public string ParentPhone { get; set; } = string.Empty;

    // شرح خلاصه اقلام انتخابی (مثلاً: ۲× چلوکباب + ۱× سالاد فصل)
    public string OrderedItemsSummary { get; set; } = string.Empty;

    // مبلغ نهایی پرداخت شده
    public decimal FinalPrice { get; set; }

    // ساعت تحویل
    public string DeliveryTime { get; set; } = "12:30";

    // حساسیت‌ها، پرهیزها و نکات ویژه تغذیه‌ای کودک (بسیار مهم در زمان تحویل)
    public string? DietaryNotes { get; set; }

    // برچسب وضعیت سفارش
    public string StatusLabel { get; set; } = string.Empty;
}

// ─── مدل کل گزارش مدرسه برای دانلود فایل یا مانیفست تحویل ─────────────────────
public class SchoolOrdersReportDto
{
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateOnly ServingDate { get; set; }
    public string DeliveryTime { get; set; } = "12:30";
    public int TotalOrders { get; set; }
    public int TotalPortions { get; set; }
    public decimal TotalRevenue { get; set; }

    // خلاصه اقلام برای آشپزخانه
    public List<AggregatedFoodItemDto> AggregatedItems { get; set; } = new();

    // لیست فرد به فرد دانش‌آموزان برای بوفه و بررسی تحویل
    public List<SchoolOrderStudentDetailDto> StudentOrders { get; set; } = new();
}

// ─── مدل درخواست تغییر وضعیت سفارش‌های یک مدرسه در یک تاریخ ──────────────────
public class UpdateSchoolOrderStatusDto
{
    public DateOnly Date { get; set; }
    public ChildeFood.Domain.Enums.OrderStatus NewStatus { get; set; }
}
