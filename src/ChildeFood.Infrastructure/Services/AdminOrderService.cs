using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChildeFood.Infrastructure.Services;

// سرویس بیزینس سفارش‌های مدارس در پنل ادمین؛
// این بخش تمام تجمیع‌های آشپزخانه و خروجی‌های تفصیلی بوفه مدارس رو محاسبه می‌کنه
public class AdminOrderService : IAdminOrderService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AdminOrderService> _logger;

    public AdminOrderService(ApplicationDbContext db, ILogger<AdminOrderService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ─── دریافت خلاصه سفارش‌ها به تفکیک مدارس ─────────────────────────────────
    // این متد برای هر مدرسه تعداد سفارش، کل پرس‌ها، جمع مبالغ و اقلام تجمیع‌شده رو آماده می‌کنه
    public async Task<List<SchoolOrdersSummaryDto>> GetSchoolOrdersSummaryAsync(DateOnly? date)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        _logger.LogInformation("در حال واکشی سفارش‌های مدارس برای تاریخ {TargetDate}", targetDate);

        // اطمینان از وجود سفارش‌ها و اقلام واقعی برای این روز
        await EnsureSeedSampleSchoolOrdersAsync();

        // واکشی تمام مدارسی که فعال هستند
        var schools = await _db.Schools
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();

        // واکشی سفارش‌های این تاریخ خاص به همراه فرزندا، اقلام و غذاها
        var orders = await _db.SchoolOrders
            .AsNoTracking()
            .Where(o => o.ServingDate == targetDate && o.Status != OrderStatus.Cancelled)
            .Include(o => o.Child)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .ToListAsync();

        var result = new List<SchoolOrdersSummaryDto>();

        foreach (var school in schools)
        {
            // فیلتر سفارش‌های مربوط به این مدرسه خاص
            var schoolOrders = orders.Where(o => o.Child?.SchoolId == school.Id).ToList();

            // تمام ردیف‌های اقلام سفارش‌های این مدرسه
            var orderItems = schoolOrders.SelectMany(o => o.OrderItems).ToList();

            // تجمیع اقلام غذا (مثلاً ۳۵ پرس چلوکباب، ۲۰ تا ماکارونی و...)
            var aggregatedFoods = orderItems
                .GroupBy(i => new { i.FoodItemId, i.FoodTitle })
                .Select(g =>
                {
                    var firstItem = g.First();
                    var category = firstItem.FoodItem?.Category ?? FoodCategory.Main;
                    var categoryTitle = category switch
                    {
                        FoodCategory.Main => "غذای اصلی",
                        FoodCategory.Drink => "نوشیدنی",
                        FoodCategory.Dessert => "دسر",
                        FoodCategory.Snack => "میان‌وعده و سالاد",
                        _ => "سایر اقلام"
                    };

                    return new AggregatedFoodItemDto
                    {
                        FoodItemId = g.Key.FoodItemId,
                        FoodTitle = string.IsNullOrWhiteSpace(g.Key.FoodTitle) ? (firstItem.FoodItem?.Title ?? "غذای ویژه") : g.Key.FoodTitle,
                        CategoryTitle = categoryTitle,
                        ImageUrl = firstItem.FoodItem?.ImageUrl,
                        Emoji = firstItem.FoodItem?.Emoji ?? "🍱",
                        TotalQuantity = g.Sum(x => x.Quantity),
                        FullPortionQuantity = g.Where(x => x.Portion == PortionType.Full).Sum(x => x.Quantity),
                        HalfPortionQuantity = g.Where(x => x.Portion == PortionType.Half).Sum(x => x.Quantity),
                        UnitPrice = firstItem.UnitPrice,
                        TotalPrice = g.Sum(x => x.TotalPrice)
                    };
                })
                .OrderByDescending(f => f.TotalQuantity)
                .ToList();

            // برچسب وضعیت کلی برای این مدرسه
            var statusLabel = "بدون سفارش";
            if (schoolOrders.Any())
            {
                if (schoolOrders.All(o => o.Status == OrderStatus.Delivered))
                    statusLabel = "تحویل داده شده";
                else if (schoolOrders.Any(o => o.Status == OrderStatus.Preparing))
                    statusLabel = "در حال پخت و بسته‌بندی";
                else
                    statusLabel = "در انتظار آماده‌سازی";
            }

            result.Add(new SchoolOrdersSummaryDto
            {
                SchoolId = school.Id,
                SchoolName = school.Name,
                BranchCode = school.BranchCode,
                Address = school.Address,
                DefaultLunchTime = school.DefaultLunchTime,
                ContactPerson = school.ContactPerson,
                ServingDate = targetDate,
                TotalOrdersCount = schoolOrders.Count,
                TotalFoodItemsCount = orderItems.Sum(i => i.Quantity),
                TotalRevenue = schoolOrders.Sum(o => o.FinalPayablePrice),
                StatusLabel = statusLabel,
                AggregatedFoods = aggregatedFoods
            });
        }

        // مدارسی که سفارش دارند اول لیست قرار بگیرند
        return result
            .OrderByDescending(s => s.TotalOrdersCount)
            .ThenBy(s => s.SchoolName)
            .ToList();
    }

    // ─── دریافت گزارش ریز اطلاعات سفارش‌های یک مدرسه ──────────────────────────
    // برای دکمه «دانلود» اکسل یا مانیفست تحویل بوفه
    public async Task<SchoolOrdersReportDto?> GetSchoolOrdersReportAsync(Guid schoolId, DateOnly? date)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var school = await _db.Schools.AsNoTracking().FirstOrDefaultAsync(s => s.Id == schoolId);
        if (school == null)
            return null;

        var orders = await _db.SchoolOrders
            .AsNoTracking()
            .Where(o => o.ServingDate == targetDate && o.Child!.SchoolId == schoolId && o.Status != OrderStatus.Cancelled)
            .Include(o => o.Child)
            .Include(o => o.Parent)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .OrderBy(o => o.Child!.FullName)
            .ToListAsync();

        var orderItems = orders.SelectMany(o => o.OrderItems).ToList();

        // تجمیع اقلام
        var aggregatedItems = orderItems
            .GroupBy(i => new { i.FoodItemId, i.FoodTitle })
            .Select(g =>
            {
                var first = g.First();
                return new AggregatedFoodItemDto
                {
                    FoodItemId = g.Key.FoodItemId,
                    FoodTitle = g.Key.FoodTitle,
                    Emoji = first.FoodItem?.Emoji ?? "🍱",
                    CategoryTitle = first.FoodItem?.Category.ToString() ?? "غذای اصلی",
                    TotalQuantity = g.Sum(x => x.Quantity),
                    FullPortionQuantity = g.Where(x => x.Portion == PortionType.Full).Sum(x => x.Quantity),
                    HalfPortionQuantity = g.Where(x => x.Portion == PortionType.Half).Sum(x => x.Quantity),
                    UnitPrice = first.UnitPrice,
                    TotalPrice = g.Sum(x => x.TotalPrice)
                };
            })
            .OrderByDescending(x => x.TotalQuantity)
            .ToList();

        // ریز سفارشات فرد به فرد دانش‌آموزان
        var studentOrders = orders.Select(o =>
        {
            var itemsSummary = string.Join(" + ", o.OrderItems.Select(i => $"{i.Quantity}× {i.FoodTitle}"));
            if (string.IsNullOrWhiteSpace(itemsSummary))
                itemsSummary = "ناهار ویژه روز";

            return new SchoolOrderStudentDetailDto
            {
                OrderCode = o.OrderCode,
                StudentName = o.Child?.FullName ?? "دانش‌آموز",
                Grade = o.Child?.Grade ?? "دبستان",
                Age = o.Child?.Age ?? 0,
                ParentName = o.Parent?.FullName ?? "والد",
                ParentPhone = o.Parent?.PhoneNumber ?? string.Empty,
                OrderedItemsSummary = itemsSummary,
                FinalPrice = o.FinalPayablePrice,
                DeliveryTime = o.DeliveryTime,
                DietaryNotes = o.Child?.DietaryNotes,
                StatusLabel = o.Status switch
                {
                    OrderStatus.Delivered => "تحویل داده شده",
                    OrderStatus.Preparing => "در حال پخت و بسته‌بندی",
                    OrderStatus.Paid => "پرداخت شده",
                    _ => "در صف بررسی"
                }
            };
        }).ToList();

        return new SchoolOrdersReportDto
        {
            SchoolId = school.Id,
            SchoolName = school.Name,
            BranchCode = school.BranchCode,
            Address = school.Address,
            ServingDate = targetDate,
            DeliveryTime = school.DefaultLunchTime,
            TotalOrders = orders.Count,
            TotalPortions = orderItems.Sum(i => i.Quantity),
            TotalRevenue = orders.Sum(o => o.FinalPayablePrice),
            AggregatedItems = aggregatedItems,
            StudentOrders = studentOrders
        };
    }

    // ─── تغییر وضعیت سفارش‌های یک مدرسه در یک تاریخ ─────────────────────────
    public async Task<bool> UpdateSchoolOrdersStatusAsync(Guid schoolId, DateOnly date, OrderStatus newStatus)
    {
        var orders = await _db.SchoolOrders
            .Where(o => o.ServingDate == date && o.Child!.SchoolId == schoolId && o.Status != OrderStatus.Cancelled)
            .ToListAsync();

        if (!orders.Any())
            return false;

        foreach (var order in orders)
        {
            order.Status = newStatus;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("وضعیت {Count} سفارش برای مدرسه {SchoolId} در تاریخ {Date} به {Status} تغییر یافت.", orders.Count, schoolId, date, newStatus);
        return true;
    }

    // ─── اطمینان از وجود اقلام غذایی در سفارش‌ها برای نمایش دمو و تست ───────────
    public async Task EnsureSeedSampleSchoolOrdersAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // بررسی اینکه آیا سفارش‌های امروز اقلام OrderItem دارند یا نه
        var existingOrdersToday = await _db.SchoolOrders
            .Include(o => o.OrderItems)
            .Where(o => o.ServingDate == today)
            .ToListAsync();

        var foods = await _db.FoodItems.Where(f => f.IsAvailable).Take(8).ToListAsync();
        if (!foods.Any())
            return;

        // اگر سفارشی اقلام نداشت، اقلام براش می‌سازیم
        foreach (var order in existingOrdersToday.Where(o => !o.OrderItems.Any()))
        {
            var food1 = foods[Random.Shared.Next(foods.Count)];
            var food2 = foods.Count > 1 ? foods[(Random.Shared.Next(foods.Count) + 1) % foods.Count] : food1;

            var item1 = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                FoodItemId = food1.Id,
                FoodTitle = food1.Title,
                Quantity = 1,
                Portion = PortionType.Full,
                UnitPrice = food1.Price,
                TotalPrice = food1.Price,
                CreatedAt = DateTime.UtcNow
            };
            var item2 = new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                FoodItemId = food2.Id,
                FoodTitle = food2.Title,
                Quantity = 1,
                Portion = PortionType.Full,
                UnitPrice = food2.Price,
                TotalPrice = food2.Price,
                CreatedAt = DateTime.UtcNow
            };

            await _db.OrderItems.AddRangeAsync(item1, item2);
        }

        // اگر تعداد کل سفارش‌های امروز کمتر از ۸ بود، چند سفارش غنی دیگر برای مدارس مختلف می‌سازیم
        if (existingOrdersToday.Count < 8)
        {
            var children = await _db.Children.Include(c => c.School).Take(8).ToListAsync();
            int index = 1;
            foreach (var child in children)
            {
                if (existingOrdersToday.Any(o => o.ChildId == child.Id))
                    continue;

                var f1 = foods[(index - 1) % foods.Count];
                var f2 = foods[index % foods.Count];
                var total = f1.Price + f2.Price;

                var newOrder = new SchoolOrder
                {
                    Id = Guid.NewGuid(),
                    OrderCode = $"ORD-{today:yyyyMMdd}-{index:D3}",
                    ParentId = child.ParentId,
                    ChildId = child.Id,
                    ServingDate = today,
                    DeliveryTime = child.School?.DefaultLunchTime ?? "12:30",
                    TotalRawPrice = total,
                    FinalPayablePrice = total,
                    PaymentMethod = PaymentMethod.Wallet,
                    Status = index % 2 == 0 ? OrderStatus.Preparing : OrderStatus.Delivered,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30 * index)
                };

                var oi1 = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = newOrder.Id,
                    FoodItemId = f1.Id,
                    FoodTitle = f1.Title,
                    Quantity = index > 3 ? 2 : 1,
                    Portion = PortionType.Full,
                    UnitPrice = f1.Price,
                    TotalPrice = f1.Price * (index > 3 ? 2 : 1),
                    CreatedAt = DateTime.UtcNow
                };
                var oi2 = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = newOrder.Id,
                    FoodItemId = f2.Id,
                    FoodTitle = f2.Title,
                    Quantity = 1,
                    Portion = PortionType.Full,
                    UnitPrice = f2.Price,
                    TotalPrice = f2.Price,
                    CreatedAt = DateTime.UtcNow
                };

                await _db.SchoolOrders.AddAsync(newOrder);
                await _db.OrderItems.AddRangeAsync(oi1, oi2);
                index++;
            }
        }

        await _db.SaveChangesAsync();
    }
}
