using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// سرویس مدیریت برنامه غذایی روزانه — تمام لاجیک اینجاست، کنترلر نباید هیچی بدونه
public class AdminMealScheduleService : IAdminMealScheduleService
{
    private readonly ApplicationDbContext _db;

    // نام روزهای هفته به فارسی برای نوار تقویم
    private static readonly string[] PersianDayNames =
        ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

    public AdminMealScheduleService(ApplicationDbContext db)
    {
        _db = db;
    }

    // نوار تقویم رو آماده میکنه — ۱۵ روز قبل، امروز، ۱۵ روز بعد
    // تعداد نمایشی = تعداد غذاهای DISTINCT برای اون روز (نه تعداد ردیف‌ها * مدارس)
    public async Task<List<AdminCalendarDayDto>> GetCalendarDaysAsync(DateOnly from, int days = 31)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var to = from.AddDays(days - 1);

        // Count رو distinct by FoodItemId حساب می‌کنیم تا چند مدرسه داشتن عدد رو کثیف نکنه
        var scheduledDates = await _db.DailyMealSchedules
            .Where(s => s.Date >= from && s.Date <= to)
            .GroupBy(s => new { s.Date, s.FoodItemId })
            .Select(g => g.Key.Date)
            .ToListAsync();

        // گروه‌بندی بر اساس تاریخ برای گرفتن تعداد غذاهای یونیک هر روز
        var scheduledMap = scheduledDates
            .GroupBy(d => d)
            .ToDictionary(g => g.Key, g => g.Count());

        var result = new List<AdminCalendarDayDto>();
        for (var d = from; d <= to; d = d.AddDays(1))
        {
            result.Add(new AdminCalendarDayDto
            {
                Date = d,
                DayName = PersianDayNames[(int)d.DayOfWeek],
                DayNumber = d.Day,
                IsToday = d == today,
                IsPast = d < today,
                HasSchedule = scheduledMap.ContainsKey(d),
                ScheduledItemCount = scheduledMap.GetValueOrDefault(d, 0),
            });
        }

        return result;
    }

    // غذاهای یه روز خاص رو میاره — DISTINCT by FoodItemId
    // چون یه غذا ممکنه برای چند مدرسه ثبت شده باشه، فقط یه بار نشون میدیم
    public async Task<List<ScheduledMealItemDto>> GetDayScheduleAsync(DateOnly date, Guid? schoolId = null)
    {
        var query = _db.DailyMealSchedules
            .Include(s => s.FoodItem)
            .Where(s => s.Date == date);

        if (schoolId.HasValue)
            query = query.Where(s => s.SchoolId == schoolId.Value);

        var schedules = await query.ToListAsync();

        // Distinct by FoodItemId — اگه یه غذا برای ۳ مدرسه ثبت شده، فقط یه بار نشون بده
        // اولین scheduleId رو نگه می‌داریم برای مرجع
        return schedules
            .GroupBy(s => s.FoodItemId)
            .Select(g => g.First())
            .Select(s => new ScheduledMealItemDto
            {
                ScheduleId = s.Id,
                FoodItemId = s.FoodItemId,
                Title = s.FoodItem?.Title ?? "نامشخص",
                Emoji = s.FoodItem?.Emoji,
                Price = s.FoodItem?.Price ?? 0,
                MaxCapacity = s.MaxCapacity,
                Category = s.FoodItem?.Category.ToString() ?? "Main",
            })
            .ToList();
    }

    // همه غذاهای موجود رو برای مودال سلکت میاره
    public async Task<List<FoodItemPickerDto>> GetAllFoodItemsAsync()
    {
        return await _db.FoodItems
            .OrderBy(f => f.Category)
            .ThenBy(f => f.Title)
            .Select(f => new FoodItemPickerDto
            {
                Id = f.Id,
                Title = f.Title,
                Emoji = f.Emoji,
                Price = f.Price,
                Category = f.Category.ToString(),
                IsAvailable = f.IsAvailable,
            })
            .ToListAsync();
    }

    // غذاهای انتخابی رو به برنامه روز اضافه می‌کنه
    // منطق: اگه این FoodItemId برای این Date قبلاً ثبت شده (صرف نظر از مدرسه) — رد میشه
    public async Task AddMealsToScheduleAsync(AddMealsToScheduleDto dto)
    {
        // یه‌بار تمام FoodItemId‌هایی که برای این تاریخ قبلاً توی هر مدرسه‌ای ثبت شدن رو میکشیم
        var alreadyScheduledFoodIds = await _db.DailyMealSchedules
            .Where(s => s.Date == dto.Date)
            .Select(s => s.FoodItemId)
            .Distinct()
            .ToListAsync();

        // فقط غذاهایی که واقعاً جدیدن
        var trulyNewFoodIds = dto.FoodItemIds
            .Where(id => !alreadyScheduledFoodIds.Contains(id))
            .Distinct() // جلوگیری از دوپلیکیت توی ریکوئست خود کاربر
            .ToList();

        if (!trulyNewFoodIds.Any())
            return;

        // لیست مدارس فعال برای ثبت برنامه
        List<Guid> schoolIds;
        if (dto.SchoolId.HasValue)
        {
            schoolIds = [dto.SchoolId.Value];
        }
        else
        {
            schoolIds = await _db.Schools
                .Where(s => s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();

            // اگه هیچ مدرسه فعالی نبود، با یه مدرسه placeholder ثبت کن تا برنامه لااقل توی کلندر دیده بشه
            if (!schoolIds.Any())
            {
                var anySchool = await _db.Schools.Select(s => s.Id).FirstOrDefaultAsync();
                if (anySchool != Guid.Empty)
                    schoolIds = [anySchool];
                else
                    return;
            }
        }

        var newSchedules = new List<DailyMealSchedule>();
        foreach (var schoolId in schoolIds)
        {
            foreach (var foodId in trulyNewFoodIds)
            {
                newSchedules.Add(new DailyMealSchedule
                {
                    Date = dto.Date,
                    FoodItemId = foodId,
                    SchoolId = schoolId,
                    MaxCapacity = dto.MaxCapacity,
                    IsHoliday = false,
                });
            }
        }

        if (newSchedules.Any())
        {
            _db.DailyMealSchedules.AddRange(newSchedules);
            await _db.SaveChangesAsync();
        }
    }

    // حذف یه غذا از برنامه روز — برای تمام مدارس حذف می‌کنه (نه فقط یه مدرسه)
    // چون نمایش ما distinct بود، حذف هم باید کامل باشه
    public async Task RemoveMealFromScheduleAsync(Guid scheduleId)
    {
        // اول پیدا کن ببین این schedule مربوط به کدوم غذا و کدوم تاریخه
        var schedule = await _db.DailyMealSchedules.FindAsync(scheduleId);
        if (schedule is null)
            return;

        // حالا همه ردیف‌های مربوط به این غذا در این تاریخ رو (در تمام مدارس) پاک کن
        var allRelated = await _db.DailyMealSchedules
            .Where(s => s.Date == schedule.Date && s.FoodItemId == schedule.FoodItemId)
            .ToListAsync();

        _db.DailyMealSchedules.RemoveRange(allRelated);
        await _db.SaveChangesAsync();
    }
}
