using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر کاملاً دام (Dumb)؛ فقط مسئول روتینگ و پس دادن ریسپانس اچ‌تی‌تی‌پی هست و صفر منطق بیزینس داره!
[ApiController]
[Route("api/[controller]")]
public class FoodsController : ControllerBase
{
    private readonly IFoodService _foodService;

    public FoodsController(IFoodService foodService)
    {
        _foodService = foodService;
    }

    // گرفتن تمام غذاها؛ بدون لاجیک اضافه، کار رو مستقیم می‌سپاریم به سرویس اینفرا
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FoodItemDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _foodService.GetAllFoodsAsync(cancellationToken);
        return Ok(result);
    }

    // گرفتن جزئیات یک غذای خاص با شناسه Guid
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FoodItemDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _foodService.GetFoodByIdAsync(id, cancellationToken);
        if (result is null)
            return NotFound(new { message = $"غذایی با شناسه {id} پیدا نشد." });

        return Ok(result);
    }

    // ثبت غذای جدید در سیستم
    [HttpPost]
    public async Task<ActionResult<FoodItemDto>> Create([FromBody] CreateFoodItemDto dto, CancellationToken cancellationToken)
    {
        var created = await _foodService.CreateFoodAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}