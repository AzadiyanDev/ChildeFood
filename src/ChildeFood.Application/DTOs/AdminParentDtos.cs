namespace ChildeFood.Application.DTOs;

// ─── مدل خلاصه والد برای نمایش توی جدول اصلی ─────────────────────────────────
// این مدل اطلاعات اصلی والد مثل نام، تلفن، تعداد بچه‌ها و موجودی والت رو نگه می‌داره
public class AdminParentListItemDto
{
    // شناسه یکتای والد
    public Guid Id { get; set; }

    // نام و نام خانوادگی کامل سرپرست
    public string FullName { get; set; } = string.Empty;

    // شماره موبایل ثبت شده
    public string PhoneNumber { get; set; } = string.Empty;

    // نسبت با دانش‌آموز (مثلاً: پدر، مادر، سرپرست قانونی)
    public string? RoleTitle { get; set; }

    // کد ملی والد
    public string? NationalId { get; set; }

    // لینک عکس نمایه والد
    public string? AvatarUrl { get; set; }

    // وضعیت فعال یا غیرفعال بودن حساب کاربری والد
    public bool IsActive { get; set; } = true;

    // تعداد فرزندان ثبت‌شده
    public int ChildrenCount { get; set; }

    // نام فرزندان برای نمایش سریع و چیپ‌های کوچک در جدول
    public List<string> ChildrenNames { get; set; } = new();

    // موجودی فعلی کیف پول به تومان
    public decimal WalletBalance { get; set; }

    // مجموع کل سفارش‌های ناهار ثبت شده
    public int TotalOrdersCount { get; set; }

    // تاریخ و زمان پیوستن به سامانه چایلد فود
    public DateTime CreatedAt { get; set; }
}

// ─── مدل جزییات کامل والد ───────────────────────────────────────────────────
// وقتی ادمین روی دکمه «جزئیات» کلیک می‌کنه، این مدل با همه اطلاعات پر میشه
public class AdminParentDetailDto : AdminParentListItemDto
{
    // نشانی دقیق محل سکونت
    public string? Address { get; set; }

    // آیا پیامک اطلاع‌رسانی بوفه و سفارشات براش روشنه؟
    public bool IsSmsNotificationActive { get; set; } = true;

    // مجموع کل مبالغی که تا الان در چایلد فود پرداخت کرده (تومان)
    public decimal TotalSpent { get; set; }

    // لیست کامل فرزندان تحت تکفل با مشخصات مدرسه، رژیم و علایق
    public List<AdminChildDetailDto> Children { get; set; } = new();

    // تاریخچه آخرین سفارش‌های غذای مدارس برای فرزندان این والد
    public List<ParentRecentOrderDto> RecentOrders { get; set; } = new();
}

// ─── مدل اطلاعات دقیق هر فرزند (دانش‌آموز) ──────────────────────────────────
// مشخصات مدرسه‌ای، رژیمی و آمار سفارش‌های هر بچه
public class AdminChildDetailDto
{
    // شناسه فرزند
    public Guid Id { get; set; }

    // نام کامل فرزند
    public string FullName { get; set; } = string.Empty;

    // سن کودک به سال
    public int Age { get; set; }

    // پایه تحصیلی (مثلاً: سوم ابتدایی، پیش‌دبستانی)
    public string Grade { get; set; } = string.Empty;

    // نام مدرسه‌ای که در حال تحصیل است
    public string SchoolName { get; set; } = string.Empty;

    // کد یا نام شعبه مدرسه
    public string SchoolBranch { get; set; } = string.Empty;

    // تصویر آواتار انتخابی کودک
    public string? AvatarUrl { get; set; }

    // یادداشت‌های رژیم غذایی، آلرژی‌ها و حساسیت‌ها (بسیار مهم برای بوفه)
    public string? DietaryNotes { get; set; }

    // غذای مورد علاقه فرزند جهت پیشنهادات بوفه
    public string? FavoriteFood { get; set; }

    // وضعیت فعال بودن در سامانه
    public bool IsActive { get; set; } = true;

    // تعداد کل سفارش‌های رزرو شده برای این فرزند
    public int OrdersCount { get; set; }

    // کل هزینه‌ای که بابت سفارش‌های این فرزند پرداخت شده
    public decimal TotalSpent { get; set; }
}

// ─── مدل سفارش اخیر ثبت‌شده توسط والد ────────────────────────────────────────
// جهت نمایش در جدول تاریخچه مودال
public class ParentRecentOrderDto
{
    // کد یکتای سفارش (مثلاً ORD-14030616-01)
    public string OrderCode { get; set; } = string.Empty;

    // نام فرزندی که غذا براش سفارش داده شده
    public string ChildName { get; set; } = string.Empty;

    // تاریخ سرو غذا در مدرسه
    public DateOnly ServingDate { get; set; }

    // ساعت تحویل به بوفه
    public string DeliveryTime { get; set; } = "12:30";

    // مبلغ نهایی پرداخت شده
    public decimal FinalPayablePrice { get; set; }

    // برچسب وضعیت فارسی (تحویل به بوفه، در حال پخت، پرداخت شده و...)
    public string StatusLabel { get; set; } = string.Empty;
}
