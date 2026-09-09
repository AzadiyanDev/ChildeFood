using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// موجودیت کیف پول دیجیتال والدین؛ برای شارژ سریع و پرداخت آنی هزینه وعده‌ها بدون نیاز به رفتن مکرر به درگاه بانکی.
public class Wallet : BaseEntity
{
    // شناسه والدی که صاحب این کیف پوله
    public Guid ParentId { get; set; }

    // مانده موجودی فعلی کیف پول به تومان
    public decimal Balance { get; set; } = 0;

    // شماره کارت اعتباری مجازی جهت نمایش شیک و دوستانه توی اپ موبایل (مثلاً 6037-9918-1234-5678)
    public string VirtualCardNumber { get; set; } = string.Empty;

    // وضعیت فعال بودن یا مسدود بودن کیف پول
    public bool IsActive { get; set; } = true;

    // آخرین زمان تغییر یا بروزرسانی موجودی
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    // ناوبری: والدی که صاحب این کیفه
    public ApplicationUser? Parent { get; set; }

    // ناوبری: لیست تمام تراکنش‌های واریز یا برداشت این کیف پول
    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
