using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدیریت مدارس — مثل همیشه، هیچ لاجیکی اینجا نیست، فقط route و return
[ApiController]
[Route("api/admin/schools")]
public class AdminSchoolController : ControllerBase
{
    private readonly IAdminSchoolService _service;

    public AdminSchoolController(IAdminSchoolService service)
    {
        _service = service;
    }

    // GET api/admin/schools — لیست همه مدارس با آمار خلاصه
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllSchoolsAsync();
        return Ok(result);
    }

    // GET api/admin/schools/{id} — دیتیل کامل یه مدرسه خاص
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var result = await _service.GetSchoolDetailAsync(id);

        // اگه مدرسه پیدا نشد ۴۰۴ برمیگردونیم
        if (result is null)
            return NotFound(new { message = "مدرسه‌ای با این آیدی پیدا نشد." });

        return Ok(result);
    }

    // POST api/admin/schools — ساخت مدرسه جدید
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSchoolDto dto)
    {
        var result = await _service.CreateSchoolAsync(dto);

        // با ۲۰۱ برمیگردیم و لینک دیتیل رو هم میدیم
        return CreatedAtAction(nameof(GetDetail), new { id = result.Id }, result);
    }

    // PATCH api/admin/schools/{id}/toggle — برعکس کردن وضعیت فعال/غیرفعال
    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        try
        {
            var newStatus = await _service.ToggleSchoolStatusAsync(id);
            return Ok(new { isActive = newStatus });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
