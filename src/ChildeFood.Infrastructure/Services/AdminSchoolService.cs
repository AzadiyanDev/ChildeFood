using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// سرویس مدیریت مدارس در پنل ادمین — اینجاست که همه لاجیک‌های مربوط به مدارس زندگی می‌کنن
public class AdminSchoolService : IAdminSchoolService
{
    private readonly ApplicationDbContext _db;

    public AdminSchoolService(ApplicationDbContext db)
    {
        _db = db;
    }

    // ─── لیست همه مدارس ──────────────────────────────────────────────────────
    // برای هر مدرسه تعداد دانش‌آموز، سفارشات این ماه، و روزهای برنامه‌دار ۳۰ روز آینده رو حساب می‌کنیم
    public async Task<List<AdminSchoolListItemDto>> GetAllSchoolsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var thirtyDaysLater = today.AddDays(30);

        var schools = await _db.Schools
            .AsNoTracking()
            .Select(s => new AdminSchoolListItemDto
            {
                Id = s.Id,
                Name = s.Name,
                BranchCode = s.BranchCode,
                Address = s.Address,
                DefaultLunchTime = s.DefaultLunchTime,
                ContactPerson = s.ContactPerson,
                IsActive = s.IsActive,

                // فقط بچه‌های فعال رو حساب می‌کنیم
                StudentCount = s.Children.Count(c => c.IsActive),

                // سفارشات ماه جاری که فقط از این مدرسه هستن
                // چون SchoolOrder مستقیم به School وصل نیست، از طریق Child رد میشیم
                OrderCount = _db.SchoolOrders.Count(o =>
                    o.Child!.SchoolId == s.Id &&
                    o.ServingDate >= startOfMonth &&
                    o.ServingDate <= today),

                // تعداد روزهایی که تو ۳۰ روز آینده برنامه‌ی غذایی دارن (و تعطیل نیستن)
                ActiveMealDays = s.MealSchedules.Count(m =>
                    m.Date > today &&
                    m.Date <= thirtyDaysLater &&
                    !m.IsHoliday)
            })
            .ToListAsync();

