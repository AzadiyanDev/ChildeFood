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

    // واکشی ۵ تراکنش اخیر کاربر با شناسه والد برای کارت تراکنش‌های اخیر
    [HttpGet("transactions/recent/{parentId:guid}")]
    public async Task<ActionResult<IReadOnlyList<WalletTransactionDto>>> GetRecentTransactions(Guid parentId, [FromQuery] int count = 5, CancellationToken cancellationToken = default)
    {
        var list = await _walletService.GetRecentTransactionsAsync(parentId, count, null, cancellationToken);
        return Ok(list);
    }

    // واکشی ۵ تراکنش اخیر کاربر با شماره تلفن همراه
    [HttpGet("transactions/recent-by-phone/{phone}")]
    public async Task<ActionResult<IReadOnlyList<WalletTransactionDto>>> GetRecentTransactionsByPhone(string phone, [FromQuery] int count = 5, CancellationToken cancellationToken = default)
    {
        var list = await _walletService.GetRecentTransactionsAsync(Guid.Empty, count, phone, cancellationToken);
        return Ok(list);
    }

    // واکشی تراکنش‌ها به‌صورت صفحه‌بندی شده برای اسکرول نامحدود با شناسه والد
    [HttpGet("transactions/paged/{parentId:guid}")]
    public async Task<ActionResult<PagedTransactionsDto>> GetPagedTransactions(Guid parentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? type = null, CancellationToken cancellationToken = default)
    {
        var result = await _walletService.GetTransactionsPagedAsync(parentId, page, pageSize, type, null, cancellationToken);
        return Ok(result);
    }

    // واکشی تراکنش‌ها به‌صورت صفحه‌بندی شده با کوئری استرینگ (برای پشتیبانی از تلفن همراه یا والت پیش‌فرض)
    [HttpGet("transactions/paged")]
    public async Task<ActionResult<PagedTransactionsDto>> GetPagedTransactionsQuery([FromQuery] Guid? parentId, [FromQuery] string? phone, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? type = null, CancellationToken cancellationToken = default)
    {
        var result = await _walletService.GetTransactionsPagedAsync(parentId ?? Guid.Empty, page, pageSize, type, phone, cancellationToken);
        return Ok(result);
    }
}
