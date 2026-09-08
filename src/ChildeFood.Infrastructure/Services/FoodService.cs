using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// تمام منطق بیزینس و کارهای اصلی غذاها اینجاست؛ از یونیت آو ورک و کانتکست برای دسترسی به دیتا استفاده می‌کنیم تا کنترلر کاملاً سبک و دام بمونه.
public class FoodService : IFoodService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ApplicationDbContext _dbContext;

    public FoodService(IUnitOfWork unitOfWork, ApplicationDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<FoodItemDto>> GetAllFoodsAsync(CancellationToken cancellationToken = default)
    {
        // اطمینان از وجود دیتای پیش‌فرض غذاها در صورت تازه بودن دیتابیس
        await SeedDefaultFoodsAndSchedulesIfEmptyAsync(cancellationToken);

        // غذاهای فعال و در دسترس رو از ریپازیتوری لود می‌کنیم
        var foods = await _unitOfWork.Foods.GetAvailableFoodsAsync(cancellationToken);

        return foods.Select(f => new FoodItemDto
        {
            Id = f.Id,
            Title = f.Title,
            Subtitle = f.Subtitle,
            Price = f.Price,
            HalfPortionPrice = f.HalfPortionPrice,
            Category = f.Category,
            BadgeText = f.BadgeText,
            BadgeType = f.BadgeType,
            Emoji = f.Emoji,
            ImageUrl = f.ImageUrl,
            Calories = f.Calories,
            Protein = f.Protein,
            Carbs = f.Carbs,
            Fat = f.Fat,
            Ingredients = f.Ingredients,
            Allergens = f.Allergens,
            IsAvailable = f.IsAvailable
        });
    }

    public async Task<FoodItemDto?> GetFoodByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id, cancellationToken);

        if (food is null)
            return null;

        return new FoodItemDto
        {
            Id = food.Id,
            Title = food.Title,
            Subtitle = food.Subtitle,
            Price = food.Price,
            HalfPortionPrice = food.HalfPortionPrice,
            Category = food.Category,
            BadgeText = food.BadgeText,
            BadgeType = food.BadgeType,
            Emoji = food.Emoji,
            ImageUrl = food.ImageUrl,
            Calories = food.Calories,
            Protein = food.Protein,
            Carbs = food.Carbs,
            Fat = food.Fat,
            Ingredients = food.Ingredients,
            Allergens = food.Allergens,
            IsAvailable = food.IsAvailable
        };
    }

    public async Task<FoodItemDto> CreateFoodAsync(CreateFoodItemDto dto, CancellationToken cancellationToken = default)
    {
        // اینجا اعتبارسنجی اولیه رو انجام می‌دیم تا دیتای خراب وارد دیتابیس نشه
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("عنوان غذا نمی‌تونه خالی باشه.");

        if (dto.Price <= 0)
            throw new ArgumentException("قیمت باید بزرگتر از صفر باشه.");

        var newFood = new FoodItem
        {
            Title = dto.Title.Trim(),
            Subtitle = dto.Subtitle?.Trim(),
            Price = dto.Price,
            HalfPortionPrice = dto.HalfPortionPrice,
            Category = dto.Category,
            BadgeText = dto.BadgeText?.Trim(),
            BadgeType = dto.BadgeType?.Trim(),
            Emoji = dto.Emoji?.Trim(),
            ImageUrl = dto.ImageUrl?.Trim(),
            Calories = dto.Calories,
            Protein = dto.Protein,
            Carbs = dto.Carbs,
            Fat = dto.Fat,
            Ingredients = dto.Ingredients?.Trim(),
            Allergens = dto.Allergens?.Trim(),
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Foods.AddAsync(newFood, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FoodItemDto
        {
            Id = newFood.Id,
            Title = newFood.Title,
            Subtitle = newFood.Subtitle,
            Price = newFood.Price,
            HalfPortionPrice = newFood.HalfPortionPrice,
            Category = newFood.Category,
            BadgeText = newFood.BadgeText,
            BadgeType = newFood.BadgeType,
            Emoji = newFood.Emoji,
            ImageUrl = newFood.ImageUrl,
            Calories = newFood.Calories,
            Protein = newFood.Protein,
            Carbs = newFood.Carbs,
            Fat = newFood.Fat,
            Ingredients = newFood.Ingredients,
            Allergens = newFood.Allergens,
            IsAvailable = newFood.IsAvailable
        };
    }

    // دریافت هوشمند محبوب‌ترین و پرسفارش‌ترین غذای منوی روزانه به عنوان پیشنهاد امروز
    public async Task<FoodRecommendationDto?> GetTodayRecommendationAsync(DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        // اطمینان از وجود داده‌های پایه در دیتابیس
        await SeedDefaultFoodsAndSchedulesIfEmptyAsync(cancellationToken);

        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3.5));

        // اول می‌گردیم ببینیم چه غذاهایی برای امروز در برنامه مدارس زمان‌بندی شدند
        var scheduledFoods = await _dbContext.DailyMealSchedules
            .AsNoTracking()
            .Include(s => s.FoodItem)
            .Where(s => s.Date == targetDate && !s.IsHoliday && s.FoodItem != null && s.FoodItem.IsAvailable)
            .Select(s => s.FoodItem!)
            .Distinct()
            .ToListAsync(cancellationToken);

        // اگر برای این تاریخ هیچ برنامه‌ای تعریف نشده بود طبق دستور کاربر باید کارت کلاً نشون داده نشه
        if (scheduledFoods.Count == 0)
        {
            return null;
        }

        var scheduledFoodIds = scheduledFoods.Select(f => f.Id).ToList();

        // تعداد دفعاتی که هر کدوم از این غذاها در کل سفارشات ثبت شدند رو حساب می‌کنیم تا محبوب‌ترینش در بیاد
        var foodOrderCounts = await _dbContext.OrderItems
            .AsNoTracking()
            .Where(oi => scheduledFoodIds.Contains(oi.FoodItemId))
            .GroupBy(oi => oi.FoodItemId)
            .Select(g => new { FoodItemId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.FoodItemId, x => x.Count, cancellationToken);

        // مرتب‌سازی بر اساس: ۱. بیشترین تعداد سفارش ۲. داشتن برچسب محبوب (popular) ۳. قیمت یا ترتیب الفبایی
        var topFood = scheduledFoods
            .OrderByDescending(f => foodOrderCounts.GetValueOrDefault(f.Id, 0))
            .ThenByDescending(f => f.BadgeType == "popular" ? 1 : 0)
            .ThenBy(f => f.Title)
            .First();

        return new FoodRecommendationDto
        {
            Id = topFood.Id,
            Title = topFood.Title,
            Subtitle = topFood.Subtitle ?? "طبخ تازه با گوشت گرم و برنج درجه یک",
            Price = topFood.Price,
            BadgeText = topFood.BadgeText ?? "محبوب بچه‌ها",
            BadgeType = topFood.BadgeType ?? "popular",
            Emoji = topFood.Emoji ?? "🍗",
            ImageUrl = topFood.ImageUrl,
            Calories = topFood.Calories,
            Protein = topFood.Protein,
            Carbs = topFood.Carbs,
            Fat = topFood.Fat,
            Ingredients = topFood.Ingredients,
            Allergens = topFood.Allergens,
            OrdersCount = foodOrderCounts.GetValueOrDefault(topFood.Id, 0)
        };
    }

    // متد کمکی برای ایجاد دیتای اولیه غذاها و برنامه هفتگی در صورت خالی بودن جدول
    private async Task SeedDefaultFoodsAndSchedulesIfEmptyAsync(CancellationToken cancellationToken)
    {
        var hasFoods = await _dbContext.FoodItems.AnyAsync(cancellationToken);
        if (hasFoods) return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3.5));

        // ابتدا مدرسه پیش‌فرضی را واکشی یا ایجاد می‌کنیم
        var school = await _dbContext.Schools.FirstOrDefaultAsync(s => s.IsActive, cancellationToken);
        if (school is null)
        {
            school = new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان دخترانه فرزانگان (شعبه ۱)",
                BranchCode = "SCH-FARZ-01",
                Address = "تهران، شهرک غرب",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await _dbContext.Schools.AddAsync(school, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // لیست غذاهای لذیذ و سالم دانش‌آموزی
        var joojeh = new FoodItem
        {
            Id = Guid.NewGuid(),
            Title = "جوجه کباب",
            Subtitle = "طبخ تازه با گوشت گرم و برنج درجه یک",
            Price = 185000,
            HalfPortionPrice = 125000,
            Category = FoodCategory.Main,
            BadgeText = "محبوب بچه‌ها",
            BadgeType = "popular",
            Emoji = "🍗",
            Calories = 540,
            Protein = 35,
            Carbs = 48,
            Fat = 14,
            Ingredients = "سینه مرغ گرم زعفرانی، برنج درجه یک ایرانی، گوجه کبابی، کره حیوانی",
            Allergens = "ندارد",
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        var macaroni = new FoodItem
        {
            Id = Guid.NewGuid(),
            Title = "ماکارونی",
            Subtitle = "با گوشت چرخ‌کرده تازه و ته‌دیگ سیب‌زمینی",
            Price = 160000,
            HalfPortionPrice = 110000,
            Category = FoodCategory.Main,
            BadgeText = "ویژه سرآشپز",
            BadgeType = "chef",
            Emoji = "🍝",
            Calories = 620,
            Protein = 26,
            Carbs = 78,
            Fat = 18,
            Ingredients = "پاستا مانا، گوشت چرخ‌کرده مخلوط، رب گوجه‌فرنگی ارگانیک، قارچ، فلفل دلمه‌ای",
            Allergens = "گلوتن",
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        var ghormeh = new FoodItem
        {
            Id = Guid.NewGuid(),
            Title = "قورمه سبزی اصیل",
            Subtitle = "با گوشت تازه گوسفندی و لوبیا قرمز ممتاز",
            Price = 195000,
            HalfPortionPrice = 135000,
            Category = FoodCategory.Main,
            BadgeText = "سنتی اصیل",
            BadgeType = "special",
            Emoji = "🥘",
            Calories = 580,
            Protein = 32,
            Carbs = 50,
            Fat = 20,
            Ingredients = "سبزی قورمه تازه، گوشت تکه‌ای گوسفندی، لوبیا چیتی، لیمو عمانی، برنج طارم",
            Allergens = "ندارد",
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.FoodItems.AddRangeAsync(new[] { joojeh, macaroni, ghormeh }, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // زمان‌بندی برای امروز و ۶ روز آینده در این مدرسه
        var schedules = new List<DailyMealSchedule>();
        for (int i = 0; i <= 6; i++)
        {
            var scheduleDate = today.AddDays(i);
            schedules.Add(new DailyMealSchedule
            {
                Id = Guid.NewGuid(),
                Date = scheduleDate,
                FoodItemId = joojeh.Id,
                SchoolId = school.Id,
                MaxCapacity = 100,
                IsHoliday = false,
                CreatedAt = DateTime.UtcNow
            });
            schedules.Add(new DailyMealSchedule
            {
                Id = Guid.NewGuid(),
                Date = scheduleDate,
                FoodItemId = macaroni.Id,
                SchoolId = school.Id,
                MaxCapacity = 100,
                IsHoliday = false,
                CreatedAt = DateTime.UtcNow
            });
            schedules.Add(new DailyMealSchedule
            {
                Id = Guid.NewGuid(),
                Date = scheduleDate,
                FoodItemId = ghormeh.Id,
                SchoolId = school.Id,
                MaxCapacity = 80,
                IsHoliday = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _dbContext.DailyMealSchedules.AddRangeAsync(schedules, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}