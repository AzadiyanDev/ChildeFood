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
}
