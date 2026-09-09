using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// ─── مدل خلاصه هر کیف پول در جدول لیست ادمین ──────────────────────────────
public class AdminWalletListItemDto
{
    // شناسه یکتای کیف پول
    public Guid WalletId { get; set; }

    // شناسه والد صاحب کیف پول
    public Guid ParentId { get; set; }

    // نام و نام خانوادگی سرپرست
    public string ParentName { get; set; } = string.Empty;

    // شماره تلفن همراه سرپرست
    public string PhoneNumber { get; set; } = string.Empty;

    // شماره کارت اعتباری مجازی (مثلاً 6037-9918-XXXX-XXXX)
    public string VirtualCardNumber { get; set; } = string.Empty;

    // مانده موجودی فعلی به تومان
    public decimal Balance { get; set; }

    // مجموع کل شارژها و واریزی‌ها
    public decimal TotalDeposit { get; set; }

    // مجموع کل هزینه‌های صرف شده برای غذا
    public decimal TotalSpent { get; set; }

    // وضعیت فعال بودن یا مسدودیت کیف پول
    public bool IsActive { get; set; } = true;

    // اسامی فرزندان تحت تکفل
    public List<string> ChildrenNames { get; set; } = new();

    // نام مدارس فرزندان
    public List<string> SchoolNames { get; set; } = new();

    // تاریخ آخرین تراکنش یا به‌روزرسانی
    public DateTime? LastTransactionDate { get; set; }

    // تعداد کل تراکنش‌های ثبت شده
    public int TransactionsCount { get; set; }
}

// ─── مدل کامل جزئیات کیف پول برای نمایش در مودال ─────────────────────────────
public class AdminWalletDetailDto
{
    public Guid WalletId { get; set; }
    public Guid ParentId { get; set; }
    public string ParentName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string VirtualCardNumber { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal TotalDeposit { get; set; }
    public decimal TotalSpent { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastUpdated { get; set; }

    // اطلاعات فرزندان
    public List<AdminWalletChildInfoDto> Children { get; set; } = new();

    // دقیقاً ۵ تراکنش آخر کیف پول
    public List<AdminWalletTransactionDto> RecentTransactions { get; set; } = new();
}

// ─── مدل اطلاعات مختصر فرزندان در کیف پول ──────────────────────────────────
public class AdminWalletChildInfoDto
{
    public Guid ChildId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
}

// ─── مدل تراکنش‌های مالی کیف پول ───────────────────────────────────────────
public class AdminWalletTransactionDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string TypeTitle { get; set; } = "واریز";
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? TrackingCode { get; set; }
    public string Status { get; set; } = "موفق";
    public DateTime CreatedAt { get; set; }
}

// ─── مدل آمار کلی کیف‌پول‌ها برای کارت‌های بالای صفحه ──────────────────────
public class AdminWalletStatsDto
{
    // مجموع کل موجودی تمام کیف‌پول‌ها
    public decimal TotalSystemBalance { get; set; }

    // مجموع کل شارژهای انجام شده
    public decimal TotalDeposits { get; set; }

    // مجموع کل خریدها
    public decimal TotalSpent { get; set; }

    // تعداد کیف‌پول‌های فعال
    public int ActiveWalletsCount { get; set; }

    // تعداد کیف‌پول‌های غیرفعال/مسدود
    public int InactiveWalletsCount { get; set; }

    // تعداد کل کیف‌پول‌ها
    public int TotalWalletsCount { get; set; }
}

// ─── مدل درخواست تغییر وضعیت فعال/مسدود بودن کیف پول ───────────────────────
public class ToggleWalletStatusDto
{
    public bool IsActive { get; set; }
}
