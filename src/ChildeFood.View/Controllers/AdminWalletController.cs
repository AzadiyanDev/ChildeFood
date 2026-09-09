using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدیریت کیف پول و امور مالی در پنل ادمین
// طبق اصول معماری تمیز کاملاً Dumb است: صفر بیزینس لاجیک و صرفاً هدایت ریکوئست به سرویس
[ApiController]
[Route("api/admin/wallets")]
public class AdminWalletController : ControllerBase
{
    private readonly IAdminWalletService _walletService;

    public AdminWalletController(IAdminWalletService walletService)
    {
        _walletService = walletService;
    }

    // دریافت لیست کیف‌پول‌ها با فیلتر جستجو و وضعیت
    // GET: api/admin/wallets?q=...&activeOnly=true
    [HttpGet]
    public async Task<IActionResult> GetWallets([FromQuery] string? q, [FromQuery] bool? activeOnly)
    {
        var result = await _walletService.GetWalletsAsync(q, activeOnly);
        return Ok(result);
    }

    // دریافت آمارهای کلان مالی و موجودی
    // GET: api/admin/wallets/stats
    [HttpGet("stats")]
    public async Task<IActionResult> GetWalletStats()
    {
        var stats = await _walletService.GetWalletStatsAsync();
        return Ok(stats);
    }

    // دریافت جزئیات یک کیف پول به همراه ۵ تراکنش آخر
    // GET: api/admin/wallets/{walletId}
    [HttpGet("{walletId:guid}")]
    public async Task<IActionResult> GetWalletDetail(Guid walletId)
    {
        var detail = await _walletService.GetWalletDetailAsync(walletId);
        if (detail == null)
            return NotFound(new { message = "کیف پولی با این مشخصات یافت نشد." });

        return Ok(detail);
    }

    // تغییر وضعیت فعال یا مسدود بودن کیف پول
    // PUT: api/admin/wallets/{walletId}/toggle-status
    [HttpPut("{walletId:guid}/toggle-status")]
    public async Task<IActionResult> ToggleWalletStatus(Guid walletId, [FromBody] ToggleWalletStatusDto request)
    {
        var success = await _walletService.ToggleWalletStatusAsync(walletId, request.IsActive);
        if (!success)
            return NotFound(new { message = "کیف پول مورد نظر یافت نشد." });

        return Ok(new { success, isActive = request.IsActive, message = request.IsActive ? "کیف پول با موفقیت فعال شد." : "کیف پول با موفقیت مسدود گردید." });
    }
}
