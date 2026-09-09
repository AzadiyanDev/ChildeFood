using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChildeFood.Infrastructure.Services;

// سرویس بیزینس مدیریت والدین و دانش‌آموزان در پنل ادمین؛
// تمام کارهای مربوط به واکشی لیست اولیا، وضعیت اکانت‌ها، جزئیات بچه‌ها و سفارش‌ها اینجاست
public class AdminParentService : IAdminParentService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AdminParentService> _logger;

    public AdminParentService(ApplicationDbContext db, ILogger<AdminParentService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ─── دریافت لیست کلیه والدین ─────────────────────────────────────────────
    // این متد برای جدول اصلی صفحه دانش‌آموزان و والدین اطلاعات سبک و ضروری رو برمی‌گردونه
    public async Task<List<AdminParentListItemDto>> GetAllParentsAsync()
    {
        _logger.LogInformation("در حال واکشی لیست اولیا و سرپرستان برای پنل ادمین");

        // پاکسازی رکوردهایی که به دلیل انکودینگ قدیمی علامت سوال شده بودند
        await CleanupCorruptedQuestionMarkDataAsync();

        // چک می‌کنیم اگه تعداد والدین کمه، چند تا دیتای تمیز و واقعی سید کنیم تا داشبورد خالی نمونه
        await EnsureSeedParentsAndStudentsAsync();

        var now = DateTimeOffset.UtcNow;

        // اول همه یوزرها رو لود می‌کنیم تا بتونیم متد SanitizeText سی‌شارپ رو روشون اعمال کنیم و کوئری SQL گیر نده
        var rawParents = await _db.Users
            .AsNoTracking()
            .Where(u => u.RoleTitle != "Admin" && (u.Children.Any() || u.RoleTitle == "پدر" || u.RoleTitle == "مادر" || u.RoleTitle == "سرپرست" || u.RoleTitle == "Parent"))
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.PhoneNumber,
                u.RoleTitle,
                u.NationalId,
                u.AvatarUrl,
                u.LockoutEnd,
                ChildrenCount = u.Children.Count,
                ChildrenNames = u.Children.Select(c => c.FullName).ToList(),
                WalletBalance = u.Wallet != null ? u.Wallet.Balance : 0,
                TotalOrdersCount = u.Orders.Count,
                u.CreatedAt
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var parents = rawParents.Select(u => new AdminParentListItemDto
        {
            Id = u.Id,
            FullName = SanitizeText(u.FullName, "والد گرامی"),
            PhoneNumber = u.PhoneNumber ?? string.Empty,
            RoleTitle = SanitizeText(u.RoleTitle, "سرپرست"),
            NationalId = SanitizeNullableText(u.NationalId),
            AvatarUrl = SanitizeNullableText(u.AvatarUrl),
            IsActive = u.LockoutEnd == null || u.LockoutEnd <= now,
            ChildrenCount = u.ChildrenCount,
            ChildrenNames = u.ChildrenNames.Select(cn => SanitizeText(cn, "فرزند")).ToList(),
            WalletBalance = u.WalletBalance,
            TotalOrdersCount = u.TotalOrdersCount,
            CreatedAt = u.CreatedAt
        }).ToList();

        return parents;
    }

    // ─── دریافت جزئیات کامل والد و فرزندان ──────────────────────────────────────
    // وقتی روی دکمه «جزئیات» کلیک میشه، تمام مشخصات والد، مدارک، بچه‌ها و سفارش‌های اخیر لود میشه
    public async Task<AdminParentDetailDto?> GetParentDetailAsync(Guid parentId)
    {
        _logger.LogInformation("واکشی جزئیات کامل والد با شناسه {ParentId}", parentId);

        var now = DateTimeOffset.UtcNow;

        var parent = await _db.Users
            .AsNoTracking()
            .Include(u => u.Wallet)
            .Include(u => u.Children)
                .ThenInclude(c => c.School)
            .Include(u => u.Orders)
                .ThenInclude(o => o.Child)
            .FirstOrDefaultAsync(u => u.Id == parentId);

        if (parent == null)
            return null;

        var totalSpent = parent.Orders.Sum(o => o.FinalPayablePrice);

        var detail = new AdminParentDetailDto
        {
            Id = parent.Id,
            FullName = SanitizeText(parent.FullName, "والد گرامی"),
            PhoneNumber = parent.PhoneNumber ?? string.Empty,
            RoleTitle = SanitizeText(parent.RoleTitle, "سرپرست"),
            NationalId = SanitizeNullableText(parent.NationalId),
            AvatarUrl = SanitizeNullableText(parent.AvatarUrl),
            IsActive = parent.LockoutEnd == null || parent.LockoutEnd <= now,
            ChildrenCount = parent.Children.Count,
            ChildrenNames = parent.Children.Select(c => SanitizeText(c.FullName, "فرزند")).ToList(),
            WalletBalance = parent.Wallet?.Balance ?? 0,
            TotalOrdersCount = parent.Orders.Count,
            CreatedAt = parent.CreatedAt,
            Address = SanitizeNullableText(parent.Address),
            IsSmsNotificationActive = parent.IsSmsNotificationActive,
            TotalSpent = totalSpent,

            // مشخصات کامل تک تک فرزندان با مدرسه، آلرژی‌ها و هزینه‌ها
            Children = parent.Children.Select(c => new AdminChildDetailDto
            {
                Id = c.Id,
                FullName = SanitizeText(c.FullName, "دانش‌آموز"),
                Age = c.Age,
                Grade = SanitizeText(c.Grade, "دبستان"),
                SchoolName = SanitizeText(c.School?.Name, "مدرسه طرف قرارداد"),
                SchoolBranch = SanitizeText(c.School?.BranchCode, "-"),
                AvatarUrl = SanitizeNullableText(c.AvatarUrl),
                DietaryNotes = SanitizeNullableText(c.DietaryNotes),
                FavoriteFood = SanitizeNullableText(c.FavoriteFood),
                IsActive = c.IsActive,
                // تعداد و مبلغ سفارش‌های همین فرزند
                OrdersCount = parent.Orders.Count(o => o.ChildId == c.Id),
                TotalSpent = parent.Orders.Where(o => o.ChildId == c.Id).Sum(o => o.FinalPayablePrice)
            }).ToList(),

            // آخرین ۵ سفارش ثبت شده برای بچه‌های این والد
            RecentOrders = parent.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(o => new ParentRecentOrderDto
                {
                    OrderCode = o.OrderCode,
                    ChildName = SanitizeText(o.Child?.FullName, "دانش‌آموز"),
                    ServingDate = o.ServingDate,
                    DeliveryTime = o.DeliveryTime,
                    FinalPayablePrice = o.FinalPayablePrice,
                    StatusLabel = o.Status switch
                    {
                        OrderStatus.Delivered => "تحویل داده شده",
                        OrderStatus.Preparing => "در حال پخت و بسته‌بندی",
                        OrderStatus.Paid => "پرداخت شده",
                        OrderStatus.Cancelled => "لغو شده",
                        _ => "در صف بررسی"
                    }
                }).ToList()
        };

        return detail;
    }

    // ─── تغییر وضعیت فعال/غیرفعال والد ─────────────────────────────────────────
    // به جای حذف فیزیکی والد، اکانتش رو قفل یا آزاد می‌کنیم تا سابقه‌ها سالم بمونن
    public async Task<bool> ToggleParentStatusAsync(Guid parentId)
    {
        var parent = await _db.Users.FirstOrDefaultAsync(u => u.Id == parentId);
        if (parent == null)
            throw new KeyNotFoundException("والد مورد نظر در سامانه پیدا نشد.");

        var now = DateTimeOffset.UtcNow;
        bool isCurrentlyActive = parent.LockoutEnd == null || parent.LockoutEnd <= now;

        if (isCurrentlyActive)
        {
            // کاربر رو به مدت ۱۰۰ سال لاک می‌کنیم تا نتونه لاگین کنه
            parent.LockoutEnd = now.AddYears(100);
        }
        else
        {
            // آزاد کردن اکانت کاربر
            parent.LockoutEnd = null;
        }

        await _db.SaveChangesAsync();
        return parent.LockoutEnd == null || parent.LockoutEnd <= now;
    }

    // ─── تغییر وضعیت فعال/غیرفعال دانش‌آموز ─────────────────────────────────────
    // والد می‌تونه سفارش برای بچه غیرفعال نذاره، یا ادمین موقتاً غیرفعالش کنه
    public async Task<bool> ToggleChildStatusAsync(Guid childId)
    {
        var child = await _db.Children.FirstOrDefaultAsync(c => c.Id == childId);
        if (child == null)
            throw new KeyNotFoundException("دانش‌آموز مورد نظر پیدا نشد.");

        child.IsActive = !child.IsActive;
        await _db.SaveChangesAsync();
        return child.IsActive;
    }

    // ─── سید کردن داده‌های اولیه اولیا و دانش‌آموزان ──────────────────────────────
    // این متد بررسی می‌کنه اگر در دیتابیس داده‌های والد کمه، ۶ والد با فرزندان، والت و سفارش‌ها بسازه
    public async Task EnsureSeedParentsAndStudentsAsync()
    {
        var existingParentsCount = await _db.Users
            .CountAsync(u => u.Children.Any() || u.RoleTitle == "پدر" || u.RoleTitle == "مادر" || u.RoleTitle == "سرپرست");

        if (existingParentsCount >= 5)
            return; // قبلاً دیتای کافی داریم، نیازی به سید نیست

        var schools = await _db.Schools.ToListAsync();
        if (!schools.Any())
            return; // اگر مدرسه‌ای نیست نمیشه بچه بهش وصل کرد

        var s1 = schools[0];
        var s2 = schools.Count > 1 ? schools[1] : s1;
        var s3 = schools.Count > 2 ? schools[2] : s1;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // والد ۱: خانم مریم کاظمی با ۲ فرزند
        var parent1 = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "09123456781",
            PhoneNumber = "09123456781",
            FullName = "مریم کاظمی",
            RoleTitle = "مادر",
            NationalId = "0071234567",
            Address = "تهران، شهرک غرب، بلوار پاکنژاد، خیابان هرمزان",
            CreatedAt = DateTime.UtcNow.AddMonths(-4),
            IsSmsNotificationActive = true
        };
        var child1_1 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent1.Id,
            SchoolId = s1.Id,
            FullName = "پرهام کاظمی",
            Grade = "چهارم ابتدایی",
            Age = 10,
            DietaryNotes = "حساسیت خفیف به لبنیات پرچرب و فاقد گلوتن",
            FavoriteFood = "چلو جوجه‌کباب بدون استخوان",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };
        var child1_2 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent1.Id,
            SchoolId = s2.Id,
            FullName = "درسا کاظمی",
            Grade = "پیش‌دبستانی",
            Age = 6,
            DietaryNotes = "بدون حساسیت دارویی یا غذایی",
            FavoriteFood = "ماکارونی فرمی با پنیر",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };
        var wallet1 = new Wallet
        {
            Id = Guid.NewGuid(),
            ParentId = parent1.Id,
            Balance = 650000,
            VirtualCardNumber = "6037-9911-2233-4401",
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        // والد ۲: آقای رضا صادقی با ۱ فرزند
        var parent2 = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "09129876543",
            PhoneNumber = "09129876543",
            FullName = "رضا صادقی",
            RoleTitle = "پدر",
            NationalId = "0019876543",
            Address = "تهران، سعادت‌آباد، میدان کاج، خ سرو غربی",
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            IsSmsNotificationActive = true
        };
        var child2_1 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent2.Id,
            SchoolId = s2.Id,
            FullName = "آرمین صادقی",
            Grade = "ششم دبستان",
            Age = 12,
            DietaryNotes = "آلرژی شدید به بادام‌زمینی و کنجد",
            FavoriteFood = "چلو کباب کوبیده زعفرانی",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };
        var wallet2 = new Wallet
        {
            Id = Guid.NewGuid(),
            ParentId = parent2.Id,
            Balance = 1200000,
            VirtualCardNumber = "6037-9911-2233-4402",
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };

        // والد ۳: خانم فاطمه حسینی با ۲ فرزند
        var parent3 = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "09192223344",
            PhoneNumber = "09192223344",
            FullName = "فاطمه حسینی",
            RoleTitle = "مادر",
            NationalId = "0065432109",
            Address = "تهران، ولنجک، خیابان سیزدهم",
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            IsSmsNotificationActive = true
        };
        var child3_1 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent3.Id,
            SchoolId = s3.Id,
            FullName = "مهسا حسینی",
            Grade = "دوم ابتدایی",
            Age = 8,
            DietaryNotes = "رژیم غذایی کم‌نمک به توصیه پزشک",
            FavoriteFood = "عدس‌پلو مجلسی با کشمش",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };
        var child3_2 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent3.Id,
            SchoolId = s3.Id,
            FullName = "بردیا حسینی",
            Grade = "پنجم ابتدایی",
            Age = 11,
            DietaryNotes = "بدون حساسیت",
            FavoriteFood = "شنیسل مرغ سوخاری خانگی",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };
        var wallet3 = new Wallet
        {
            Id = Guid.NewGuid(),
            ParentId = parent3.Id,
            Balance = 320000,
            VirtualCardNumber = "6037-9911-2233-4403",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        // والد ۴: آقای محمد احمدی با ۱ فرزند
        var parent4 = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "09351112233",
            PhoneNumber = "09351112233",
            FullName = "محمد احمدی",
            RoleTitle = "پدر",
            NationalId = "0056789012",
            Address = "تهران، نیاوران، خیابان باهنر",
            CreatedAt = DateTime.UtcNow.AddMonths(-5),
            IsSmsNotificationActive = false
        };
        var child4_1 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent4.Id,
            SchoolId = s1.Id,
            FullName = "سپهر احمدی",
            Grade = "اول دبستان",
            Age = 7,
            DietaryNotes = "حساسیت به توت‌فرنگی و رنگ‌های خوراکی مصنوعی",
            FavoriteFood = "استانبولی پلو با ماست چکیده",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-5)
        };
        var wallet4 = new Wallet
        {
            Id = Guid.NewGuid(),
            ParentId = parent4.Id,
            Balance = 85000,
            VirtualCardNumber = "6037-9911-2233-4404",
            CreatedAt = DateTime.UtcNow.AddMonths(-5)
        };

        // والد ۵: خانم زهرا میرزایی با ۱ فرزند
        var parent5 = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = "09187776655",
            PhoneNumber = "09187776655",
            FullName = "زهرا میرزایی",
            RoleTitle = "مادر",
            NationalId = "0089012345",
            Address = "تهران، پاسداران، بوستان دوم",
            CreatedAt = DateTime.UtcNow.AddMonths(-1),
            IsSmsNotificationActive = true
        };
        var child5_1 = new Child
        {
            Id = Guid.NewGuid(),
            ParentId = parent5.Id,
            SchoolId = s2.Id,
            FullName = "سارینا میرزایی",
            Grade = "سوم دبستان",
            Age = 9,
            DietaryNotes = "فاقد ادویه تند و فلفل سیاه",
            FavoriteFood = "قورمه‌سبزی جاافتاده با کته زعفرانی",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };
        var wallet5 = new Wallet
        {
            Id = Guid.NewGuid(),
            ParentId = parent5.Id,
            Balance = 410000,
            VirtualCardNumber = "6037-9911-2233-4405",
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        await _db.Users.AddRangeAsync(new[] { parent1, parent2, parent3, parent4, parent5 });
        await _db.Children.AddRangeAsync(new[] { child1_1, child1_2, child2_1, child3_1, child3_2, child4_1, child5_1 });
        await _db.Wallets.AddRangeAsync(new[] { wallet1, wallet2, wallet3, wallet4, wallet5 });

        // ثبت چند سفارش نمونه برای هر والد و فرزند جهت نمایش در دیتیل
        var sampleOrders = new List<SchoolOrder>
        {
            new()
            {
                Id = Guid.NewGuid(),
                OrderCode = "ORD-14030616-11",
                ParentId = parent1.Id,
                ChildId = child1_1.Id,
                ServingDate = today,
                DeliveryTime = "12:30",
                TotalRawPrice = 94000,
                FinalPayablePrice = 94000,
                Status = OrderStatus.Delivered,
                PaymentMethod = PaymentMethod.Wallet,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            },
            new()
            {
                Id = Guid.NewGuid(),
                OrderCode = "ORD-14030616-12",
                ParentId = parent1.Id,
                ChildId = child1_2.Id,
                ServingDate = today,
                DeliveryTime = "12:15",
                TotalRawPrice = 72000,
                FinalPayablePrice = 72000,
                Status = OrderStatus.Preparing,
                PaymentMethod = PaymentMethod.Wallet,
                CreatedAt = DateTime.UtcNow.AddHours(-3)
            },
            new()
            {
                Id = Guid.NewGuid(),
                OrderCode = "ORD-14030615-21",
                ParentId = parent2.Id,
                ChildId = child2_1.Id,
                ServingDate = today.AddDays(-1),
                DeliveryTime = "12:30",
                TotalRawPrice = 98000,
                FinalPayablePrice = 98000,
                Status = OrderStatus.Delivered,
                PaymentMethod = PaymentMethod.Wallet,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new()
            {
                Id = Guid.NewGuid(),
                OrderCode = "ORD-14030616-31",
                ParentId = parent3.Id,
                ChildId = child3_1.Id,
                ServingDate = today,
                DeliveryTime = "12:30",
                TotalRawPrice = 68000,
                FinalPayablePrice = 68000,
                Status = OrderStatus.Paid,
                PaymentMethod = PaymentMethod.Wallet,
                CreatedAt = DateTime.UtcNow.AddHours(-5)
            },
            new()
            {
                Id = Guid.NewGuid(),
                OrderCode = "ORD-14030616-41",
                ParentId = parent4.Id,
                ChildId = child4_1.Id,
                ServingDate = today,
                DeliveryTime = "12:30",
                TotalRawPrice = 75000,
                FinalPayablePrice = 75000,
                Status = OrderStatus.Delivered,
                PaymentMethod = PaymentMethod.Wallet,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            }
        };

        await _db.SchoolOrders.AddRangeAsync(sampleOrders);
        await _db.SaveChangesAsync();

        _logger.LogInformation("سیدینگ ۵ والد و فرزندان با موفقیت در دیتابیس ثبت شد.");
    }

    // ─── پاکسازی رکوردهایی با علامت‌های سوال ناشی از انکودینگ نادرست در گذشته ──────
    public async Task CleanupCorruptedQuestionMarkDataAsync()
    {
        try
        {
            // ۱. بررسی و اصلاح رکوردهای کاربران
            var corruptedUsers = await _db.Users
                .Where(u => (u.FullName != null && u.FullName.Contains("?")) ||
                            (u.RoleTitle != null && u.RoleTitle.Contains("?")) ||
                            (u.Address != null && u.Address.Contains("?")))
                .ToListAsync();

            foreach (var u in corruptedUsers)
            {
                if (u.PhoneNumber == "09127778899")
                {
                    u.FullName = "سیده مونا حسینی موسوی";
                    u.RoleTitle = "مادر";
                    u.Address = "تهران، یوسف‌آباد، خیابان ابن‌سینا، پلاک ۴۲";
                    u.NationalId = "0078912345";
                }
                else if (u.PhoneNumber == "09181112233")
                {
                    u.FullName = "کامران بهرامی";
                    u.RoleTitle = "پدر";
                    u.Address = "تهران، سعادت‌آباد، علامه شمالی، خیابان هجدهم";
                    u.NationalId = "0012345678";
                }
                else if (u.PhoneNumber == "09371234567")
                {
                    u.FullName = "سمیرا قنبری";
                    u.RoleTitle = "مادر (سرپرست خانواده)";
                    u.Address = "تهران، ستارخان، خیابان خسرو شمالی";
                    u.NationalId = "0019283746";
                }
                else
                {
                    if (u.FullName != null && u.FullName.Contains("?"))
                        u.FullName = "والد گرامی";
                    if (u.RoleTitle != null && u.RoleTitle.Contains("?"))
                        u.RoleTitle = "سرپرست";
                    if (u.Address != null && u.Address.Contains("?"))
                        u.Address = null;
                }
            }

            // همچنین والدینی که نام پیش‌فرض "والد گرامی" داشتند را نام‌های واقعی و زیبا می‌دهیم
            var genericParents = await _db.Users
                .Where(u => u.FullName == "والد گرامی" && (u.PhoneNumber == "09359876543" || u.PhoneNumber == "09121112233"))
                .ToListAsync();

            foreach (var gp in genericParents)
            {
                if (gp.PhoneNumber == "09359876543")
                {
                    gp.FullName = "امیرحسین رضایی";
                    gp.RoleTitle = "پدر";
                    gp.NationalId = "0045678901";
                }
                else if (gp.PhoneNumber == "09121112233")
                {
                    gp.FullName = "شیدا رستمی";
                    gp.RoleTitle = "مادر";
                    gp.NationalId = "0032145678";
                }
            }

            // ۲. بررسی و اصلاح رکوردهای فرزندان
            var corruptedChildren = await _db.Children
                .Where(c => (c.FullName != null && c.FullName.Contains("?")) ||
                            (c.Grade != null && c.Grade.Contains("?")) ||
                            (c.DietaryNotes != null && c.DietaryNotes.Contains("?")) ||
                            (c.FavoriteFood != null && c.FavoriteFood.Contains("?")))
                .ToListAsync();

            foreach (var c in corruptedChildren)
            {
                if (c.ParentId == Guid.Parse("2CD0047E-0587-47B6-92E5-78DD380836C8") || c.Id == Guid.Parse("CCA9366A-3CBB-4F32-82B2-D5D40F5F8A88"))
                {
                    c.FullName = "یاسمن کمالی";
                    c.Grade = "چهارم دبستان";
                    c.DietaryNotes = "حساسیت به بادام و مغزیجات درختی";
                    c.FavoriteFood = "زرشک‌پلو با مرغ ویژه";
                }
                else if (c.ParentId == Guid.Parse("9296F167-5F24-44CE-9C14-DF1F3662B92A") || c.Id == Guid.Parse("DCB987A9-E5AE-4715-ADDD-38F6D8C53D1B"))
                {
                    c.FullName = "کیارش بهرامی";
                    c.Grade = "ششم دبستان";
                    c.DietaryNotes = "بدون حساسیت غذایی یا پرهیز دارویی";
                    c.FavoriteFood = "چلو کباب کوبیده زعفرانی";
                }
                else if (c.ParentId == Guid.Parse("1F30D72A-018E-4DF8-AB95-2376D1C1C809") || c.Id == Guid.Parse("A27B53A5-AC4C-4889-9ED8-B2CEDB12906D"))
                {
                    c.FullName = "نیما قنبری";
                    c.Grade = "سوم دبستان";
                    c.DietaryNotes = "رژیم غذایی کم‌چرب و بدون سس مایونز";
                    c.FavoriteFood = "خورش قیمه بادمجان";
                }
                else
                {
                    if (c.FullName != null && c.FullName.Contains("?"))
                        c.FullName = "دانش‌آموز";
                    if (c.Grade != null && c.Grade.Contains("?"))
                        c.Grade = "دبستان";
                    if (c.DietaryNotes != null && c.DietaryNotes.Contains("?"))
                        c.DietaryNotes = null;
                    if (c.FavoriteFood != null && c.FavoriteFood.Contains("?"))
                        c.FavoriteFood = null;
                }
            }

            // ۳. بررسی و اصلاح مدارس
            var corruptedSchools = await _db.Schools
                .Where(s => (s.Name != null && s.Name.Contains("?")) ||
                            (s.Address != null && s.Address.Contains("?")))
                .ToListAsync();

            foreach (var s in corruptedSchools)
            {
                if (s.BranchCode == "SCH-582" || s.Id == Guid.Parse("56B4FB02-2C52-4305-9111-7BCD91B1B1C0"))
                {
                    s.Name = "مجتمع آموزشی رشد نو";
                    s.Address = "تهران، شهرک غرب، فاز ۲، بلوار هرمزان";
                }
                else if (s.BranchCode == "SCH-177" || s.Id == Guid.Parse("279DA82E-5C06-40DF-834D-DAA7251EA726"))
                {
                    s.Name = "دبستان غیردولتی خاتم";
                    s.Address = "تهران، میدان ونک، خیابان ملاصدرا";
                }
                else
                {
                    if (s.Name != null && s.Name.Contains("?"))
                        s.Name = "مدرسه طرف قرارداد چایلد فود";
                }
            }

            if (corruptedUsers.Any() || genericParents.Any() || corruptedChildren.Any() || corruptedSchools.Any())
            {
                await _db.SaveChangesAsync();
                _logger.LogInformation("داده‌های علامت سوالی در دیتابیس با موفقیت شناسایی و به نام‌های فارسی معتبر تبدیل شدند.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطا در بررسی یا پاکسازی داده‌های علامت سوالی در دیتابیس");
        }
    }

    // ─── اعتبارسنجی و جایگزینی متن در صورت داشتن کاراکترهای علامت سوال ─────────
    private static string SanitizeText(string? text, string fallback)
    {
        if (string.IsNullOrWhiteSpace(text))
            return fallback;

        // اگر متن شامل ۲ علامت سوال یا بیشتر باشه یعنی انکودینگش در دیتابیس خراب بوده
        if (text.Contains("??") || text.Count(c => c == '?') >= 2)
            return fallback;

        return text.Trim();
    }

    private static string? SanitizeNullableText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        if (text.Contains("??") || text.Count(c => c == '?') >= 2)
            return null;

        return text.Trim();
    }
}
