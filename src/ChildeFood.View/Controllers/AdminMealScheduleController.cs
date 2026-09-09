using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدیریت برنامه غذایی — دام‌ترین کنترلر ممکن، هیچ لاجیکی اینجا نیست
[ApiController]
[Route("api/admin/meal-schedule")]
public class AdminMealScheduleController : ControllerBase
{
    private readonly IAdminMealScheduleService _service;

    public AdminMealScheduleController(IAdminMealScheduleService service)
    {
        _service = service;
    }

    // نوار تقویم — ۳۱ روز از ۱۵ روز پیش
    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar()
    {
        var from = DateOnly.FromDateTime(DateTime.Today.AddDays(-15));
        var result = await _service.GetCalendarDaysAsync(from, 31);
        return Ok(result);
    }

    // برنامه غذایی یه روز خاص
    [HttpGet("day")]
    public async Task<IActionResult> GetDaySchedule([FromQuery] string date, [FromQuery] Guid? schoolId = null)
    {
        // پارس تاریخ میلادی از query string
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest("فرمت تاریخ اشتباهه، باید YYYY-MM-DD باشه.");

        var result = await _service.GetDayScheduleAsync(parsedDate, schoolId);
        return Ok(result);
    }

    // همه غذاها برای مودال سلکت
    [HttpGet("food-items")]
    public async Task<IActionResult> GetAllFoodItems()
    {
        var result = await _service.GetAllFoodItemsAsync();
        return Ok(result);
    }

    // اضافه کردن غذاها به یه روز
    [HttpPost("add")]
    public async Task<IActionResult> AddMeals([FromBody] AddMealsToScheduleDto dto)
    {
        await _service.AddMealsToScheduleAsync(dto);
        return Ok(new { message = "غذاها با موفقیت به برنامه اضافه شدن." });
    }

    // حذف یه آیتم از برنامه روز
    [HttpDelete("{scheduleId:guid}")]
    public async Task<IActionResult> RemoveMeal(Guid scheduleId)
    {
        await _service.RemoveMealFromScheduleAsync(scheduleId);
        return Ok(new { message = "آیتم از برنامه حذف شد." });
    }
}
