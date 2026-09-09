namespace ChildeFood.Application.DTOs;

// ─── لیست مدارس ───────────────────────────────────────────────────────────────
// این DTO برای نمایش هر ردیف توی جدول مدارس پنل ادمینه؛ اطلاعات پایه + یه سری آمار کوچیک
public class AdminSchoolListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BranchCode { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    // ساعت پیش‌فرض ناهار مدرسه، مثلاً ۱۲:۳۰
    public string DefaultLunchTime { get; set; } = "12:30";
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; }

    // تعداد دانش‌آموزان فعال این مدرسه
    public int StudentCount { get; set; }

    // تعداد سفارشات این ماه
    public int OrderCount { get; set; }

    // چند روز آینده برنامه‌ی غذایی فعال داره
    public int ActiveMealDays { get; set; }
}

// ─── دیتیل یه مدرسه ───────────────────────────────────────────────────────────
// وقتی روی یه مدرسه کلیک می‌کنیم و می‌خوایم همه چیز رو ببینیم
public class AdminSchoolDetailDto : AdminSchoolListItemDto
{
    // لیست کامل دانش‌آموزان این مدرسه
    public List<SchoolStudentDto> Students { get; set; } = new();

    // پنج سفارش آخر مدرسه برای نگاه سریع
    public List<SchoolRecentOrderDto> RecentOrders { get; set; } = new();

    // چند روز آینده برنامه‌ی غذایی داره (ظرف ۳۰ روز)
    public int UpcomingMealDays { get; set; }

    // مجموع کل سفارشات از ابتدا
    public int TotalOrdersCount { get; set; }

    // کل درآمد ثبت‌شده از این مدرسه
    public decimal TotalRevenue { get; set; }
}

// ─── دانش‌آموز توی دیتیل مدرسه ───────────────────────────────────────────────
// اطلاعات کوچیک هر بچه‌ای که عضو این مدرسه‌ست
public class SchoolStudentDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public int Age { get; set; }
    public bool IsActive { get; set; }
}

// ─── سفارش اخیر توی دیتیل مدرسه ──────────────────────────────────────────────
// برای نمایش آخرین ۵ سفارش مدرسه توی صفحه دیتیل
public class SchoolRecentOrderDto
{
    public string OrderCode { get; set; } = string.Empty;

    // نام فرزندی که سفارش براش بوده
    public string ChildName { get; set; } = string.Empty;

    // تاریخ سرویس‌دهی غذا
    public DateOnly ServingDate { get; set; }

    // مبلغ نهایی که پرداخت شده
    public decimal FinalPayablePrice { get; set; }

    // وضعیت سفارش به فارسی آدم‌فهم (مثلاً "پرداخت شده")
    public string StatusLabel { get; set; } = string.Empty;
}

// ─── فرم ساخت مدرسه جدید ──────────────────────────────────────────────────────
// این رو از فرم ادمین می‌گیریم وقتی می‌خواد یه مدرسه جدید اضافه کنه
public class CreateSchoolDto
{
    // نام مدرسه — اجباریه، نمیشه خالی گذاشت
    public required string Name { get; set; }

    // کد شعبه — اجباریه، باید یکتا باشه
    public required string BranchCode { get; set; }

    // آدرس — اجباریه
    public required string Address { get; set; }

    // ساعت ناهار — اگه نگفتن ۱۲:۳۰ میذاریم
    public string DefaultLunchTime { get; set; } = "12:30";

    // نام مسئول یا رابط مدرسه — اختیاریه
    public string? ContactPerson { get; set; }
}

// ─── تغییر وضعیت فعال/غیرفعال مدرسه ─────────────────────────────────────────
// فقط آیدی مدرسه لازمه، بقیه کارها رو سرویس انجام میده
public class ToggleSchoolStatusDto
{
    public Guid SchoolId { get; set; }
}
