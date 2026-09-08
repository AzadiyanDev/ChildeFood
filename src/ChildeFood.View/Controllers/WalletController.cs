using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر کاملاً دام (Dumb Controller)؛ طبق قانون ۲ پروژه، اینجا مطلقا صفر خط منطق بیزینس نداریم!
// فقط درخواست HTTP رو تحویل می‌گیریم، میدیم به WalletService در اینفرا و خروجی رو برمی‌گردونیم.
[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    // واکشی خلاصه وضعیت کیف پول (موجودی، آخرین تراکنش، تعداد سفارش‌های ماه) با شناسه والد
    [HttpGet("summary/{parentId:guid}")]
    public async Task<ActionResult<WalletSummaryDto>> GetSummary(Guid parentId, CancellationToken cancellationToken)
    {
        var summary = await _walletService.GetWalletSummaryAsync(parentId, cancellationToken);
        return Ok(summary);
    }

    // واکشی خلاصه وضعیت کیف پول با شماره موبایل والد (جهت راحتی فرانت و سینک سریع سشن)
    [HttpGet("summary-by-phone/{phone}")]
    public async Task<ActionResult<WalletSummaryDto>> GetSummaryByPhone(string phone, CancellationToken cancellationToken)
    {
        var summary = await _walletService.GetWalletSummaryByPhoneAsync(phone, cancellationToken);
        return Ok(summary);
    }

    // شارژ آنلاین کیف پول
    [HttpPost("charge/{parentId:guid}")]
    public async Task<ActionResult<object>> ChargeWallet(Guid parentId, [FromQuery] decimal amount, [FromQuery] string? trackingCode, CancellationToken cancellationToken)
    {
        var success = await _walletService.ChargeWalletAsync(parentId, amount, trackingCode, cancellationToken);
        if (!success)
        {
            return BadRequest(new { message = "مبلغ شارژ باید بزرگتر از صفر باشد." });
        }

        return Ok(new { success = true, message = "کیف پول با موفقیت شارژ شد." });
    }
}
