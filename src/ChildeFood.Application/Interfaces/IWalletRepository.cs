using ChildeFood.Domain.Entities;

namespace ChildeFood.Application.Interfaces;

// اینترفیس ریپازیتوری کیف پول؛ گرفتن اطلاعات کیف پول والد، تراکنش‌ها، و بررسی موجودی.
public interface IWalletRepository : IGenericRepository<Wallet>
{
    // دریافت کیف پول بر اساس شناسه والد
    Task<Wallet?> GetByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default);

    // دریافت کیف پول به همراه تاریخچه تراکنش‌های اخیر
    Task<Wallet?> GetWalletWithTransactionsAsync(Guid walletId, int take = 20, CancellationToken cancellationToken = default);

    // پیدا کردن کیف پول با شماره کارت مجازی
    Task<Wallet?> GetByVirtualCardNumberAsync(string virtualCardNumber, CancellationToken cancellationToken = default);
}
