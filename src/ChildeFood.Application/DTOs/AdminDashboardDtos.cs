namespace ChildeFood.Application.DTOs;

// مدل اصلی تجمیع‌شده داشبورد ادمین چایلد فود؛
// تمام داده‌ها دقیقاً مربوط به بیزینس سفارش ناهار مدارس، بوفه‌ها، والدین و کیف پول هستند
public class AdminDashboardDto
{
    // اطلاعات کاربری مدیر لاگین‌شده
    public AdminProfileDto AdminProfile { get; set; } = new();

    // شاخص‌های کلیدی فروش و سفارش‌های مدارس
    public AdminKpiSummaryDto KpiSummary { get; set; } = new();

    // داده‌های نمودارهای دوناتی (وضعیت سفارش‌های ناهار و نسبت تراکنش‌های مالی)
    public AdminDonutAnalyticsDto DonutAnalytics { get; set; } = new();

    // خلاصه عملکرد مدارس و پوشش دانش‌آموزی
    public AdminSchoolsSummaryDto SchoolsSummary { get; set; } = new();

    // خلاصه ظرفیت بوفه‌ها و توزیع غذای امروز
    public AdminCanteenSummaryDto CanteenSummary { get; set; } = new();

    // آخرین سفارش‌های ثبت‌شده دانش‌آموزان در مدارس
    public List<AdminRecentOrderDto> RecentOrders { get; set; } = new();

    // آخرین تراکنش‌های کیف پول اولیا (شارژ آنلاین و خرید ناهار)
    public List<AdminRecentWalletTransactionDto> RecentWalletTransactions { get; set; } = new();
}

// پروفایل مدیر سیستم
public class AdminProfileDto
{
    public string FullName { get; set; } = "علیرضا آزادیان";
    public string RoleTitle { get; set; } = "سوپر ادمین";
    public string AvatarUrl { get; set; } = "";
    public int UnreadNotificationsCount { get; set; } = 4;
}

// شاخص‌های آماری اصلی بالای داشبورد
public class AdminKpiSummaryDto
{
    // کل درآمد حاصل از فروش غذای مدارس در ماه جاری به تومان
    public decimal MonthlyRevenueAmount { get; set; } = 0;

    // درصد رشد درآمد نسبت به ماه قبل
    public string MonthlyRevenueGrowthPercent { get; set; } = "+18.4%";

    // تعداد کل سفارش‌های ناهار ثبت شده در ماه جاری
    public int MonthlyOrdersCount { get; set; } = 0;

    // تعداد سفارش‌های ناهار ثبت شده برای سرو امروز
    public int TodayOrdersCount { get; set; } = 0;

    // میانگین قیمت هر پرس غذای سفارش داده شده به تومان
    public decimal AverageOrderPrice { get; set; } = 0;

    // تعداد کل مدارس فعال تحت پوشش سامانه
    public int ActiveSchoolsCount { get; set; } = 0;

    // تعداد کل دانش‌آموزان ثبت‌نام شده
    public int TotalStudentsCount { get; set; } = 0;
}

// نمودارهای دوناتی اختصاصی سیستم چایلد فود
public class AdminDonutAnalyticsDto
{
    // ۱. درصد وضعیت سفارش‌های ناهار
    public int DeliveredOrdersPercent { get; set; } = 74; // تحویل داده شده به بوفه مدرسه
    public int PreparingOrdersPercent { get; set; } = 19; // در حال آماده‌سازی و طبخ در آشپزخانه
    public int PendingOrdersPercent { get; set; } = 7;   // ثبت اولیه و در صف ارسال

    // ۲. درصد عملیات مالی کیف پول اولیا
    public int WalletDepositPercent { get; set; } = 38;  // شارژ آنلاین حساب توسط والدین
    public int MealPurchasePercent { get; set; } = 62;   // کسر هزینه بابت خرید ناهار مدرسه
}

// خلاصه وضعیت مدارس و جمعیت دانش‌آموزی
public class AdminSchoolsSummaryDto
{
    public int TotalSchoolsCount { get; set; } = 0;
    public int ActiveCanteensCount { get; set; } = 0;
    public int TotalStudentsCount { get; set; } = 0;
    public int TodayServedMealsCount { get; set; } = 0;
    public string TopSchoolName { get; set; } = "دبستان دخترانه روشنگران";
}

// خلاصه بوفه‌ها و ظرفیت توزیع غذای امروز
public class AdminCanteenSummaryDto
{
    public int TodayMenuCapacity { get; set; } = 0;
    public int TodayReservedMeals { get; set; } = 0;
    public int CapacityUtilizationPercent { get; set; } = 86;
    public string TopSellingMealName { get; set; } = "چلو کباب کوبیده زعفرانی";
}

// اطلاعات آخرین سفارش‌های ثبت شده ناهار
public class AdminRecentOrderDto
{
    public Guid Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string FoodTitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string DeliveryTime { get; set; } = "12:30";
    public string Status { get; set; } = "delivered"; // delivered, preparing, pending, cancelled
    public string StatusTitle { get; set; } = "تحویل به بوفه";
    public string TimeAgo { get; set; } = "چند لحظه پیش";
}

// آخرین تراکنش‌های کیف پول والدین
public class AdminRecentWalletTransactionDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string ChildName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "deposit"; // deposit یا purchase
    public string Status { get; set; } = "موفق";
    public string TimeAgo { get; set; } = "امروز";
}
