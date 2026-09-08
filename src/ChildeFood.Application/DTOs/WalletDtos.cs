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
}
