using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// ریپازیتوری کیف پول؛ برای خواندن وضعیت موجودی، واکشی تراکنش‌های مالی اخیر و جستجو با شماره کارت مجازی.
public class WalletRepository : GenericRepository<Wallet>, IWalletRepository
{
    public WalletRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Wallet?> GetByParentIdAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(w => w.Transactions.OrderByDescending(t => t.CreatedAt).Take(10))
            .FirstOrDefaultAsync(w => w.ParentId == parentId, cancellationToken);
    }

    public async Task<Wallet?> GetWalletWithTransactionsAsync(Guid walletId, int take = 20, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(w => w.Transactions.OrderByDescending(t => t.CreatedAt).Take(take))
            .FirstOrDefaultAsync(w => w.Id == walletId, cancellationToken);
    }

    public async Task<Wallet?> GetByVirtualCardNumberAsync(string virtualCardNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.VirtualCardNumber == virtualCardNumber, cancellationToken);
    }
}
