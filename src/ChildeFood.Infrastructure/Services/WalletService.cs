using System.Globalization;
using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// تمام منطق مالی کیف پول، مانده حساب، آخرین واریز/برداشت و شمارش سفارش‌های این ماه اینجاست
// طبق قوانین پروژه تمام لاجیک تو اینفراست و کنترلر کاملاً دام و سبکه.
public class WalletService : IWalletService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public WalletService(
        ApplicationDbContext dbContext,
        IUnitOfWork unitOfWork,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    // گرفتن خلاصه وضعیت کیف پول با شناسه والد برای نمایش در صفحه اصلی
    public async Task<WalletSummaryDto> GetWalletSummaryAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        // کیف پول والد رو همراه با ترنزکشن‌ها چک می‌کنیم
        var wallet = await _dbContext.Wallets
            .FirstOrDefaultAsync(w => w.ParentId == parentId, cancellationToken);

        // اگر کاربری والت نداشت، یه کیف پول اتوماتیک براش می‌سازیم تا ارور نخوره
        if (wallet is null)
        {
            var userExists = await _userManager.Users.AnyAsync(u => u.Id == parentId, cancellationToken);
            if (userExists)
            {
                wallet = new Wallet
                {
                    Id = Guid.NewGuid(),
                    ParentId = parentId,
                    Balance = 0,
                    VirtualCardNumber = $"6037-9918-{Random.Shared.Next(1000, 9999)}-{Random.Shared.Next(1000, 9999)}",
                    LastUpdated = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                await _dbContext.Wallets.AddAsync(wallet, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        // واکشی آخرین تراکنش موفق کاربر (فرقی نداره شارژ باشه یا خرید ناهار)
        var lastTx = await _dbContext.WalletTransactions
            .AsNoTracking()
            .Where(t => t.ParentId == parentId || (wallet != null && t.WalletId == wallet.Id))
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        // محاسبه تعداد سفارش‌های این ماه بر اساس تقویم خورشیدی
        var monthOrdersCount = await CalculateCurrentPersianMonthOrdersCountAsync(parentId, cancellationToken);

        return new WalletSummaryDto
        {
            WalletId = wallet?.Id ?? Guid.Empty,
            Balance = wallet?.Balance ?? 0,
            VirtualCardNumber = wallet?.VirtualCardNumber ?? string.Empty,
            LastTransactionAmount = lastTx?.Amount,
            LastTransactionType = lastTx != null ? (lastTx.Type == TransactionType.Deposit ? "deposit" : "withdraw") : null,
            LastTransactionTitle = lastTx?.Title,
            LastTransactionDate = lastTx?.CreatedAt,
            MonthOrdersCount = monthOrdersCount
        };
    }

    // واکشی خلاصه کیف پول بر اساس شماره تلفن کاربر
    public async Task<WalletSummaryDto> GetWalletSummaryByPhoneAsync(string phone, CancellationToken cancellationToken = default)
    {
        var normalized = phone.Trim().Replace(" ", "");
        var user = await _userManager.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.PhoneNumber == normalized || u.UserName == normalized, cancellationToken);

        if (user is null)
        {
            return new WalletSummaryDto
            {
                Balance = 0,
                MonthOrdersCount = 0
            };
        }

        return await GetWalletSummaryAsync(user.Id, cancellationToken);
    }

    // شارژ آنلاین کیف پول و ثبت ترنزکشن واریز
    public async Task<bool> ChargeWalletAsync(Guid parentId, decimal amount, string? trackingCode = null, CancellationToken cancellationToken = default)
    {
        if (amount <= 0) return false;

        var wallet = await _dbContext.Wallets
            .FirstOrDefaultAsync(w => w.ParentId == parentId, cancellationToken);

        if (wallet is null)
        {
            wallet = new Wallet
            {
                Id = Guid.NewGuid(),
                ParentId = parentId,
                Balance = 0,
                VirtualCardNumber = $"6037-9918-{Random.Shared.Next(1000, 9999)}-{Random.Shared.Next(1000, 9999)}",
                LastUpdated = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            await _dbContext.Wallets.AddAsync(wallet, cancellationToken);
        }

        // افزایش مانده موجودی
        wallet.Balance += amount;
        wallet.LastUpdated = DateTime.UtcNow;

        // ثبت سند تراکنش واریز
        var tx = new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            ParentId = parentId,
            Amount = amount,
            Type = TransactionType.Deposit,
            Title = "شارژ آنلاین کیف پول",
            Subtitle = "درگاه پرداخت شاپرک",
            TrackingCode = trackingCode ?? Random.Shared.Next(100000, 999999).ToString(),
            Status = "موفق",
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.WalletTransactions.AddAsync(tx, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    // متد کمکی برای به دست آوردن دقیق بازه ماه جاری شمسی و شمارش سفارش‌های والد در این بازه
    private async Task<int> CalculateCurrentPersianMonthOrdersCountAsync(Guid parentId, CancellationToken cancellationToken)
    {
        try
        {
            var pc = new PersianCalendar();
            var now = DateTime.UtcNow;

            var currentYear = pc.GetYear(now);
            var currentMonth = pc.GetMonth(now);

            // اول و آخر ماه شمسی رو محاسبه می‌کنیم
            var startOfMonth = pc.ToDateTime(currentYear, currentMonth, 1, 0, 0, 0, 0);
            var daysInMonth = pc.GetDaysInMonth(currentYear, currentMonth);
            var endOfMonth = pc.ToDateTime(currentYear, currentMonth, daysInMonth, 23, 59, 59, 999);

            var startServingDate = DateOnly.FromDateTime(startOfMonth);
            var endServingDate = DateOnly.FromDateTime(endOfMonth);

            return await _dbContext.SchoolOrders
                .AsNoTracking()
                .Where(o => o.ParentId == parentId &&
                            ((o.ServingDate >= startServingDate && o.ServingDate <= endServingDate) ||
                             (o.CreatedAt >= startOfMonth && o.CreatedAt <= endOfMonth)))
                .CountAsync(cancellationToken);
        }
        catch
        {
            // در صورت بروز هر خطای تقویمی، فال‌بک امن برای ماه میلادی
            var startOfGregorianMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            return await _dbContext.SchoolOrders
                .AsNoTracking()
                .Where(o => o.ParentId == parentId && o.CreatedAt >= startOfGregorianMonth)
                .CountAsync(cancellationToken);
        }
    }
}
