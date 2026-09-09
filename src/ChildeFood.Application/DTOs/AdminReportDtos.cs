using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// پارامترهای فیلتر گزارش‌ها در پنل ادمین؛
// با این مدل ادمین می‌تونه بر اساس بازه زمانی، مدرسه، غذای خاص و وضعیت سفارش‌ها گزارش بگیره
public class AdminReportFilterDto
{
    // بازه زمانی انتخابی: 'all' (کل سفارشات)، 'week' (هفته اخیر)، 'month' (ماه اخیر)، 'today' (امروز) یا 'custom'
    public string TimeRange { get; set; } = "all";

    // تاریخ شروع برای فیلتر بازه دلخواه
    public DateOnly? FromDate { get; set; }

    // تاریخ پایان برای فیلتر بازه دلخواه
    public DateOnly? ToDate { get; set; }

    // فیلتر اختیاری بر اساس یک مدرسه خاص
    public Guid? SchoolId { get; set; }

    // فیلتر اختیاری بر اساس یک غذای خاص
    public Guid? FoodItemId { get; set; }

    // فیلتر اختیاری بر اساس وضعیت سفارش (مثلاً تحویل شده، در حال آماده‌سازی و...)
    public OrderStatus? Status { get; set; }

    // عبارت جستجو در کد سفارش، نام دانش‌آموز، نام والد یا شماره تماس
    public string? SearchQuery { get; set; }
}

// کارت‌های آماری کلیدی بالا (KPI)
public class AdminReportOverviewDto
{
    public int TotalOrders { get; set; }
    public int TotalPortions { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AverageOrderValue { get; set; }
    public int DeliveredOrdersCount { get; set; }
    public int PreparingOrdersCount { get; set; }
    public int PendingOrdersCount { get; set; }
    public int CancelledOrdersCount { get; set; }
}

// آمار تجمیعی و سهم یک مدرسه در گزارش
public class AdminReportSchoolBreakdownDto
{
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public int TotalPortions { get; set; }
    public decimal TotalAmount { get; set; }
    public double Percentage { get; set; }
}

// آمار تجمیعی محبوبیت یک غذا در گزارش
public class AdminReportFoodBreakdownDto
{
    public Guid FoodItemId { get; set; }
    public string FoodTitle { get; set; } = string.Empty;
    public string CategoryTitle { get; set; } = string.Empty;
    public string Emoji { get; set; } = "🍱";
    public int TotalPortions { get; set; }
    public int FullPortions { get; set; }
    public int HalfPortions { get; set; }
    public decimal TotalAmount { get; set; }
    public double Percentage { get; set; }
}

// روند روزانه سفارشات در طول بازه زمانی انتخابی
public class AdminReportDailyTrendDto
{
    public DateOnly Date { get; set; }
    public string PersianDate { get; set; } = string.Empty;
    public string DayName { get; set; } = string.Empty;
    public int OrdersCount { get; set; }
    public int PortionsCount { get; set; }
    public decimal TotalAmount { get; set; }
}

// اطلاعات ردیف یک سفارش برای جدول گزارش و خروجی اکسل/پی‌دی‌اف
public class AdminReportOrderItemDto
{
    public Guid OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public DateOnly ServingDate { get; set; }
    public string PersianDate { get; set; } = string.Empty;
    public string ChildName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string ParentName { get; set; } = string.Empty;
    public string ParentPhoneNumber { get; set; } = string.Empty;
    public string FoodItemsSummary { get; set; } = string.Empty;
    public int TotalPortions { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public string StatusTitle { get; set; } = string.Empty;
    public string PaymentMethodTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// گزینه بازشونده برای فیلتر مدرسه
public class ReportFilterOptionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
}

// کل خروجی گزارش که به فرانت ارسال میشه
public class AdminReportResponseDto
{
    public AdminReportOverviewDto Overview { get; set; } = new();
    public List<AdminReportSchoolBreakdownDto> SchoolBreakdown { get; set; } = new();
    public List<AdminReportFoodBreakdownDto> FoodBreakdown { get; set; } = new();
    public List<AdminReportDailyTrendDto> DailyTrends { get; set; } = new();
    public List<AdminReportOrderItemDto> Orders { get; set; } = new();
    public List<ReportFilterOptionDto> AvailableSchools { get; set; } = new();
    public List<ReportFilterOptionDto> AvailableFoods { get; set; } = new();
    public string AppliedFilterDescription { get; set; } = string.Empty;
}
