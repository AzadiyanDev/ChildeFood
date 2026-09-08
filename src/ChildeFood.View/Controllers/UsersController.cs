using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ChildeFood.View.Controllers;

// کنترلر کاملاً دام (Dumb)؛ طبق قانون ۲ پروژه اینجا مطلقا صفر خط منطق بیزینس می‌نویسیم!
// فقط ریکوئست رو از فرانت می‌گیریم، می‌دیم به UserService در اینفرا و جواب رو برمی‌گردونیم.
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // درخواست ارسال کد یکبارمصرف به شماره موبایل کاربر
    [HttpPost("send-otp")]
    public async Task<ActionResult<SendOtpResponseDto>> SendOtp([FromBody] SendOtpRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _userService.SendOtpAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // اعتبارسنجی کد اوتی‌پی وارد شده توسط کاربر و لاگین یا ساخت اکانت اتوماتیک
    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponseDto>> VerifyOtp([FromBody] VerifyOtpRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _userService.VerifyOtpAndLoginAsync(request, cancellationToken);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // دریافت اطلاعات پروفایل کاربر بر اساس شماره تماس
    [HttpGet("profile/{phone}")]
    public async Task<ActionResult<UserDto>> GetProfile(string phone, CancellationToken cancellationToken)
    {
        var user = await _userService.GetUserByPhoneAsync(phone, cancellationToken);
        if (user is null)
            return NotFound(new { message = $"کاربری با شماره موبایل {phone} یافت نشد." });

        return Ok(user);
    }

    // گام اول آنبوردینگ: به‌روزرسانی و تکمیل مشخصات والد
    [HttpPut("profile/{userId:guid}")]
    public async Task<ActionResult<UserDto>> UpdateParentProfile(Guid userId, [FromBody] UpdateParentProfileDto dto, CancellationToken cancellationToken)
    {
        var updated = await _userService.UpdateParentProfileAsync(userId, dto, cancellationToken);
        return Ok(updated);
    }

    // گام دوم آنبوردینگ: ثبت اولین فرزند متصل به والد
    [HttpPost("children/{parentId:guid}")]
    public async Task<ActionResult<ChildDto>> AddChild(Guid parentId, [FromBody] AddChildDto dto, CancellationToken cancellationToken)
    {
        var child = await _userService.AddChildAsync(parentId, dto, cancellationToken);
        return Ok(child);
    }

    // دریافت لیست فرزندان ثبت‌شده برای یک والد
    [HttpGet("children/{parentId:guid}")]
    public async Task<ActionResult<IEnumerable<ChildDto>>> GetChildren(Guid parentId, CancellationToken cancellationToken)
    {
        var children = await _userService.GetUserChildrenAsync(parentId, cancellationToken);
        return Ok(children);
    }

    // بررسی وضعیت آنبوردینگ کاربر (آیا والد و فرزند ثبت شده‌اند یا نه)
    [HttpGet("onboarding-status/{userId:guid}")]
    public async Task<ActionResult<object>> CheckOnboardingStatus(Guid userId, CancellationToken cancellationToken)
    {
        var status = await _userService.CheckOnboardingStatusAsync(userId, cancellationToken);
        return Ok(new { status });
    }

    // آپلود فایل عکس نمایه سرپرست یا کاربر
    // کنترلر طبق معماری تمیز کاملاً Dumb بوده و صفر خط بیزنس لاجیک دارد؛ مستقیم فایل را تحویل سرویس اینفرا می‌دهد
    [HttpPost("upload-avatar/{userId:guid?}")]
    public async Task<ActionResult<UploadAvatarResponseDto>> UploadAvatar([FromRoute] Guid? userId, IFormFile file, CancellationToken cancellationToken)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new UploadAvatarResponseDto
            {
                Success = false,
                Message = "لطفاً یک فایل تصویر معتبر انتخاب نمایید."
            });
        }

        using var stream = file.OpenReadStream();
        var result = await _userService.UploadAvatarAsync(stream, file.FileName, file.ContentType, userId, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