        return schools;
    }

    // ─── دیتیل یه مدرسه ──────────────────────────────────────────────────────
    // همه اطلاعات مدرسه + لیست بچه‌ها + ۵ سفارش آخر + آمار کلی
    public async Task<AdminSchoolDetailDto?> GetSchoolDetailAsync(Guid schoolId)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var thirtyDaysLater = today.AddDays(30);

        // اول مدرسه رو می‌کشیم بیرون با همه چیزی که نیاز داریم
        var school = await _db.Schools
            .AsNoTracking()
            .Include(s => s.Children)
            .Include(s => s.MealSchedules)
            .FirstOrDefaultAsync(s => s.Id == schoolId);

        if (school is null)
            return null;

        // پنج سفارش آخر مدرسه رو جدا می‌کشیم چون نیاز به join با Child داریم
        var recentOrders = await _db.SchoolOrders
            .AsNoTracking()
            .Where(o => o.Child!.SchoolId == schoolId)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new SchoolRecentOrderDto
            {
                OrderCode = o.OrderCode,
                ChildName = o.Child!.FullName,
                ServingDate = o.ServingDate,
                FinalPayablePrice = o.FinalPayablePrice,
                StatusLabel = GetStatusLabel(o.Status)
            })
            .ToListAsync();

        // آمار کلی سفارشات (از ابتدا تا الان)
        var allOrders = await _db.SchoolOrders
            .AsNoTracking()
            .Where(o => o.Child!.SchoolId == schoolId)
            .ToListAsync();

        var dto = new AdminSchoolDetailDto
        {
            Id = school.Id,
            Name = school.Name,
            BranchCode = school.BranchCode,
            Address = school.Address,
            DefaultLunchTime = school.DefaultLunchTime,
            ContactPerson = school.ContactPerson,
            IsActive = school.IsActive,

            StudentCount = school.Children.Count(c => c.IsActive),

            // سفارشات ماه جاری
            OrderCount = allOrders.Count(o =>
                o.ServingDate.Year == today.Year &&
                o.ServingDate.Month == today.Month),

            // روزهای برنامه‌دار ۳۰ روز آینده
            ActiveMealDays = school.MealSchedules.Count(m =>
                m.Date > today &&
                m.Date <= thirtyDaysLater &&
                !m.IsHoliday),

            // همه دانش‌آموزان این مدرسه
            Students = school.Children.Select(c => new SchoolStudentDto
            {
                Id = c.Id,
                FullName = c.FullName,
                Grade = c.Grade,
                Age = c.Age,
                IsActive = c.IsActive
            }).ToList(),

            RecentOrders = recentOrders,

            // چند روز آینده (همونیه که ActiveMealDays نشون میده)
            UpcomingMealDays = school.MealSchedules.Count(m =>
                m.Date > today &&
                m.Date <= thirtyDaysLater &&
                !m.IsHoliday),

            TotalOrdersCount = allOrders.Count,
            TotalRevenue = allOrders.Sum(o => o.FinalPayablePrice)
        };

        return dto;
    }

    // ─── ساخت مدرسه جدید ─────────────────────────────────────────────────────
    // از DTO می‌سازه، ذخیره می‌کنه، و DTO نتیجه رو برمیگردونه
    public async Task<AdminSchoolListItemDto> CreateSchoolAsync(CreateSchoolDto dto)
    {
        var school = new School
        {
            Name = dto.Name,
            BranchCode = dto.BranchCode,
            Address = dto.Address,
            DefaultLunchTime = dto.DefaultLunchTime,
            ContactPerson = dto.ContactPerson,
            IsActive = true
        };

        _db.Schools.Add(school);
        await _db.SaveChangesAsync();

        // مدرسه جدید هنوز هیچ دانش‌آموز و سفارشی نداره، پس همه آمارها صفرن
        return new AdminSchoolListItemDto
        {
            Id = school.Id,
            Name = school.Name,
            BranchCode = school.BranchCode,
            Address = school.Address,
            DefaultLunchTime = school.DefaultLunchTime,
            ContactPerson = school.ContactPerson,
            IsActive = school.IsActive,
            StudentCount = 0,
            OrderCount = 0,
            ActiveMealDays = 0
        };
    }

    // ─── تغییر وضعیت فعال/غیرفعال ────────────────────────────────────────────
    // آیدی مدرسه رو می‌گیره، IsActive رو برعکس می‌کنه، و وضعیت جدید رو برمیگردونه
    public async Task<bool> ToggleSchoolStatusAsync(Guid schoolId)
    {
        var school = await _db.Schools.FindAsync(schoolId);
        if (school is null)
            throw new KeyNotFoundException($"مدرسه با آیدی {schoolId} پیدا نشد.");

        // برعکس می‌کنیم — اگه فعال بود غیرفعال میشه و برعکس
        school.IsActive = !school.IsActive;
        await _db.SaveChangesAsync();

        return school.IsActive;
    }

    // ─── هلپر: وضعیت سفارش به فارسی ─────────────────────────────────────────
    // این متد خصوصیه، فقط داخل همین کلاس ازش استفاده می‌شه
    private static string GetStatusLabel(Domain.Enums.OrderStatus status) => status switch
    {
        Domain.Enums.OrderStatus.Pending    => "در انتظار",
        Domain.Enums.OrderStatus.Paid       => "پرداخت شده",
        Domain.Enums.OrderStatus.Preparing  => "در حال آماده‌سازی",
        Domain.Enums.OrderStatus.Delivered  => "تحویل داده شده",
        Domain.Enums.OrderStatus.Cancelled  => "لغو شده",
        _                                   => "نامشخص"
    };
}
