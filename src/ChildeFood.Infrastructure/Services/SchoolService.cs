using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// سرویس مدیریت مدارس و مراکز آموزشی تحت پوشش چایلدفود
// تمام بیزینس لاجیک مربوط به مدارس و سید اولیه توسط این سرویس انجام میشه و کنترلر کاملا Dumb باقی می‌مونه
public class SchoolService : ISchoolService
{
    private readonly ApplicationDbContext _dbContext;

    public SchoolService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // دریافت لیست تمامی مدارس فعال جهت نمایش در سلکت‌باکس زیبا در فرانت‌اند
    public async Task<IReadOnlyList<SchoolDto>> GetActiveSchoolsAsync(CancellationToken cancellationToken = default)
    {
        // غیرفعال کردن رکوردهای نامعتبر قبلی که نام‌شان علامت سوال شده بود
        var invalidSchools = await _dbContext.Schools
            .Where(s => s.Name.Contains("?") && s.IsActive)
            .ToListAsync(cancellationToken);
        if (invalidSchools.Any())
        {
            foreach (var inv in invalidSchools)
            {
                inv.IsActive = false;
            }
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // اطمینان از اینکه تمامی مدارس پیش‌فرض در دیتابیس ثبت هستند
        await SeedDefaultSchoolsAsync(cancellationToken);

        var schools = await _dbContext.Schools
            .AsNoTracking()
            .Where(s => s.IsActive && !s.Name.Contains("?"))
            .OrderBy(s => s.Name)
            .Select(s => new SchoolDto
            {
                Id = s.Id,
                Name = s.Name,
                BranchCode = s.BranchCode,
                Address = s.Address,
                DefaultLunchTime = s.DefaultLunchTime,
                IsActive = s.IsActive
            })
            .ToListAsync(cancellationToken);

        return schools;
    }

    // ایجاد مدرسه جدید توسط ادمین سیستم
    public async Task<SchoolDto> CreateSchoolAsync(CreateSchoolDto dto, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("نام مدرسه یا مجتمع آموزشی الزامی است.");

        var branchCode = string.IsNullOrWhiteSpace(dto.BranchCode)
            ? "SCH-" + Random.Shared.Next(1000, 9999)
            : dto.BranchCode.Trim();

        // جلوگیری از ثبت کد شعبه تکراری
        var exists = await _dbContext.Schools.AnyAsync(s => s.BranchCode == branchCode, cancellationToken);
        if (exists)
        {
            branchCode += "-" + Random.Shared.Next(10, 99);
        }

        var school = new School
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            BranchCode = branchCode,
            Address = string.IsNullOrWhiteSpace(dto.Address) ? "تهران، منطقه آموزشی" : dto.Address.Trim(),
            DefaultLunchTime = string.IsNullOrWhiteSpace(dto.DefaultLunchTime) ? "12:30" : dto.DefaultLunchTime.Trim(),
            ContactPerson = dto.ContactPerson?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Schools.AddAsync(school, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new SchoolDto
        {
            Id = school.Id,
            Name = school.Name,
            BranchCode = school.BranchCode,
            Address = school.Address,
            DefaultLunchTime = school.DefaultLunchTime,
            IsActive = school.IsActive
        };
    }

    // درج اولیه مدارس شاخص شهر تهران در پایگاه داده
    public async Task SeedDefaultSchoolsAsync(CancellationToken cancellationToken = default)
    {
        var defaultSchools = new List<School>
        {
            new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان دخترانه فرزانگان (شعبه ۱)",
                BranchCode = "SCH-FARZ-01",
                Address = "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "مجموعه مدارس مفید (پسرانه)",
                BranchCode = "SCH-MOFID-02",
                Address = "تهران، یادگار امام، خیابان زنجان شمالی",
                DefaultLunchTime = "12:15",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "مجتمع آموزشی علامه حلی",
                BranchCode = "SCH-HELLI-01",
                Address = "تهران، خیابان کارگر شمالی، کوچه شهید فلاح‌پور",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان و پیش‌دبستانی هوشمند سرو اندیشه",
                BranchCode = "SCH-SARV-03",
                Address = "تهران، سعادت‌آباد، میدان کاج، خیابان مروارید",
                DefaultLunchTime = "12:45",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "مجتمع آموزشی نمونه البرز",
                BranchCode = "SCH-ALBORZ-01",
                Address = "تهران، خیابان انقلاب، نرسیده به پل حافظ",
                DefaultLunchTime = "12:20",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان غیردولتی رشد نو",
                BranchCode = "SCH-ROSHD-04",
                Address = "تهران، نیاوران، خیابان باهنر، کوچه مژده",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان دخترانه مهر تابان",
                BranchCode = "SCH-MEHR-02",
                Address = "تهران، پاسداران، بوستان دوم، پلاک ۲۴",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        foreach (var school in defaultSchools)
        {
            var existing = await _dbContext.Schools.FirstOrDefaultAsync(s => s.BranchCode == school.BranchCode, cancellationToken);
            if (existing is null)
            {
                await _dbContext.Schools.AddAsync(school, cancellationToken);
            }
            else if (existing.Name.Contains("?") || existing.Address.Contains("?"))
            {
                // اینجا اگر دیتای قبلی به خاطر انکودینگ کاراکتر خراب و علامت سوالی داشت، تصحیحش می‌کنیم
                existing.Name = school.Name;
                existing.Address = school.Address;
                existing.DefaultLunchTime = school.DefaultLunchTime;
                existing.IsActive = true;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
