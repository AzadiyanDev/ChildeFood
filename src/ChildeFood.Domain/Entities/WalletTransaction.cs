using ChildeFood.Domain.Common;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Domain.Entities;

// موجودیت تراکنش‌های مالی کیف پول؛ هر شارژ، خرید غذا یا بازگشت پول یک رکورد شفاف و دقیق اینجا به جا میذاره.
public class WalletTransaction : BaseEntity
{
    // شناسه کیف پولی که تراکنش روی اون انجام شده
    public Guid WalletId { get; set; }

    // شناسه والد مرتبط با این تراکنش
    public Guid ParentId { get; set; }

    // مبلغ تراکنش به تومان
    public decimal Amount { get; set; }

    // نوع تراکنش (واریز، خرید، استرداد)
    public TransactionType Type { get; set; }

    // عنوان مختصر تراکنش (مثلاً شارژ آنلاین، ناهار ۱۶ شهریور)
    public string Title { get; set; } = string.Empty;

    // توضیحات تکمیلی تراکنش (مثلاً رزرو چلوکباب برای آوا)
    public string? Subtitle { get; set; }

    // اگر تراکنش برای فرزند خاصی انجام شده شناسه فرزند اینجا ثبت میشه
    public Guid? ChildId { get; set; }

    // کد پیگیری بانکی یا شناسه رفرنس پرداخت
    public string? TrackingCode { get; set; }

    // وضعیت تراکنش (موفق، در انتظار، ناموفق)
    public string Status { get; set; } = "موفق";

    // ناوبری: کیف پول مربوطه
    public Wallet? Wallet { get; set; }

    // ناوبری: والد مربوطه
    public ApplicationUser? Parent { get; set; }

    // ناوبری: فرزندی که براش خرج شده (اختیاری)
    public Child? Child { get; set; }
}
