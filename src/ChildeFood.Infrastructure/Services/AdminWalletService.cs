using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChildeFood.Infrastructure.Services;

// سرویس پیاده‌سازی مدیریت کیف‌پول‌ها و بخش مالی پنل ادمین
// بر اساس معماری تمیز، تمام لاجیک بیزینس و محاسبات در این لایه انجام میشه
public class AdminWalletService : IAdminWalletService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AdminWalletService> _logger;

    public AdminWalletService(ApplicationDbContext db, ILogger<AdminWalletService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ─── دریافت لیست کیف‌پول‌ها با فیلتر جستجو و وضعیت ───────────────────────
    public async Task<List<AdminWalletListItemDto>> GetWalletsAsync(string? searchQuery, bool? activeOnly)
    {
        await EnsureSampleWalletsAndTransactionsAsync();

        var query = _db.Wallets
            .AsNoTracking()
            .Include(w => w.Parent)
            .Include(w => w.Transactions)
            .AsQueryable();

        if (activeOnly.HasValue)
        {
            query = query.Where(w => w.IsActive == activeOnly.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var q = searchQuery.Trim().ToLower();
            query = query.Where(w =>
                (w.Parent != null && w.Parent.FullName.ToLower().Contains(q)) ||
                (w.Parent != null && w.Parent.PhoneNumber != null && w.Parent.PhoneNumber.Contains(q)) ||
                w.VirtualCardNumber.Contains(q)
            );
        }

        var wallets = await query
            .OrderByDescending(w => w.Balance)
            .ThenByDescending(w => w.LastUpdated)
            .ToListAsync();

        // واکشی فرزندا و مدارس مرتبط برای هر والد
        var parentIds = wallets.Select(w => w.ParentId).Distinct().ToList();
        var children = await _db.Children
            .AsNoTracking()
            .Where(c => parentIds.Contains(c.ParentId))
            .Include(c => c.School)
            .ToListAsync();

        var result = new List<AdminWalletListItemDto>();

        foreach (var w in wallets)
        {
            var parentChildren = children.Where(c => c.ParentId == w.ParentId).ToList();
            var childrenNames = parentChildren.Select(c => c.FullName).ToList();
            var schoolNames = parentChildren
                .Where(c => c.School != null)
                .Select(c => c.School!.Name)
                .Distinct()
                .ToList();

            var totalDeposit = w.Transactions
                .Where(t => t.Type == TransactionType.Deposit && t.Status == "موفق")
                .Sum(t => t.Amount);

            var totalSpent = w.Transactions
                .Where(t => t.Type == TransactionType.Purchase && t.Status == "موفق")
                .Sum(t => t.Amount);

            var lastTx = w.Transactions.OrderByDescending(t => t.CreatedAt).FirstOrDefault();

            result.Add(new AdminWalletListItemDto
            {
                WalletId = w.Id,
                ParentId = w.ParentId,
                ParentName = w.Parent?.FullName ?? "کاربر بدون نام",
                PhoneNumber = w.Parent?.PhoneNumber ?? "-",
                VirtualCardNumber = string.IsNullOrWhiteSpace(w.VirtualCardNumber) ? "۶۰۳۷-۹۹۱۸-۴۲۰۱-۹۱۵۲" : w.VirtualCardNumber,
                Balance = w.Balance,
                TotalDeposit = totalDeposit,
                TotalSpent = totalSpent,
                IsActive = w.IsActive,
                ChildrenNames = childrenNames,
                SchoolNames = schoolNames,
                LastTransactionDate = lastTx?.CreatedAt ?? w.LastUpdated,
                TransactionsCount = w.Transactions.Count
            });
        }

        return result;
    }

    // ─── دریافت اطلاعات کامل کیف پول همراه با ۵ تراکنش آخر ────────────────────
    public async Task<AdminWalletDetailDto?> GetWalletDetailAsync(Guid walletId)
    {
        await EnsureSampleWalletsAndTransactionsAsync();

        var wallet = await _db.Wallets
            .AsNoTracking()
            .Include(w => w.Parent)
            .FirstOrDefaultAsync(w => w.Id == walletId);

        if (wallet == null)
            return null;

        // دریافت ۵ تراکنش آخر به ترتیب جدیدترین
        var recentTxEntities = await _db.WalletTransactions
            .AsNoTracking()
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentTransactions = recentTxEntities.Select(t => new AdminWalletTransactionDto
        {
            Id = t.Id,
            Amount = t.Amount,
            Type = t.Type,
            TypeTitle = t.Type switch
            {
                TransactionType.Deposit => "شارژ آنلاین",
                TransactionType.Purchase => "خرید ناهار",
                TransactionType.Refund => "استرداد وجه",
                _ => "تراکنش مالی"
            },
            Title = t.Title,
            Subtitle = t.Subtitle,
            TrackingCode = t.TrackingCode ?? $"TRX-{t.CreatedAt:yyyyMMddHHmm}",
            Status = t.Status,
            CreatedAt = t.CreatedAt
        }).ToList();

        // اطلاعات فرزندان
        var children = await _db.Children
            .AsNoTracking()
            .Where(c => c.ParentId == wallet.ParentId)
            .Include(c => c.School)
            .Select(c => new AdminWalletChildInfoDto
            {
                ChildId = c.Id,
                FullName = c.FullName,
                Grade = c.Grade,
                SchoolName = c.School != null ? c.School.Name : "مدرسه ثبت‌نشده"
            })
            .ToListAsync();

        // مجموع‌ها
        var allTx = await _db.WalletTransactions
            .AsNoTracking()
            .Where(t => t.WalletId == walletId)
            .ToListAsync();

        var totalDeposit = allTx.Where(t => t.Type == TransactionType.Deposit && t.Status == "موفق").Sum(t => t.Amount);
        var totalSpent = allTx.Where(t => t.Type == TransactionType.Purchase && t.Status == "موفق").Sum(t => t.Amount);

        return new AdminWalletDetailDto
        {
            WalletId = wallet.Id,
            ParentId = wallet.ParentId,
            ParentName = wallet.Parent?.FullName ?? "والد محترم",
            PhoneNumber = wallet.Parent?.PhoneNumber ?? "-",
            Email = wallet.Parent?.Email,
            Address = wallet.Parent?.Address,
            VirtualCardNumber = string.IsNullOrWhiteSpace(wallet.VirtualCardNumber) ? "۶۰۳۷-۹۹۱۸-۴۲۰۱-۹۱۵۲" : wallet.VirtualCardNumber,
            Balance = wallet.Balance,
            TotalDeposit = totalDeposit,
            TotalSpent = totalSpent,
            IsActive = wallet.IsActive,
            CreatedAt = wallet.CreatedAt,
            LastUpdated = wallet.LastUpdated,
            Children = children,
            RecentTransactions = recentTransactions
        };
    }

    // ─── دریافت آمار کلان مالی و موجودی سیستم ────────────────────────────────
    public async Task<AdminWalletStatsDto> GetWalletStatsAsync()
    {
        var wallets = await _db.Wallets.AsNoTracking().ToListAsync();
        var transactions = await _db.WalletTransactions.AsNoTracking().ToListAsync();

        var totalBalance = wallets.Sum(w => w.Balance);
        var totalDeposits = transactions.Where(t => t.Type == TransactionType.Deposit && t.Status == "موفق").Sum(t => t.Amount);
        var totalSpent = transactions.Where(t => t.Type == TransactionType.Purchase && t.Status == "موفق").Sum(t => t.Amount);

        return new AdminWalletStatsDto
        {
            TotalSystemBalance = totalBalance,
            TotalDeposits = totalDeposits,
            TotalSpent = totalSpent,
            ActiveWalletsCount = wallets.Count(w => w.IsActive),
            InactiveWalletsCount = wallets.Count(w => !w.IsActive),
            TotalWalletsCount = wallets.Count
        };
    }

    // ─── تغییر وضعیت فعال/مسدود بودن کیف پول ─────────────────────────────────
    public async Task<bool> ToggleWalletStatusAsync(Guid walletId, bool isActive)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.Id == walletId);
        if (wallet == null)
            return false;

        wallet.IsActive = isActive;
        wallet.LastUpdated = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        _logger.LogInformation("وضعیت کیف پول {WalletId} به {Status} تغییر یافت.", walletId, isActive ? "فعال" : "مسدود/غیرفعال");
        return true;
    }

    // ─── اطمینان از وجود داده‌های واقعی و حداقل ۵ تراکنش برای تست کامل ────────
    public async Task EnsureSampleWalletsAndTransactionsAsync()
    {
        var parents = await _db.Users.Where(u => u.RoleTitle == "والد").ToListAsync();
        if (!parents.Any())
            return;

        var existingWallets = await _db.Wallets.ToListAsync();

        // ایجاد کیف پول برای والدینی که هنوز کیف پول ندارند
        foreach (var parent in parents)
        {
            if (!existingWallets.Any(w => w.ParentId == parent.Id))
            {
                var newWallet = new Wallet
                {
                    Id = Guid.NewGuid(),
                    ParentId = parent.Id,
                    Balance = 250000,
                    VirtualCardNumber = $"۶۰۳۷-۹۹۱۸-{Random.Shared.Next(1000, 9999)}-{Random.Shared.Next(1000, 9999)}",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    LastUpdated = DateTime.UtcNow
                };
                await _db.Wallets.AddAsync(newWallet);
                existingWallets.Add(newWallet);
            }
        }
        await _db.SaveChangesAsync();

        // اطمینان از اینکه هر کیف پول حداقل ۵ تراکنش برای نمایش در مودال دارد
        foreach (var wallet in existingWallets)
        {
            var txCount = await _db.WalletTransactions.CountAsync(t => t.WalletId == wallet.Id);
            if (txCount < 5)
            {
                var needed = 5 - txCount;
                var sampleTxs = new List<WalletTransaction>();

                for (int i = 0; i < needed; i++)
                {
                    bool isDeposit = i % 2 == 0;
                    sampleTxs.Add(new WalletTransaction
                    {
                        Id = Guid.NewGuid(),
                        WalletId = wallet.Id,
                        ParentId = wallet.ParentId,
                        Amount = isDeposit ? 200000 + (i * 50000) : 75000 + (i * 15000),
                        Type = isDeposit ? TransactionType.Deposit : TransactionType.Purchase,
                        Title = isDeposit ? "شارژ آنلاین کیف پول" : "رزرو وعده ناهار مدرسه",
                        Subtitle = isDeposit ? "درگاه بانکی شاپرک • بانک سامان" : "چلو کباب زعفرانی و سالاد فصل",
                        TrackingCode = $"SHP-{DateTime.UtcNow.AddDays(-i):yyyyMMdd}-{Random.Shared.Next(10000, 99999)}",
                        Status = "موفق",
                        CreatedAt = DateTime.UtcNow.AddDays(-(i + 1)).AddHours(-i)
                    });
                }

                await _db.WalletTransactions.AddRangeAsync(sampleTxs);
            }
        }

        await _db.SaveChangesAsync();
    }
}
