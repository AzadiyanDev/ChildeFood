using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس مدیریت مالی و کیف‌پول‌ها در پنل ادمین
public interface IAdminWalletService
{
    // دریافت لیست کیف‌پول‌ها همراه با فیلتر جستجو و وضعیت
    Task<List<AdminWalletListItemDto>> GetWalletsAsync(string? searchQuery, bool? activeOnly);

    // دریافت جزئیات یک کیف پول همراه با ۵ تراکنش آخر
    Task<AdminWalletDetailDto?> GetWalletDetailAsync(Guid walletId);

    // دریافت آمارهای کلان مالی و موجودی سیستم
    Task<AdminWalletStatsDto> GetWalletStatsAsync();

    // فعال یا غیرفعال/مسدود کردن کیف پول
    Task<bool> ToggleWalletStatusAsync(Guid walletId, bool isActive);

    // اطمینان از وجود کیف پول و تراکنش‌های واقعی جهت نمایش استاندارد
    Task EnsureSampleWalletsAndTransactionsAsync();
}
