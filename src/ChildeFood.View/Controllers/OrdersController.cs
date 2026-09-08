using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر کاملاً دام (Dumb Controller)؛ صفر درصد لاجیک بیزینس، فقط روتینگ و واگذاری مستقیم به OrderService
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // واکشی سفارش‌های امروز والد با شناسه کاربری
    [HttpGet("today/{parentId:guid}")]
    public async Task<ActionResult<IReadOnlyList<TodayOrderDto>>> GetTodayOrders(Guid parentId, [FromQuery] DateOnly? date, CancellationToken cancellationToken)
    {
        var orders = await _orderService.GetTodayOrdersAsync(parentId, date, cancellationToken);
        return Ok(orders);
    }

    // واکشی سفارش‌های امروز والد با شماره همراه
    [HttpGet("today-by-phone/{phone}")]
    public async Task<ActionResult<IReadOnlyList<TodayOrderDto>>> GetTodayOrdersByPhone(string phone, [FromQuery] DateOnly? date, CancellationToken cancellationToken)
    {
        var orders = await _orderService.GetTodayOrdersByPhoneAsync(phone, date, cancellationToken);
        return Ok(orders);
    }

    // واکشی سفارش‌های شخصی کاربر جاری با صفحه‌بندی ۱۰تایی برای اسکرول نامحدود
    [HttpGet("my-orders/{parentId:guid}")]
    public async Task<ActionResult<PagedOrdersDto>> GetMyOrders(Guid parentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var result = await _orderService.GetParentOrdersPagedAsync(parentId, page, pageSize, status, cancellationToken);
        return Ok(result);
    }

    // واکشی جزئیات کامل و جامع یک سفارش در زمان باز شدن مدال (Lazy Loading)
    [HttpGet("details/{orderId:guid}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderDetail(Guid orderId, CancellationToken cancellationToken = default)
    {
        var detail = await _orderService.GetOrderDetailAsync(orderId, cancellationToken);
        if (detail is null)
        {
            return NotFound(new { message = $"سفارشی با شناسه {orderId} یافت نشد." });
        }

        return Ok(detail);
    }
}
