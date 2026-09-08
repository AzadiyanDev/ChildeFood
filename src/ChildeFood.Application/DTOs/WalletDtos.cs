namespace ChildeFood.Application.DTOs;

// دی‌تی‌او خلاصه وضعیت کیف پول؛ هرچیزی که صفحه اصلی برای کارت والت مشکی لوکس نیاز داره همینجا جمع کردیم
public class WalletSummaryDto
{
    // شناسه خود والت در جدول دیتابیس
    public Guid WalletId { get; set; }

    // مانده فعلی کیف پول به تومان
    public decimal Balance { get; set; }

    // شماره کارت مجازی والت برای نمایش شکیل
    public string VirtualCardNumber { get; set; } = string.Empty;

    // مبلغ آخرین تراکنش انجام شده (در صورت وجود)
    public decimal? LastTransactionAmount { get; set; }

    // نوع تراکنش: واریز (deposit) یا برداشت (withdraw)
    public string? LastTransactionType { get; set; }

    // عنوان آخرین تراکنش مثل "شارژ آنلاین" یا "خرید ناهار"
    public string? LastTransactionTitle { get; set; }

    // زمان آخرین تراکنش
    public DateTime? LastTransactionDate { get; set; }

    // تعداد کل سفارش‌های ثبت شده در ماه جاری شمسی
    public int MonthOrdersCount { get; set; }

    // کل مبالغ واریز شده به کیف پول تا الان
    public decimal TotalDeposits { get; set; }

    // مجموع کل مبالغ خرج شده برای سفارش‌های مدرسه
    public decimal TotalOrdersAmount { get; set; }

    // مجموع کل تخفیف‌هایی که روی سفارش‌ها گرفته
    public decimal TotalDiscountAmount { get; set; }
}

// اطلاعات تمیز هر تراکنش برای نمایش توی لیست‌های فرانت
public class WalletTransactionDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "deposit"; // deposit یا purchase یا refund
    public string Date { get; set; } = string.Empty; // تاریخ شمسی مثل 'امروز، ۱۰:۳۰'
    public string TrackingCode { get; set; } = string.Empty;
    public string Status { get; set; } = "successful"; // successful یا failed یا pending
    public string? ChildName { get; set; }
    public DateTime CreatedAt { get; set; }
}

// خروجی صفحه‌بندی شده برای اینفینیتی اسکرول مدال همه تراکنش‌ها
public class PagedTransactionsDto
{
    public List<WalletTransactionDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasMore { get; set; }
    public decimal DepositSum { get; set; }
    public decimal PurchaseSum { get; set; }
}

