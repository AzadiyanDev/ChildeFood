using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// قرارداد کارهای مربوط به یوزرها و لاگین؛ همه بیزینس لاجیک‌ها توی لایه اینفرا اجرا میشن و کنترلر فقط این رو صدا می‌زنه
public interface IUserService
{
    // تولید و ارسال کد یکبارمصرف (OTP) به شماره موبایل والد
    Task<SendOtpResponseDto> SendOtpAsync(SendOtpRequestDto request, CancellationToken cancellationToken = default);

    // تایید کد، بررسی وجود کاربر در سیستم و ساخت اکانت با مقادیر دیفالت و لاگین کردن
    Task<AuthResponseDto> VerifyOtpAndLoginAsync(VerifyOtpRequestDto request, CancellationToken cancellationToken = default);

    // دریافت اطلاعات کاربر بر اساس شماره موبایل جهت بررسی وضعیت یا رفرش سشن
    Task<UserDto?> GetUserByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default);

    // تکمیل و ویرایش اطلاعات پروفایل والد در مرحله اول آنبوردینگ
    Task<UserDto> UpdateParentProfileAsync(Guid userId, UpdateParentProfileDto dto, CancellationToken cancellationToken = default);

    // ثبت اولین فرزند (یا فرزندان بعدی) در مرحله دوم آنبوردینگ
    Task<ChildDto> AddChildAsync(Guid parentId, AddChildDto dto, CancellationToken cancellationToken = default);

    // دریافت لیست فرزندان ثبت‌شده برای یک والد
    Task<IReadOnlyList<ChildDto>> GetUserChildrenAsync(Guid parentId, CancellationToken cancellationToken = default);

    // بررسی اینکه آیا کاربر اطلاعات والد و حداقل یک فرزند را دارد یا نه
    Task<string> CheckOnboardingStatusAsync(Guid userId, CancellationToken cancellationToken = default);

    // آپلود و ذخیره‌سازی واقعی تصویر نمایه کاربر روی سرور
    Task<UploadAvatarResponseDto> UploadAvatarAsync(Stream fileStream, string originalFileName, string contentType, Guid? userId = null, CancellationToken cancellationToken = default);
}
