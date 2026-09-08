using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر مدارس؛ کاملاً Dumb بوده و هیچ لاجیکی ندارد و صرفاً به ISchoolService در اینفراستراکچر دلیگیت می‌کند
[ApiController]
[Route("api/[controller]")]
public class SchoolsController : ControllerBase
{
    private readonly ISchoolService _schoolService;

    public SchoolsController(ISchoolService schoolService)
    {
        _schoolService = schoolService;
    }

    // دریافت لیست مدارس فعال جهت نمایش در سلکت‌باکس فرم ثبت فرزند
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SchoolDto>>> GetSchools(CancellationToken cancellationToken)
    {
        var schools = await _schoolService.GetActiveSchoolsAsync(cancellationToken);
        return Ok(schools);
    }

    // افزودن مدرسه جدید توسط ادمین
    [HttpPost]
    public async Task<ActionResult<SchoolDto>> CreateSchool([FromBody] CreateSchoolDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var school = await _schoolService.CreateSchoolAsync(dto, cancellationToken);
            return CreatedAtAction(nameof(GetSchools), new { id = school.Id }, school);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // متد ادمین جهت سید دستی یا اولیه مدارس در صورت نیاز
    [HttpPost("seed")]
    public async Task<IActionResult> SeedSchools(CancellationToken cancellationToken)
    {
        await _schoolService.SeedDefaultSchoolsAsync(cancellationToken);
        return Ok(new { message = "مدارس پیش‌فرض با موفقیت سید شدند." });
    }
}
