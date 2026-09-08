using System.Globalization;
using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// سرویس مدیریت سفارشات؛ واکشی سفارش‌های امروز برای داشبورد و صفحه اصلی، صفحه‌بندی ۱۰تایی و لود تنبل جزئیات
public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IFoodService _foodService;

    public OrderService(
        ApplicationDbContext dbContext,
        UserManager<ApplicationUser> userManager,
        IFoodService foodService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _foodService = foodService;
    }

    // واکشی لیست سفارش‌های امروز یک والد به همراه کلیه جزئیات غذا، فرزند و مدرسه
    public async Task<IReadOnlyList<TodayOrderDto>> GetTodayOrdersAsync(Guid parentId, DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        // اطمینان از وجود داده‌های اولیه سفارش‌ها
        await EnsureSampleOrdersAsync(parentId, cancellationToken);

        // تاریخ روز جاری رو بر مبنای ساعت رسمی ایران حساب می‌کنیم
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3.5));

        // کوئری روی سفارش‌های این روز خاص با جوین به فرزند، مدرسه و غذاها
        var orders = await _dbContext.SchoolOrders
            .AsNoTracking()
            .Include(o => o.Child)
                .ThenInclude(c => c!.School)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .Where(o => o.ParentId == parentId && o.ServingDate == targetDate)
            .OrderBy(o => o.DeliveryTime)
            .ToListAsync(cancellationToken);

        var result = new List<TodayOrderDto>();
        var pc = new PersianCalendar();

        foreach (var order in orders)
        {
            var firstItem = order.OrderItems.FirstOrDefault();
            var isDelivered = order.Status == OrderStatus.Delivered;

            // ساخت برچسب تاریخ خوانا به فارسی (مثلاً ۱۰ شهریور)
            var orderDateTime = order.ServingDate.ToDateTime(TimeOnly.MinValue);
            var persianDay = pc.GetDayOfMonth(orderDateTime);
            var persianMonthName = GetPersianMonthName(pc.GetMonth(orderDateTime));
            var dateLabel = $"{persianDay} {persianMonthName}";

            result.Add(new TodayOrderDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                ChildId = order.ChildId,
                ChildName = order.Child?.FullName ?? "فرزند",
                ChildAvatar = order.Child?.AvatarUrl ?? "/assets/avatars/ali.svg",
                SchoolName = order.Child?.School?.Name ?? "مدرسه",
                Grade = order.Child?.Grade ?? "کلاس پنجم",
                FoodTitle = firstItem?.FoodTitle ?? firstItem?.FoodItem?.Title ?? "ناهار روز",
                FoodSubtitle = firstItem?.Portion == PortionType.Half ? "نیم پرس" : "پرس کامل",
                FoodEmoji = firstItem?.FoodItem?.Emoji ?? "🍱",
                DeliveryTime = string.IsNullOrWhiteSpace(order.DeliveryTime) ? "۱۲:۳۰" : order.DeliveryTime,
                DateLabel = dateLabel,
                ServingDate = order.ServingDate,
                Status = order.Status,
                StatusBadgeText = isDelivered ? "تحویل شده" : "در حال آماده‌سازی",
                StatusBadgeType = isDelivered ? "delivered" : "preparing",
                TotalPrice = order.FinalPayablePrice,
                TrackingCode = order.TrackingCode ?? order.OrderCode
            });
        }

        return result;
    }

    // واکشی سفارش‌های امروز با شماره موبایل والد
    public async Task<IReadOnlyList<TodayOrderDto>> GetTodayOrdersByPhoneAsync(string phone, DateOnly? date = null, CancellationToken cancellationToken = default)
    {
        var normalized = phone.Trim().Replace(" ", "");
        var user = await _userManager.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.PhoneNumber == normalized || u.UserName == normalized, cancellationToken);

        if (user is null)
        {
            return Array.Empty<TodayOrderDto>();
        }

        return await GetTodayOrdersAsync(user.Id, date, cancellationToken);
    }

    // واکشی سفارش‌های شخصی والد لاگین‌شده با صفحه‌بندی ۱۰ تا ۱۰ تا جهت پرفورمنس بالا و اسکرول نرم
    public async Task<PagedOrdersDto> GetParentOrdersPagedAsync(Guid parentId, int pageNumber = 1, int pageSize = 10, string? statusFilter = null, string? phone = null, CancellationToken cancellationToken = default)
    {
        // در صورتی که شناسه والد خالی باشد یا ارسال نشده باشد، با شماره همراه یا کاربر پیش‌فرض شناسه را پیدا می‌کنیم
        if (parentId == Guid.Empty && !string.IsNullOrWhiteSpace(phone))
        {
            var normalized = phone.Trim().Replace(" ", "");
            var userByPhone = await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == normalized || u.UserName == normalized, cancellationToken);
            if (userByPhone != null)
            {
                parentId = userByPhone.Id;
            }
        }

        if (parentId == Guid.Empty)
        {
            var defaultUser = await _userManager.Users.FirstOrDefaultAsync(cancellationToken);
            if (defaultUser != null)
            {
                parentId = defaultUser.Id;
            }
        }

        // اطمینان از وجود داده‌های کافی برای تست لذت‌بخش اسکرول و صفحه‌بندی
        await EnsureSampleOrdersAsync(parentId, cancellationToken);

        var query = _dbContext.SchoolOrders
            .AsNoTracking()
            .Where(o => o.ParentId == parentId);

        // محاسبه تعداد کل سفارش‌های فعال و تحویل شده برای بج تب‌ها
        var activeCount = await _dbContext.SchoolOrders
            .AsNoTracking()
            .Where(o => o.ParentId == parentId && o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled)
            .CountAsync(cancellationToken);

        var deliveredCount = await _dbContext.SchoolOrders
            .AsNoTracking()
            .Where(o => o.ParentId == parentId && o.Status == OrderStatus.Delivered)
            .CountAsync(cancellationToken);

        // فیلتر وضعیت در صورت انتخاب کاربر (همه، فعال، تحویل شده)
        if (string.Equals(statusFilter, "active", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled);
        }
        else if (string.Equals(statusFilter, "delivered", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(o => o.Status == OrderStatus.Delivered);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // مرتب‌سازی بر اساس تازه‌ترین تاریخ سرو و ساعت تحویل
        var pagedList = await query
            .Include(o => o.Child)
                .ThenInclude(c => c!.School)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .OrderByDescending(o => o.ServingDate)
            .ThenByDescending(o => o.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var pc = new PersianCalendar();
        var items = new List<OrderSummaryItemDto>();

        foreach (var order in pagedList)
        {
            var firstItem = order.OrderItems.FirstOrDefault();
            var isActive = order.Status != OrderStatus.Delivered && order.Status != OrderStatus.Cancelled;

            var orderDateTime = order.ServingDate.ToDateTime(TimeOnly.MinValue);
            var persianDay = pc.GetDayOfMonth(orderDateTime);
            var persianMonthName = GetPersianMonthName(pc.GetMonth(orderDateTime));
            var dateLabel = $"{persianDay} {persianMonthName}";

            items.Add(new OrderSummaryItemDto
            {
                Id = order.Id,
                OrderCode = order.OrderCode,
                ChildId = order.ChildId,
                ChildName = order.Child?.FullName ?? "فرزند",
                ChildAvatar = order.Child?.AvatarUrl ?? "/assets/avatars/ali.svg",
                SchoolName = order.Child?.School?.Name ?? "مدرسه",
                Grade = order.Child?.Grade ?? "کلاس پنجم",
                FoodTitle = firstItem?.FoodTitle ?? firstItem?.FoodItem?.Title ?? "ناهار روز",
                FoodSubtitle = firstItem?.Portion == PortionType.Half ? "نیم پرس" : "پرس کامل",
                FoodEmoji = firstItem?.FoodItem?.Emoji ?? "🍱",
                DeliveryTime = string.IsNullOrWhiteSpace(order.DeliveryTime) ? "۱۲:۳۰" : order.DeliveryTime,
                DateLabel = dateLabel,
                ServingDate = order.ServingDate,
                Status = isActive ? "active" : "delivered",
                StatusText = isActive ? "در حال آماده‌سازی" : "تحویل شده",
                Price = order.FinalPayablePrice,
                TrackingCode = order.TrackingCode ?? order.OrderCode
            });
        }

        return new PagedOrdersDto
        {
            Items = items,
            TotalCount = totalCount,
            ActiveCount = activeCount,
            DeliveredCount = deliveredCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            HasMore = (pageNumber * pageSize) < totalCount
        };
    }

    // واکشی جزئیات کامل و جامع یک سفارش در زمان باز شدن مدال (Lazy Loading)
    public async Task<OrderDetailDto?> GetOrderDetailAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        var order = await _dbContext.SchoolOrders
            .AsNoTracking()
            .Include(o => o.Child)
                .ThenInclude(c => c!.School)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order is null) return null;

        var pc = new PersianCalendar();
        var orderDateTime = order.ServingDate.ToDateTime(TimeOnly.MinValue);
        var persianDay = pc.GetDayOfMonth(orderDateTime);
        var persianMonthName = GetPersianMonthName(pc.GetMonth(orderDateTime));
        var dateLabel = $"{persianDay} {persianMonthName}";

        var isDelivered = order.Status == OrderStatus.Delivered;

        var detail = new OrderDetailDto
        {
            Id = order.Id,
            OrderCode = order.OrderCode,
            ChildId = order.ChildId,
            ChildName = order.Child?.FullName ?? "فرزند",
            ChildAvatar = order.Child?.AvatarUrl ?? "/assets/avatars/ali.svg",
            SchoolName = order.Child?.School?.Name ?? "مدرسه",
            Grade = order.Child?.Grade ?? "کلاس پنجم",
            DietaryNotes = order.Child?.DietaryNotes,
            ServingDate = order.ServingDate,
            DateLabel = dateLabel,
            DeliveryTime = string.IsNullOrWhiteSpace(order.DeliveryTime) ? "۱۲:۳۰" : order.DeliveryTime,
            Status = isDelivered ? "delivered" : "active",
            StatusText = isDelivered ? "تحویل شده" : "در حال آماده‌سازی",
            TotalRawPrice = order.TotalRawPrice,
            DiscountAmount = order.DiscountAmount,
            FinalPayablePrice = order.FinalPayablePrice,
            PaymentMethod = order.PaymentMethod == PaymentMethod.Wallet ? "کیف پول دیجیتال" : "درگاه شتاب",
            TrackingCode = order.TrackingCode ?? order.OrderCode,
            CouponCode = order.CouponCode,
            CreatedAt = order.CreatedAt,
            Items = order.OrderItems.Select(oi => new OrderItemDetailDto
            {
                Id = oi.Id,
                FoodItemId = oi.FoodItemId,
                FoodTitle = oi.FoodTitle,
                Portion = oi.Portion == PortionType.Half ? "نیم پرس" : "کامل",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice,
                Emoji = oi.FoodItem?.Emoji ?? "🍱",
                ImageUrl = oi.FoodItem?.ImageUrl,
                Calories = oi.FoodItem?.Calories ?? 550,
                Ingredients = oi.FoodItem?.Ingredients
            }).ToList(),
            TimelineSteps = new List<OrderTimelineStepDto>
            {
                new()
                {
                    Title = "تایید سفارش و پرداخت",
                    Subtitle = "پرداخت موفق از اعتبار کیف پول",
                    Time = "ساعت ۰۸:۳۰",
                    IsCompleted = true,
                    IsCurrent = false,
                    Icon = "✓"
                },
                new()
                {
                    Title = "طبخ بهداشتی و کنترل کیفیت",
                    Subtitle = "کیترینگ اختصاصی با بسته‌بندی بهداشتی گرم",
                    Time = "ساعت ۱۰:۴۵",
                    IsCompleted = true,
                    IsCurrent = false,
                    Icon = "✓"
                },
                new()
                {
                    Title = "ارسال به مدرسه",
                    Subtitle = "با خودروی مجهز به گرم‌خانه برای حفظ تازگی غذا",
                    Time = "ساعت ۱۱:۴۰",
                    IsCompleted = isDelivered,
                    IsCurrent = !isDelivered,
                    Icon = isDelivered ? "✓" : "🚚"
                },
                new()
                {
                    Title = "تحویل در بوفه مدرسه",
                    Subtitle = "تحویل گرم به دانش‌آموز در زنگ ناهار",
                    Time = order.DeliveryTime,
                    IsCompleted = isDelivered,
                    IsCurrent = false,
                    Icon = isDelivered ? "✓" : "📍"
                }
            }
        };

        return detail;
    }

    // متد کمکی جهت ایجاد سفارش‌های نمونه متنوع برای والد جهت تست واقعی اسکرول و صفحه‌بندی
    public async Task EnsureSampleOrdersAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        if (parentId == Guid.Empty)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(cancellationToken);
            if (user == null) return;
            parentId = user.Id;
        }

        // ۱. پاکسازی هرگونه سفارش خالی یا خراب علامت‌سوالی قدیمی در صورت وجود
        var corruptedOrders = await _dbContext.SchoolOrders
            .Include(o => o.OrderItems)
            .Where(o => o.ParentId == parentId && (!o.OrderItems.Any() || o.OrderItems.Any(oi => oi.FoodTitle.Contains("?") || (oi.FoodItem != null && oi.FoodItem.Title.Contains("?")))))
            .ToListAsync(cancellationToken);

        if (corruptedOrders.Count > 0)
        {
            _dbContext.SchoolOrders.RemoveRange(corruptedOrders);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // ۲. شمارش سفارش‌های معتبر موجود برای این والد
        var existingCount = await _dbContext.SchoolOrders
            .Where(o => o.ParentId == parentId)
            .CountAsync(cancellationToken);

        if (existingCount >= 15) return;

        // ۳. بررسی و اصلاح اطلاعات مدرسه و فرزندان والد
        var school = await _dbContext.Schools.FirstOrDefaultAsync(s => s.BranchCode == "SCH-FARZ-01" || s.IsActive, cancellationToken);
        if (school == null)
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

        var children = await _dbContext.Children
            .Include(c => c.School)
            .Where(c => c.ParentId == parentId)
            .ToListAsync(cancellationToken);

        if (children.Count == 0)
        {
            var child1 = new Child
            {
                Id = Guid.NewGuid(),
                ParentId = parentId,
                FullName = "علی احمدی",
                SchoolId = school.Id,
                Grade = "کلاس پنجم",
                Age = 11,
                AvatarUrl = "/assets/avatars/ali.svg",
                DietaryNotes = "بدون حساسیت غذایی",
                CreatedAt = DateTime.UtcNow
            };
            var child2 = new Child
            {
                Id = Guid.NewGuid(),
                ParentId = parentId,
                FullName = "آوا احمدی",
                SchoolId = school.Id,
                Grade = "پایه دوم ابتدایی",
                Age = 8,
                AvatarUrl = "/assets/avatars/ava.svg",
                DietaryNotes = "رژیم بدون بادام زمینی",
                CreatedAt = DateTime.UtcNow
            };
            children.Add(child1);
            children.Add(child2);
            await _dbContext.Children.AddRangeAsync(children, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            var modified = false;
            for (int ci = 0; ci < children.Count; ci++)
            {
                var ch = children[ci];
                if (ch.FullName.Contains("?") || (ch.Grade != null && ch.Grade.Contains("?")))
                {
                    ch.FullName = ci == 0 ? "علی احمدی" : "آوا احمدی";
                    ch.Grade = ci == 0 ? "کلاس پنجم" : "پایه دوم ابتدایی";
                    ch.AvatarUrl = ci == 0 ? "/assets/avatars/ali.svg" : "/assets/avatars/ava.svg";
                    ch.SchoolId = school.Id;
                    modified = true;
                }
            }
            if (modified) await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // ۴. اطمینان از وجود ۳۴ غذای واقعی در جدول غذاها
        var foods = await _dbContext.FoodItems
            .Where(f => !f.Title.Contains("?") && f.Category == FoodCategory.Main)
            .ToListAsync(cancellationToken);

        if (foods.Count < 5)
        {
            await _foodService.SeedComprehensiveFoodCatalogAsync(cancellationToken);
            foods = await _dbContext.FoodItems
                .Where(f => !f.Title.Contains("?") && f.Category == FoodCategory.Main)
                .ToListAsync(cancellationToken);
        }

        if (foods.Count == 0) return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3.5));
        var newOrders = new List<SchoolOrder>();

        // ۵. ایجاد ۱۸ سفارش واقعی و تمیز: ۲ تای اول مربوط به امروز (فعال)، ۱۶ تای بعدی روزهای گذشته (تحویل شده)
        var foodJoojeh = foods.FirstOrDefault(f => f.Title.Contains("جوجه")) ?? foods[0];
        var foodPizza = foods.FirstOrDefault(f => f.Title.Contains("پیتزا")) ?? (foods.Count > 1 ? foods[1] : foods[0]);

        // سفارش اول امروز: برای علی احمدی
        var order1 = new SchoolOrder
        {
            Id = Guid.NewGuid(),
            OrderCode = "ORD-1403-101",
            ParentId = parentId,
            ChildId = children[0].Id,
            ServingDate = today,
            DeliveryTime = "12:30",
            TotalRawPrice = foodJoojeh.Price,
            DiscountAmount = 0,
            FinalPayablePrice = foodJoojeh.Price,
            PaymentMethod = PaymentMethod.Wallet,
            Status = OrderStatus.Preparing,
            TrackingCode = "984712",
            CreatedAt = DateTime.UtcNow
        };
        order1.OrderItems.Add(new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order1.Id,
            FoodItemId = foodJoojeh.Id,
            FoodTitle = foodJoojeh.Title,
            Portion = PortionType.Full,
            Quantity = 1,
            UnitPrice = foodJoojeh.Price,
            TotalPrice = foodJoojeh.Price,
            CreatedAt = DateTime.UtcNow
        });
        newOrders.Add(order1);

        // سفارش دوم امروز: برای آوا احمدی
        var order2 = new SchoolOrder
        {
            Id = Guid.NewGuid(),
            OrderCode = "ORD-1403-102",
            ParentId = parentId,
            ChildId = children.Count > 1 ? children[1].Id : children[0].Id,
            ServingDate = today,
            DeliveryTime = "12:45",
            TotalRawPrice = foodPizza.Price,
            DiscountAmount = 0,
            FinalPayablePrice = foodPizza.Price,
            PaymentMethod = PaymentMethod.Wallet,
            Status = OrderStatus.Preparing,
            TrackingCode = "984530",
            CreatedAt = DateTime.UtcNow
        };
        order2.OrderItems.Add(new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order2.Id,
            FoodItemId = foodPizza.Id,
            FoodTitle = foodPizza.Title,
            Portion = PortionType.Full,
            Quantity = 1,
            UnitPrice = foodPizza.Price,
            TotalPrice = foodPizza.Price,
            CreatedAt = DateTime.UtcNow
        });
        newOrders.Add(order2);

        // ۱۶ سفارش مربوط به روزهای قبل با غذاها و تاریخ‌های متنوع
        for (int i = 1; i <= 16; i++)
        {
            var child = children[i % children.Count];
            var food = foods[(i + 1) % foods.Count];
            var servingDate = today.AddDays(-i);

            var pastOrder = new SchoolOrder
            {
                Id = Guid.NewGuid(),
                OrderCode = $"ORD-1403-{102 + i}",
                ParentId = parentId,
                ChildId = child.Id,
                ServingDate = servingDate,
                DeliveryTime = i % 2 == 0 ? "12:30" : "12:45",
                TotalRawPrice = food.Price,
                DiscountAmount = 0,
                FinalPayablePrice = food.Price,
                PaymentMethod = PaymentMethod.Wallet,
                Status = OrderStatus.Delivered,
                TrackingCode = $"{984000 - i * 143}",
                CreatedAt = DateTime.UtcNow.AddDays(-i)
            };

            pastOrder.OrderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = pastOrder.Id,
                FoodItemId = food.Id,
                FoodTitle = food.Title,
                Portion = PortionType.Full,
                Quantity = 1,
                UnitPrice = food.Price,
                TotalPrice = food.Price,
                CreatedAt = DateTime.UtcNow.AddDays(-i)
            });

            newOrders.Add(pastOrder);
        }

        await _dbContext.SchoolOrders.AddRangeAsync(newOrders, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    // متد کمکی تبدیل شماره ماه خورشیدی به اسم ماه
    private static string GetPersianMonthName(int month)
    {
        return month switch
        {
            1 => "فروردین",
            2 => "اردیبهشت",
            3 => "خرداد",
            4 => "تیر",
            5 => "مرداد",
            6 => "شهریور",
            7 => "مهر",
            8 => "آبان",
            9 => "آذر",
            10 => "دی",
            11 => "بهمن",
            12 => "اسفند",
            _ => "ماه"
        };
    }
}
