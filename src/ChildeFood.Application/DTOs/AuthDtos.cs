namespace ChildeFood.Application.DTOs;

// دی‌تی‌او برای وقتی که کاربر شماره موبایلش رو می‌فرسته تا براش کد پیامک بشه
public class SendOtpRequestDto
{
    // همون شماره موبایل ۱۱ رقمی کاربر
    public string PhoneNumber { get; set; } = string.Empty;
}

// نتیجه درخواست ارسال کد یکبارمصرف
public class SendOtpResponseDto
{
    // ارسال شد یا نه؟
    public bool Success { get; set; }

    // پیامی که به فرانت یا کاربر نشون می‌دیم
    public string Message { get; set; } = string.Empty;

    // چون فعلاً پنل پیامکی نداریم، کد رو مستقیم می‌فرستیم که فرانت بتونه توی توستر از بالا نشونش بده
    public string? OtpCode { get; set; }

    // مدت زمان اعتبار کد به ثانیه (مثلاً ۱۲۰ ثانیه)
    public int ExpirySeconds { get; set; } = 120;
}

// مدلی که وقتی کاربر کد ۵ رقمی رو تایپ کرد می‌فرسته سمت سرور
public class VerifyOtpRequestDto
{
    // شماره موبایلی که کد براش ارسال شده بود
    public string PhoneNumber { get; set; } = string.Empty;

    // کدی که کاربر توی کادر وارد کرده
    public string OtpCode { get; set; } = string.Empty;
}

// خروجی نهایی لاگین؛ این اطلاعات به فرانت برمی‌گرده تا یوزر سشنش رو بسازه
public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;

    // توکن یا کلید نشست (در صورت نیاز)
    public string? Token { get; set; }

    // آیا کاربر تازه در سیستم عضو شده یا از قبل اکانت داشته؟
    public bool IsNewUser { get; set; }

    // وضعیت آنبوردینگ کاربر: 'NeedParentProfile' یا 'NeedChild' یا 'Completed'
    public string OnboardingStatus { get; set; } = "NeedParentProfile";

    // مشخصات کاربر جهت نمایش در هدر و پروفایل
    public UserDto? User { get; set; }
}

// مشخصات تر و تمیز یوزر که می‌فرستیم سمت کلاینت تا باهاش یوآی رو آپدیت کنه
public class UserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string? Address { get; set; }
    public string? RoleTitle { get; set; }
    public string? AvatarUrl { get; set; }
    public decimal WalletBalance { get; set; }
    public int ChildrenCount { get; set; }
    public string OnboardingStatus { get; set; } = "NeedParentProfile";
}

// مدل تکمیل اطلاعات پروفایل والد در مرحله اول ثبت‌نام
public class UpdateParentProfileDto
{
    // نام و نام خانوادگی کامل والد
    public string FullName { get; set; } = string.Empty;

    // کدملی جهت احراز هویت در سامانه مدارس
    public string? NationalId { get; set; }

    // نسبت با دانش‌آموز (مثلاً: مادر، پدر، سرپرست خانواده)
    public string? RoleTitle { get; set; }

    // نشانی دقیق محل سکونت
    public string? Address { get; set; }

    // آیکون یا تصویر آواتار انتخابی
    public string? AvatarUrl { get; set; }
}

// مدل ثبت اطلاعات اولین فرزند در مرحله دوم ثبت‌نام
public class AddChildDto
{
    // نام و نام خانوادگی فرزند
    public string FullName { get; set; } = string.Empty;

    // سن فرزند
    public int Age { get; set; }

    // پایه تحصیلی (مثلاً: کلاس پنجم، دوم ابتدایی)
    public string Grade { get; set; } = string.Empty;

    // نام مدرسه محل تحصیل کودک
    public string SchoolName { get; set; } = string.Empty;

    // شناسه یکتای مدرسه در صورت انتخاب از جدول مدارس
    public Guid? SchoolId { get; set; }

    // یادداشت‌های تغذیه‌ای یا حساسیت‌ها (مثلاً: بدون حساسیت، فاقد بادام‌زمینی)
    public string? DietaryNotes { get; set; }

    // غذای مورد علاقه فرزند
    public string? FavoriteFood { get; set; }

    // آواتار انتخابی برای فرزند
    public string? AvatarUrl { get; set; }
}

// مدل انتقال اطلاعات فرزند به فرانت‌اند
public class ChildDto
{
    public Guid Id { get; set; }
    public Guid ParentId { get; set; }
    public Guid SchoolId { get; set; }
    public string SchoolName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public int Age { get; set; }
    public string? AvatarUrl { get; set; }
    public string? DietaryNotes { get; set; }
    public string? FavoriteFood { get; set; }
    public bool IsActive { get; set; } = true;
}

// خروجی آپلود آواتار والد؛ وقتی عکس با موفقیت آپلود شد، آدرسش رو برمی‌گردونیم تا تو فرانت نشونش بدیم
public class UploadAvatarResponseDto
{
    // آپلود موفق بود یا نه؟
    public bool Success { get; set; }

    // پیام به کاربر (مثلا عکس با موفقیت ذخیره شد)
    public string Message { get; set; } = string.Empty;

    // آدرس نسبی تصویر ذخیره‌شده روی سرور، مثلا /uploads/avatars/avatar-xxx.png
    public string? Url { get; set; }
}

