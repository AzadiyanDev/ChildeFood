using System.Text.RegularExpressions;
using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ChildeFood.Infrastructure.Services;

// سرویس بیزینسی مدیریت کاربران، احراز هویت و فلو آنبوردینگ (تکمیل والد و ثبت فرزند)
public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApplicationDbContext _dbContext;
    private readonly IMemoryCache _cache;
    private readonly IWebHostEnvironment _environment;

    public UserService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IUnitOfWork unitOfWork,
        ApplicationDbContext dbContext,
        IMemoryCache cache,
        IWebHostEnvironment environment)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
        _cache = cache;
        _environment = environment;
    }

    // ارسال کد یکبارمصرف؛ شماره رو چک می‌کنیم، یه کد ۵ رقمی تولید می‌کنیم، کدهای قبلی رو باطل می‌کنیم و توی دیتابیس با انقضای ۲ دقیقه ذخیره می‌کنیم
    public async Task<SendOtpResponseDto> SendOtpAsync(SendOtpRequestDto request, CancellationToken cancellationToken = default)
    {
        var rawPhone = request.PhoneNumber?.Trim() ?? string.Empty;
        var normalizedPhone = NormalizePhoneNumber(rawPhone);

        // اعتبارسنجی فرمت شماره موبایل‌های ایران (۱۱ رقم که با ۰۹ شروع میشه)
        if (!IsValidIranianMobile(normalizedPhone))
        {
            return new SendOtpResponseDto
            {
                Success = false,
                Message = "شماره موبایل وارد شده معتبر نیست. لطفاً یک شماره ۱۱ رقمی مثل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.",
                ExpirySeconds = 0
            };
        }

        // ۱. ابطال کدهای فعال قبلی این شماره تلفن در دیتابیس تا فقط آخرین کد صادر شده معتبر باشه
        await _unitOfWork.OtpCodes.InvalidatePreviousOtpsAsync(normalizedPhone, cancellationToken);

        // ۲. تولید کد تصادفی ۵ رقمی بین ۱۰۰۰۰ تا ۹۹۹۹۹
        var otpCode = Random.Shared.Next(10000, 99999).ToString();
        var now = DateTime.UtcNow;
        const int expirySeconds = 120; // ۲ دقیقه اعتبار دقیق به وقت یوتی‌سی

        // ۳. ایجاد و ذخیره انتیتی در دیتابیس
        var otpEntity = new OtpCode
        {
            Id = Guid.NewGuid(),
            PhoneNumber = normalizedPhone,
            Code = otpCode,
            CreatedAt = now,
            ExpiresAt = now.AddSeconds(expirySeconds),
            IsUsed = false,
            AttemptCount = 0
        };

        await _unitOfWork.OtpCodes.AddAsync(otpEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // چون در حال حاضر پنل پیامکی وصل نیست، کد اوتی‌پی رو در پاسخ می‌ذاریم تا فرانت بتونه توی توستر از بالا نشونش بده
        return new SendOtpResponseDto
        {
            Success = true,
            Message = "کد تایید یکبارمصرف با موفقیت صادر شد و در پایگاه داده ثبت گردید.",
            OtpCode = otpCode,
            ExpirySeconds = expirySeconds
        };
    }

    // بررسی کد اوتی‌پی وارد شده؛ جستجو در دیتابیس، بررسی انقضا، یکبار مصرف کردن کد و لاگین یا ساخت کاربر
    public async Task<AuthResponseDto> VerifyOtpAndLoginAsync(VerifyOtpRequestDto request, CancellationToken cancellationToken = default)
    {
        var rawPhone = request.PhoneNumber?.Trim() ?? string.Empty;
        var normalizedPhone = NormalizePhoneNumber(rawPhone);
        var inputOtp = request.OtpCode?.Trim() ?? string.Empty;

        if (string.IsNullOrEmpty(normalizedPhone) || string.IsNullOrEmpty(inputOtp))
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "شماره موبایل و کد تایید الزامی هستند."
            };
        }

        // ۱. جستجوی مستقیم در دیتابیس برای پیدا کردن کد معتبر، فعال و منقضی‌نشده
        var validOtp = await _unitOfWork.OtpCodes.GetLatestValidOtpAsync(normalizedPhone, inputOtp, cancellationToken);

        if (validOtp is null)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "کد تایید وارد شده نامعتبر است، منقضی شده یا قبلاً استفاده شده است."
            };
        }

        // ۲. سوزاندن کد در دیتابیس تا کاملاً یکبار مصرف باشه و کسی نتونه دوباره باهاش لاگین کنه
        validOtp.IsUsed = true;
        validOtp.UsedAt = DateTime.UtcNow;
        _unitOfWork.OtpCodes.Update(validOtp);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // بررسی می‌کنیم آیا این شماره قبلاً توی سامانه ثبت‌نام کرده یا نه
        var user = await _userManager.Users
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.PhoneNumber == normalizedPhone || u.UserName == normalizedPhone, cancellationToken);

        var isNewUser = false;

        // سناریوی کاربر جدید: کاربر در دیتابیس وجود نداره، پس با اکانت خالی (بدون نام) می‌سازیم تا بفرستیمش فلو تکمیل پروفایل
        if (user is null)
        {
            isNewUser = true;
            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = normalizedPhone,
                PhoneNumber = normalizedPhone,
                FullName = string.Empty, // طبق خواسته کاربر، کاربر جدید اکانتش خالیه و اسمی نداره
                RoleTitle = UserRoles.Parent,
                CreatedAt = DateTime.UtcNow,
                IsSmsNotificationActive = true,
                PhoneNumberConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errorDetails = string.Join(" | ", createResult.Errors.Select(e => e.Description));
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"خطا در ایجاد حساب کاربری: {errorDetails}"
                };
            }

            // اطمینان از وجود نقش والد و انتساب به کاربر
            if (!await _roleManager.RoleExistsAsync(UserRoles.Parent))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(UserRoles.Parent));
            }
            await _userManager.AddToRoleAsync(user, UserRoles.Parent);

            // ایجاد کیف پول اولیه با موجودی صفر
            var initialWallet = new Wallet
            {
                Id = Guid.NewGuid(),
                ParentId = user.Id,
                Balance = 0,
                VirtualCardNumber = $"6037-9918-{Random.Shared.Next(1000, 9999)}-{Random.Shared.Next(1000, 9999)}",
                LastUpdated = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Wallets.AddAsync(initialWallet, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            user.Wallet = initialWallet;
        }

        // بررسی وضعیت آنبوردینگ کاربر: اطلاعات والد دارد؟ فرزند دارد؟
        var onboardingStatus = await CheckOnboardingStatusAsync(user.Id, cancellationToken);
        var children = await _unitOfWork.Children.GetChildrenByParentIdAsync(user.Id, cancellationToken);

        var sessionToken = Guid.NewGuid().ToString("N");

        return new AuthResponseDto
        {
            Success = true,
            IsNewUser = isNewUser,
            OnboardingStatus = onboardingStatus,
            Message = isNewUser ? "خوش آمدید! حساب کاربری شما با موفقیت ایجاد شد." : "با موفقیت وارد حساب کاربری شدید.",
            Token = sessionToken,
            User = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? normalizedPhone,
                NationalId = user.NationalId,
                Address = user.Address,
                RoleTitle = user.RoleTitle ?? UserRoles.Parent,
                AvatarUrl = user.AvatarUrl,
                WalletBalance = user.Wallet?.Balance ?? 0,
                ChildrenCount = children.Count,
                OnboardingStatus = onboardingStatus
            }
        };
    }

    // گرفتن دیتای کاربر بر اساس شماره تلفن جهت سشن و پروفایل
    public async Task<UserDto?> GetUserByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        var user = await _userManager.Users
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.PhoneNumber == normalizedPhone || u.UserName == normalizedPhone, cancellationToken);

        if (user is null) return null;

        var onboardingStatus = await CheckOnboardingStatusAsync(user.Id, cancellationToken);
        var children = await _unitOfWork.Children.GetChildrenByParentIdAsync(user.Id, cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName ?? string.Empty,
            PhoneNumber = user.PhoneNumber ?? normalizedPhone,
            NationalId = user.NationalId,
            Address = user.Address,
            RoleTitle = user.RoleTitle ?? UserRoles.Parent,
            AvatarUrl = user.AvatarUrl,
            WalletBalance = user.Wallet?.Balance ?? 0,
            ChildrenCount = children.Count,
            OnboardingStatus = onboardingStatus
        };
    }

    // مرحله اول آنبوردینگ: ثبت و تکمیل اطلاعات شخصی والد (نام، کدملی، نسبت، آدرس و آواتار)
    public async Task<UserDto> UpdateParentProfileAsync(Guid userId, UpdateParentProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            throw new KeyNotFoundException($"کاربری با شناسه {userId} یافت نشد.");

        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("نام و نام خانوادگی والد الزامی است.");

        user.FullName = dto.FullName.Trim();
        user.NationalId = dto.NationalId?.Trim();
        user.Address = dto.Address?.Trim();
        user.RoleTitle = string.IsNullOrWhiteSpace(dto.RoleTitle) ? "مادر (سرپرست خانواده)" : dto.RoleTitle.Trim();

        if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            user.AvatarUrl = dto.AvatarUrl.Trim();

        var updateRes = await _userManager.UpdateAsync(user);
        if (!updateRes.Succeeded)
            throw new InvalidOperationException("خطا در ذخیره مشخصات والد: " + string.Join(", ", updateRes.Errors.Select(e => e.Description)));

        var children = await _unitOfWork.Children.GetChildrenByParentIdAsync(userId, cancellationToken);
        var onboardingStatus = children.Count == 0 ? "NeedChild" : "Completed";

        var wallet = await _unitOfWork.Wallets.GetByParentIdAsync(userId, cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber ?? string.Empty,
            NationalId = user.NationalId,
            Address = user.Address,
            RoleTitle = user.RoleTitle,
            AvatarUrl = user.AvatarUrl,
            WalletBalance = wallet?.Balance ?? 0,
            ChildrenCount = children.Count,
            OnboardingStatus = onboardingStatus
        };
    }

    // مرحله دوم آنبوردینگ: افزودن اولین فرزند دانش‌آموز متصل به والد و مدرسه
    public async Task<ChildDto> AddChildAsync(Guid parentId, AddChildDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(parentId.ToString());
        if (user is null)
            throw new KeyNotFoundException($"والدی با شناسه {parentId} یافت نشد.");

        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("نام و نام خانوادگی فرزند الزامی است.");

        // پیدا کردن مدرسه از طریق شناسه یا نام در جدول مدارس
        School? school = null;
        if (dto.SchoolId.HasValue && dto.SchoolId.Value != Guid.Empty)
        {
            school = await _dbContext.Schools.FirstOrDefaultAsync(s => s.Id == dto.SchoolId.Value, cancellationToken);
        }

        if (school is null)
        {
            var schoolName = string.IsNullOrWhiteSpace(dto.SchoolName) ? "دبستان نمونه" : dto.SchoolName.Trim();
            school = await _dbContext.Schools.FirstOrDefaultAsync(s => s.Name == schoolName, cancellationToken);
            if (school is null)
            {
                school = new School
                {
                    Id = Guid.NewGuid(),
                    Name = schoolName,
                    BranchCode = "SCH-" + Random.Shared.Next(100, 999),
                    Address = "تهران، منطقه آموزشی",
                    DefaultLunchTime = "12:30",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await _dbContext.Schools.AddAsync(school, cancellationToken);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        var child = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parentId,
            SchoolId = school.Id,
            FullName = dto.FullName.Trim(),
            Grade = string.IsNullOrWhiteSpace(dto.Grade) ? "پایه اول" : dto.Grade.Trim(),
            Age = dto.Age > 0 ? dto.Age : 8,
            AvatarUrl = string.IsNullOrWhiteSpace(dto.AvatarUrl) ? "👦" : dto.AvatarUrl.Trim(),
            DietaryNotes = dto.DietaryNotes?.Trim(),
            FavoriteFood = dto.FavoriteFood?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Children.AddAsync(child, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ChildDto
        {
            Id = child.Id,
            ParentId = child.ParentId,
            SchoolId = school.Id,
            SchoolName = school.Name,
            FullName = child.FullName,
            Grade = child.Grade,
            Age = child.Age,
            AvatarUrl = child.AvatarUrl,
            DietaryNotes = child.DietaryNotes,
            FavoriteFood = child.FavoriteFood,
            IsActive = child.IsActive
        };
    }

    // واکشی لیست فرزندان متعلق به یک والد
    public async Task<IReadOnlyList<ChildDto>> GetUserChildrenAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        var children = await _unitOfWork.Children.GetChildrenByParentIdAsync(parentId, cancellationToken);
        var result = new List<ChildDto>();

        foreach (var c in children)
        {
            var school = c.School ?? await _dbContext.Schools.FindAsync([c.SchoolId], cancellationToken);
            result.Add(new ChildDto
            {
                Id = c.Id,
                ParentId = c.ParentId,
                SchoolId = c.SchoolId,
                SchoolName = school?.Name ?? "مدرسه نمونه",
                FullName = c.FullName,
                Grade = c.Grade,
                Age = c.Age,
                AvatarUrl = c.AvatarUrl,
                DietaryNotes = c.DietaryNotes,
                FavoriteFood = c.FavoriteFood,
                IsActive = c.IsActive
            });
        }

        return result;
    }

    // متد کلیدی بررسی وضعیت آنبوردینگ: اول والد تکمیل شده؟ بعد فرزند داره؟
    public async Task<string> CheckOnboardingStatusAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return "NeedParentProfile";

        // اگر نام والد خالیه یا هنوز همون مقدار اولیه بدون اسم هست، باید اطلاعاتش رو کامل کنه
        if (string.IsNullOrWhiteSpace(user.FullName) || user.FullName == "والد گرامی")
        {
            return "NeedParentProfile";
        }

        // اگر اطلاعات خودش اوکی بود، چک می‌کنیم حداقل یک فرزند داشته باشه
        var children = await _unitOfWork.Children.GetChildrenByParentIdAsync(userId, cancellationToken);
        if (children.Count == 0)
        {
            return "NeedChild";
        }

        // هم اطلاعات والد پر شده و هم فرزند داره، پس آنبوردینگ کامله و می‌تونه بیاد تو صفحه اصلی
        return "Completed";
    }

    // نرمال‌سازی شماره همراه: تبدیل ارقام فارسی و عربی به لاتین و تنظیم پیش‌شماره ایران
    private static string NormalizePhoneNumber(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var chars = input.ToCharArray();
        for (int i = 0; i < chars.Length; i++)
        {
            if (chars[i] >= '۰' && chars[i] <= '۹')
                chars[i] = (char)('0' + (chars[i] - '۰'));
            else if (chars[i] >= '٠' && chars[i] <= '٩')
                chars[i] = (char)('0' + (chars[i] - '٠'));
        }
        var cleaned = new string(chars).Replace(" ", "").Replace("-", "");

        if (cleaned.StartsWith("+98"))
            cleaned = "0" + cleaned[3..];
        else if (cleaned.StartsWith("0098"))
            cleaned = "0" + cleaned[4..];
        else if (cleaned.StartsWith("98") && cleaned.Length == 12)
            cleaned = "0" + cleaned[2..];
        else if (cleaned.Length == 10 && cleaned.StartsWith("9"))
            cleaned = "0" + cleaned;

        return cleaned;
    }

    // بررسی فرمت شماره موبایل ۱۱ رقمی ایران
    private static bool IsValidIranianMobile(string phone)
    {
        return Regex.IsMatch(phone, @"^09\d{9}$");
    }

    // آپلود و ذخیره‌سازی واقعی فایل تصویر نمایه در سرور
    // اینجا فایل ارسالی کاربر رو ولیدیت می‌کنیم، تو مسیر uploads ذخیره‌ش می‌کنیم و آدرسش رو برمی‌گردونیم
    public async Task<UploadAvatarResponseDto> UploadAvatarAsync(
        Stream fileStream,
        string originalFileName,
        string contentType,
        Guid? userId = null,
        CancellationToken cancellationToken = default)
    {
        if (fileStream == null)
        {
            return new UploadAvatarResponseDto
            {
                Success = false,
                Message = "فایل انتخاب‌شده نامعتبر است."
            };
        }

        // بررسی حجم تصویر (حداکثر ۱۰ مگابایت)
        long streamLength = 0;
        try
        {
            if (fileStream.CanSeek)
                streamLength = fileStream.Length;
        }
        catch
        {
            streamLength = 0;
        }

        if (streamLength > 10 * 1024 * 1024)
        {
            return new UploadAvatarResponseDto
            {
                Success = false,
                Message = "حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد."
            };
        }

        var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant() ?? string.Empty;
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".svg" };
        if (!allowedExtensions.Contains(ext))
        {
            return new UploadAvatarResponseDto
            {
                Success = false,
                Message = "فرمت فایل مجاز نیست. لطفاً یکی از فرمت‌های PNG، JPG، WEBP یا SVG را انتخاب کنید."
            };
        }

        // پوشه ذخیره‌سازی در روت پروژه وب
        var targetFolder = Path.Combine(_environment.ContentRootPath, "uploads", "avatars");
        if (!Directory.Exists(targetFolder))
        {
            Directory.CreateDirectory(targetFolder);
        }

        var cleanFileName = $"avatar_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8]}{ext}";
        var filePath = Path.Combine(targetFolder, cleanFileName);

        using (var output = new FileStream(filePath, FileMode.Create, FileAccess.Write))
        {
            if (fileStream.CanSeek)
                fileStream.Seek(0, SeekOrigin.Begin);
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        var relativeUrl = $"/uploads/avatars/{cleanFileName}";

        // اگر آیدی کاربر والد ارسال شده باشه، بلافاصله فیلد آواتار توی دیتابیس رو هم آپدیت می‌کنیم
        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            var user = await _userManager.FindByIdAsync(userId.Value.ToString());
            if (user != null)
            {
                user.AvatarUrl = relativeUrl;
                await _userManager.UpdateAsync(user);
            }
        }

        return new UploadAvatarResponseDto
        {
            Success = true,
            Message = "تصویر با موفقیت در سیستم آپلود و ذخیره شد.",
            Url = relativeUrl
        };
    }
}

