using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سرویس کیف پول؛ تمام محاسبات مالی، واکشی موجودی، تراکنش‌ها و سفارش‌های ماه رو برامون انجام میده.
public interface IWalletService
{
    // دریافت خلاصه کامل کیف پول شامل موجودی، آخرین تراکنش و سفارش‌های این ماه
    Task<WalletSummaryDto> GetWalletSummaryAsync(Guid parentId, CancellationToken cancellationToken = default);

    // دریافت خلاصه کیف پول با شماره موبایل والد (جهت راحتی فلوهای فرانت)
    Task<WalletSummaryDto> GetWalletSummaryByPhoneAsync(string phone, CancellationToken cancellationToken = default);

    // شارژ آنلاین کیف پول
    Task<bool> ChargeWalletAsync(Guid parentId, decimal amount, string? trackingCode = null, CancellationToken cancellationToken = default);

    // واکشی ۵ تراکنش اخیر والد برای صفحه اصلی کیف پول
    Task<IReadOnlyList<WalletTransactionDto>> GetRecentTransactionsAsync(Guid parentId, int count = 5, string? phone = null, CancellationToken cancellationToken = default);

    // واکشی تراکنش‌های والد به‌صورت صفحه‌بندی شده همراه با فیلتر (همه / واریز / خرید) برای اینفینیتی اسکرول
    Task<PagedTransactionsDto> GetTransactionsPagedAsync(Guid parentId, int pageNumber = 1, int pageSize = 10, string? typeFilter = null, string? phone = null, CancellationToken cancellationToken = default);

    // اطمینان از وجود داده‌های نمونه تراکنش برای تست تمیز و واقعی در دیتابیس
    Task EnsureSampleTransactionsAsync(Guid parentId, CancellationToken cancellationToken = default);
}

