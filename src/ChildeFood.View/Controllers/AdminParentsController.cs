using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدیریت والدین و دانش‌آموزان در پنل ادمین
// طبق قانون دوم، کنترلر کاملاً Dumb است و هیچ منطق بیزینسی ندارد؛ صرفاً روتینگ و پاسخ HTTP
[ApiController]
[Route("api/admin/parents")]
public class AdminParentsController : ControllerBase
{
    private readonly IAdminParentService _service;

    public AdminParentsController(IAdminParentService service)
    {
        _service = service;
    }

    // دریافت لیست کلیه والدین برای جدول اصلی
    // GET: api/admin/parents
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllParentsAsync();
        return Ok(result);
    }

    // دریافت اطلاعات دقیق و جزئیات یک والد به همراه فرزندانش
    // GET: api/admin/parents/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var result = await _service.GetParentDetailAsync(id);
        if (result == null)
            return NotFound(new { message = "والد مورد نظر در سامانه یافت نشد." });

        return Ok(result);
    }

    // تغییر وضعیت فعال یا غیرفعال بودن حساب کاربری والد
    // PATCH: api/admin/parents/{id}/toggle
    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        try
        {
            var newStatus = await _service.ToggleParentStatusAsync(id);
            return Ok(new { isActive = newStatus });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // تغییر وضعیت فعال یا غیرفعال بودن یک دانش‌آموز
    // PATCH: api/admin/parents/children/{id}/toggle
    [HttpPatch("children/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleChild(Guid id)
    {
        try
        {
            var newStatus = await _service.ToggleChildStatusAsync(id);
            return Ok(new { isActive = newStatus });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
