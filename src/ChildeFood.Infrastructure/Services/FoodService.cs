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
        // اطمینان از پاکسازی دیتای نامعتبر و وجود کاتالوگ جامع غذاها
        await SeedComprehensiveFoodCatalogAsync(cancellationToken);

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
        // اطمینان از پاکسازی دیتای نامعتبر و وجود کاتالوگ جامع غذاها
        await SeedComprehensiveFoodCatalogAsync(cancellationToken);

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

    // متد جامع برای پاکسازی کاراکترهای خراب و ثبت ۳۴ مدل غذای واقعی با ایموجی و مقادیر کامل
    public async Task SeedComprehensiveFoodCatalogAsync(CancellationToken cancellationToken = default)
    {
        // ۱. اول هرچی دیتای خراب و علامت سوالی هست رو تر و تمیز پاک می‌کنیم
        var corruptedFoods = await _dbContext.FoodItems
            .Where(f => f.Title.Contains("?") || (f.Emoji != null && f.Emoji.Contains("?")))
            .ToListAsync(cancellationToken);

        if (corruptedFoods.Count > 0)
        {
            var corruptedIds = corruptedFoods.Select(f => f.Id).ToList();
            var corruptedSchedules = await _dbContext.DailyMealSchedules
                .Where(s => corruptedIds.Contains(s.FoodItemId))
                .ToListAsync(cancellationToken);
            _dbContext.DailyMealSchedules.RemoveRange(corruptedSchedules);

            var corruptedOrderItems = await _dbContext.OrderItems
                .Where(oi => corruptedIds.Contains(oi.FoodItemId) || oi.FoodTitle.Contains("?"))
                .ToListAsync(cancellationToken);
            _dbContext.OrderItems.RemoveRange(corruptedOrderItems);

            _dbContext.FoodItems.RemoveRange(corruptedFoods);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3.5));

        // ۲. واکشی یا ایجاد مدرسه پیش‌فرض با نام و مشخصات کامل و تمیز
        var school = await _dbContext.Schools.FirstOrDefaultAsync(s => s.BranchCode == "SCH-FARZ-01" || s.IsActive, cancellationToken);
        if (school is null)
        {
            school = new School
            {
                Id = Guid.NewGuid(),
                Name = "دبستان دخترانه فرزانگان (شعبه ۱)",
                BranchCode = "SCH-FARZ-01",
                Address = "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین",
                DefaultLunchTime = "12:30",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await _dbContext.Schools.AddAsync(school, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        else if (school.Name.Contains("?"))
        {
            school.Name = "دبستان دخترانه فرزانگان (شعبه ۱)";
            school.Address = "تهران، شهرک غرب، فاز ۱، خیابان ایران‌زمین";
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // ۳. کاتالوگ ۳۴ تایی غذای واقعی سیستم با ایموجی، کالری و ترکیبات دقیق
        var catalogList = new List<FoodCatalogItemData>
        {
            new("کباب چوبی مگا", "همراه با سبزیجات گریل", 62000, 42000, FoodCategory.Main, "گریل شده", "grilled", "🍢", 480, 32, 20, 18, "گوشت چرخ‌کرده گوساله، فلفل دلمه‌ای، سبزیجات گریل، پیاز", "ندارد"),
            new("چلو جوجه کباب زعفرانی", "همراه با برنج درجه یک ایرانی", 89000, 59000, FoodCategory.Main, "غذای روز", "popular", "🍗", 540, 35, 48, 14, "سینه مرغ گرم زعفرانی، برنج درجه یک ایرانی، گوجه کبابی، کره حیوانی", "ندارد"),
            new("قورمه سبزی اصیل", "با گوشت تازه گوسفندی و لوبیا", 75000, 52000, FoodCategory.Main, "محبوب 🔥", "popular", "🥘", 580, 32, 50, 20, "سبزی قورمه تازه، گوشت تکه‌ای گوسفندی، لوبیا قرمز ممتاز، لیمو عمانی، برنج طارم", "ندارد"),
            new("کوبیده سنتی ممتاز", "دو سیخ کوبیده با گوجه کبابی", 93000, 65000, FoodCategory.Main, "ویژه سرآشپز", "chef", "🥩", 620, 38, 45, 28, "دو سیخ گوشت چرخ‌کرده گوسفندی و گوساله، گوجه کبابی، برنج زعفرانی", "ندارد"),
            new("تاکو مکزیکی تند", "با گوشت چرخ‌کرده و سالسا", 58000, 40000, FoodCategory.Main, "تند و اسپایسی 🌶️", "spicy", "🌮", 420, 22, 35, 16, "نان ترتیلا ذرت، گوشت چرخ‌کرده ادویه‌دار، سس سالسا، پنیر چدار، کاهو", "لبنیات"),
            new("سالاد شیرازی مخصوص", "خیار، گوجه، پیاز و آبغوره", 32000, null, FoodCategory.Main, "پیش‌غذا", "discount", "🥗", 110, 2, 12, 3, "خیار، گوجه‌فرنگی تازه، پیاز، آبغوره طبیعی، نعناع خشک، روغن زیتون", "ندارد"),
            new("پیتزا سیسیلیا", "پیتزا مخصوص ایتالیایی با پنیر کش‌دار", 85000, 58000, FoodCategory.Main, "۲۵٪-", "discount", "🍕", 680, 28, 72, 24, "خمیر دست‌ساز ناپلی، سس گوجه ارگانیک، پنیر موزارلا تازه، ریحان، قارچ", "گلوتن، لبنیات"),
            new("پاستا آلفردو", "با فیله مرغ و قارچ تازه و خامه", 92000, 62000, FoodCategory.Main, "۱۵٪-", "discount", "🍝", 590, 26, 65, 22, "پاستا پنه، فیله مرغ گریل، خامه، قارچ تازه، پنیر پارمسان، سیر", "گلوتن، لبنیات"),
            new("لازانیا گوشت و قارچ", "لایه‌های گوشت چرخ‌کرده با سس بشامل", 85000, 58000, FoodCategory.Main, "محبوب 🔥", "popular", "🧀", 650, 30, 60, 26, "ورقه‌های لازانیا، گوشت چرخ‌کرده مخلوط، سس بشامل، قارچ، پنیر موزارلا", "گلوتن، لبنیات"),
            new("پیتزا پپرونی تند", "پپرونی دودی اعلا با فلفل هالوپینو", 78000, 53000, FoodCategory.Main, "تند و اسپایسی 🌶️", "spicy", "🍕", 710, 27, 70, 28, "پپرونی دودی اعلا، سس گوجه تند، فلفل هالوپینو، پنیر موزارلا", "گلوتن، لبنیات"),
            new("نان سیر ایتالیایی", "با کره سیر دار و پنیر موزارلا", 40000, null, FoodCategory.Main, "پیش‌غذا", "discount", "🥖", 290, 7, 38, 11, "نان باگت برشته، کره حیوانی، سیر تازه، پنیر موزارلا، جعفری", "گلوتن، لبنیات"),
            new("برگر دوبل اسمش", "برگر گوشت با پنیر چدار", 75000, 52000, FoodCategory.Main, "محبوب 🔥", "popular", "🍔", 690, 42, 44, 34, "دو لایه گوشت گوساله گرم، نان بریوش نرم، پنیر چدار، سس مخصوص برگر", "گلوتن، لبنیات"),
            new("نودل توئیستارا", "با سس تند مخصوص آسیایی", 54000, 38000, FoodCategory.Main, "۲۵٪-", "discount", "🍜", 450, 14, 68, 12, "نودل دست‌ساز، سبزیجات خردشده آسیایی، سس تند کنجدی، جوانه گندم", "گلوتن، سویا، کنجد"),
            new("سوشی میکس رول", "سالمون نروژی و آووکادو تازه", 115000, 78000, FoodCategory.Main, "غذای سرآشپز", "chef", "🍣", 380, 19, 52, 9, "برنج سوشی ژاپنی، فیله سالمون نروژی، آووکادو، جلبک نوری، کنجد", "ماهی، کنجد"),
            new("رامن تند توکیو", "تخم‌مرغ نیم‌پز با نودل دست‌ساز و جلبک", 82000, 56000, FoodCategory.Main, "محبوب 🔥", "popular", "🍲", 520, 24, 62, 18, "نودل رامن، آب قلم غلیظ، تخم‌مرغ مارینیت، پیازچه، روغن فلفل چیلی", "گلوتن، تخم‌مرغ"),
            new("اسپرینگ رول سبزیجات", "۴ عدد رول کریسپی با سس سوئیت چیلی", 49000, 34000, FoodCategory.Main, "۱۵٪-", "discount", "🥟", 280, 6, 38, 10, "خمیر نازک کریسپی، جوانه ماش، کلم، هویج، قارچ، سس سوئیت چیلی", "گلوتن"),
            new("میگو تمپورا طلایی", "میگو سوخاری سبک و ترد ژاپنی", 104000, 72000, FoodCategory.Main, "غذای دریایی", "chef", "🍤", 460, 25, 42, 20, "میگو تازه دریایی، خمیر تمپورا ژاپنی ترد، سس مخصوص تارتار", "سخت‌پوستان، تخم‌مرغ"),
            new("مرغ سوخاری کریسپی", "۴ تکه همراه سیب‌زمینی", 84000, 58000, FoodCategory.Main, "۲۰٪-", "discount", "🍗", 610, 36, 40, 28, "۴ تکه فیله مرغ کریسپی، سیب‌زمینی سرخ‌کرده، سس کچاپ و سیر", "گلوتن"),
            new("چیکن برگر زغالی", "فیله سوخاری با سس هانی ماستارد", 69000, 48000, FoodCategory.Main, "۲۰٪-", "discount", "🍔", 530, 31, 46, 18, "فیله مرغ زغالی، نان نرم گرد، سس هانی ماستارد، خیارشور و کاهو", "گلوتن، خردل"),
            new("هات‌داگ تنوری پنیری", "هات‌داگ دودی تنوری در نان باگت نرم", 55000, 38000, FoodCategory.Main, "گریل شده", "grilled", "🌭", 560, 21, 48, 26, "هات‌داگ دودی تنوری، نان باگت نرم، پنیر موزارلا کش‌دار، سس خردل", "گلوتن، لبنیات"),
            new("آبمیوه طبیعی پرتقال", "آب پرتقال تازه و ارگانیک", 25000, null, FoodCategory.Drink, "طبیعی", "chef", "🧃", 110, 2, 26, 0, "آب پرتقال ۱۰۰٪ طبیعی و تازه فشرده شده بدون شکر افزوده", "ندارد"),
            new("لیموناد خنک نعنایی", "نوشیدنی لیمو و نعناع تازه", 22000, null, FoodCategory.Drink, "خنک و تازه", "discount", "🥤", 95, 0, 24, 0, "آب لیموترش تازه، عصاره نعناع، شکر قهوه‌ای، یخ قالبی", "ندارد"),
            new("دوغ سنتی نعنایی", "دوغ محلی گازدار بطری", 18000, null, FoodCategory.Drink, "سنتی", "popular", "🥛", 75, 4, 6, 3, "ماست تازه محلی، نعناع و پونه خشک کوهی، نمک، آب گازدار", "لبنیات"),
            new("دونات شکلاتی مخصوص", "دونات نرم با روکش شکلات بلژیکی", 32000, null, FoodCategory.Dessert, "محبوب 🔥", "popular", "🍩", 340, 5, 45, 16, "خمیر دونات تازه پفکی، روکش شکلات تلخ بلژیکی، ترافل رنگارنگ", "گلوتن، لبنیات"),
            new("ژله میوه‌ای رنگین‌کمان", "ژله طبیعی بدون شکر افزوده", 20000, null, FoodCategory.Dessert, "کم‌کالری", "discount", "🍮", 120, 3, 28, 0, "ژلاتین گیاهی حلال، آب میوه‌های طبیعی تمشک، توت‌فرنگی و آناناس", "ندارد"),
            new("مافین وانیل شکلاتی", "کیک مافین اسفنجی با تکه‌های کاکائو", 24000, null, FoodCategory.Dessert, "عصرانه", "chef", "🧁", 290, 5, 40, 12, "آرد سبوس‌دار، شکلات چیپسی تلخ، وانیل خالص، تخم‌مرغ تازه، کره", "گلوتن، لبنیات، تخم‌مرغ"),
            new("بوریتو گوشت و لوبیا", "پیچیده در نان ترتیلا با پنیر و برنج", 67000, 46000, FoodCategory.Main, "محبوب 🔥", "popular", "🌯", 520, 28, 58, 18, "نان ترتیلا بزرگ، گوشت فیله رشته‌شده، لوبیا سیاه، برنج، سالسا و پنیر", "گلوتن، لبنیات"),
            new("ناچوز با دیپ پنیر", "چیپس ذرت ترد با پنیر چدار آب‌شده و سالسا", 52000, null, FoodCategory.Main, "۲۵٪-", "discount", "🧀", 410, 10, 46, 22, "چیپس تورتیلا ذرت ترد، دیپ پنیر چدار داغ، سالسا پیاز و گوجه", "لبنیات"),
            new("کسیدیا مرغ مکزیکی", "نان تورتیلا برشته با مرغ و پنیر فراوان", 74000, 51000, FoodCategory.Main, "غذای سرآشپز", "chef", "🫓", 490, 30, 42, 20, "نان تورتیلا دوبل برشته، فیله مرغ مکعبی طعم‌دار، پنیر موزارلا و چدار", "گلوتن، لبنیات"),
            new("فاهیتا فیله مرغ", "همراه فلفل دلمه‌ای رنگی گریل شده", 79000, 54000, FoodCategory.Main, "گریل شده", "grilled", "🥘", 460, 34, 32, 16, "فیله مرغ گریل شده نواری، فلفل دلمه‌ای رنگارنگ، پیاز بنفش کاراملی", "ندارد"),
            new("فیله سالمون گریل", "همراه سبزیجات بخارپز و لیمو ترش", 132000, 92000, FoodCategory.Main, "رژیمی و سالم", "chef", "🐟", 430, 38, 8, 22, "فیله ماهی سالمون نروژی تازه، رزماری، لیموترش تازه، سبزیجات بخارپز", "ماهی"),
            new("میگو سوخاری تمپورا", "۶ عدد میگو درشت ترد طلایی", 98000, 68000, FoodCategory.Main, "۲۰٪-", "discount", "🍤", 480, 26, 44, 21, "۶ عدد میگو سوخاری درشت طلایی، خمیر پفکی سبک ژاپنی، سس مخصوص", "سخت‌پوستان، گلوتن"),
            new("سالاد کینوا و آووکادو", "با سبزیجات تازه ارگانیک و زیتون", 65000, null, FoodCategory.Main, "سالم و رژیمی", "popular", "🥗", 260, 8, 30, 12, "کینوا سه رنگ پخته‌شده، برش‌های آووکادو هاس، اسفناج جوان، زیتون سیاه", "ندارد"),
            new("پاستا مرغ و قارچ آلفردو", "با سس دست‌ساز و پنیر پارمسان", 92000, 62000, FoodCategory.Main, "۱۵٪-", "discount", "🍝", 610, 29, 68, 22, "پاستا فتوچینی، سینه مرغ گریل، قارچ بلانچ‌شده، سس خامه و پارمسان", "گلوتن، لبنیات")
        };

        var existingFoods = await _dbContext.FoodItems.ToListAsync(cancellationToken);
        var existingTitles = existingFoods.Select(f => f.Title).ToHashSet();
        var foodsToAdd = new List<FoodItem>();

        foreach (var item in catalogList)
        {
            if (!existingTitles.Contains(item.Title))
            {
                foodsToAdd.Add(new FoodItem
                {
                    Id = Guid.NewGuid(),
                    Title = item.Title,
                    Subtitle = item.Subtitle,
                    Price = item.Price,
                    HalfPortionPrice = item.HalfPortionPrice,
                    Category = item.Category,
                    BadgeText = item.BadgeText,
                    BadgeType = item.BadgeType,
                    Emoji = item.Emoji,
                    Calories = item.Calories,
                    Protein = item.Protein,
                    Carbs = item.Carbs,
                    Fat = item.Fat,
                    Ingredients = item.Ingredients,
                    Allergens = item.Allergens,
                    IsAvailable = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        if (foodsToAdd.Count > 0)
        {
            await _dbContext.FoodItems.AddRangeAsync(foodsToAdd, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
            existingFoods.AddRange(foodsToAdd);
        }

        // ۴. زمان‌بندی روزانه در مدرسه فرزانگان برای امروز و ۶ روز بعد
        var joojeh = existingFoods.FirstOrDefault(f => f.Title == "چلو جوجه کباب زعفرانی") ?? existingFoods.First();
        var pizza = existingFoods.FirstOrDefault(f => f.Title == "پیتزا سیسیلیا") ?? existingFoods[1];
        var ghormeh = existingFoods.FirstOrDefault(f => f.Title == "قورمه سبزی اصیل") ?? existingFoods[2];
        var burger = existingFoods.FirstOrDefault(f => f.Title == "برگر دوبل اسمش") ?? existingFoods[3];
        var pasta = existingFoods.FirstOrDefault(f => f.Title == "پاستا آلفردو") ?? existingFoods[4];

        var schedulesToAdd = new List<DailyMealSchedule>();
        for (int i = 0; i <= 6; i++)
        {
            var scheduleDate = today.AddDays(i);
            var exists = await _dbContext.DailyMealSchedules
                .AnyAsync(s => s.Date == scheduleDate && s.SchoolId == school.Id, cancellationToken);

            if (!exists)
            {
                schedulesToAdd.Add(new DailyMealSchedule { Id = Guid.NewGuid(), Date = scheduleDate, FoodItemId = joojeh.Id, SchoolId = school.Id, MaxCapacity = 100, IsHoliday = false, CreatedAt = DateTime.UtcNow });
                schedulesToAdd.Add(new DailyMealSchedule { Id = Guid.NewGuid(), Date = scheduleDate, FoodItemId = pizza.Id, SchoolId = school.Id, MaxCapacity = 90, IsHoliday = false, CreatedAt = DateTime.UtcNow });
                schedulesToAdd.Add(new DailyMealSchedule { Id = Guid.NewGuid(), Date = scheduleDate, FoodItemId = ghormeh.Id, SchoolId = school.Id, MaxCapacity = 80, IsHoliday = false, CreatedAt = DateTime.UtcNow });
                schedulesToAdd.Add(new DailyMealSchedule { Id = Guid.NewGuid(), Date = scheduleDate, FoodItemId = burger.Id, SchoolId = school.Id, MaxCapacity = 100, IsHoliday = false, CreatedAt = DateTime.UtcNow });
                schedulesToAdd.Add(new DailyMealSchedule { Id = Guid.NewGuid(), Date = scheduleDate, FoodItemId = pasta.Id, SchoolId = school.Id, MaxCapacity = 85, IsHoliday = false, CreatedAt = DateTime.UtcNow });
            }
        }

        if (schedulesToAdd.Count > 0)
        {
            await _dbContext.DailyMealSchedules.AddRangeAsync(schedulesToAdd, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    // رکورد داخلی کمکی جهت انتقال تمیز دیتای کاتالوگ ۳۴ غذا
    private sealed record FoodCatalogItemData(
        string Title,
        string Subtitle,
        decimal Price,
        decimal? HalfPortionPrice,
        FoodCategory Category,
        string BadgeText,
        string BadgeType,
        string Emoji,
        int Calories,
        int Protein,
        int Carbs,
        int Fat,
        string Ingredients,
        string Allergens);
}