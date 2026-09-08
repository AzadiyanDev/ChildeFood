using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// موجودیت کدهای تخفیف و کوپن؛ والدین موقع ثبت سفارش می‌تونن کد رو وارد کنن تا روی فاکتور اعمال بشه.
public class Coupon : BaseEntity
{
    // کد تخفیف متنی که کاربر تایپ می‌کنه (مثلاً NOOROOZ1404 یا FIRSTMEAL)
    public string Code { get; set; } = string.Empty;

    // نوع تخفیف؛ درصدی (Percentage) یا مبلغ ثابت (FixedAmount)
    public string DiscountType { get; set; } = "Percentage";

    // مقدار تخفیف (مثلاً ۲۰ درصد یا ۵۰,۰۰۰ تومان)
    public decimal DiscountValue { get; set; }

    // سقف مبلغ تخفیف (بخصوص برای تخفیف‌های درصدی جهت جلوگیری از ضرر)
    public decimal? MaxDiscountAmount { get; set; }

    // حداقل مبلغ سفارش برای فعال شدن این کد تخفیف
    public decimal? MinOrderAmount { get; set; }

    // تاریخ انقضای کوپن؛ بعد این تاریخ کد بی‌اعتبار میشه
    public DateTime? ExpiryDate { get; set; }

    // سقف تعداد دفعات استفاده از کوپن
    public int UsageLimit { get; set; } = 100;

    // تعداد دفعاتی که تا الان توسط کاربران استفاده شده
    public int UsedCount { get; set; } = 0;

    // وضعیت فعال بودن کوپن
    public bool IsActive { get; set; } = true;
}
