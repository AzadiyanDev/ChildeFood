using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Context;

// کانتکست دیتابیس پروژه‌مون؛ وظیفه‌ش فقط ارتباط مستقیم با دیتابیس و مدیریت جداوله.
public class ChildeFoodDbContext : DbContext
{
    public ChildeFoodDbContext(DbContextOptions<ChildeFoodDbContext> options) : base(options)
    {
    }

    public DbSet<FoodItem> FoodItems => Set<FoodItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ChildeFoodDbContext).Assembly);

        // سید کردن چند دیتای اولیه تا پروژه از همون اول بالا اومدنی دست‌خالی نباشه.
        modelBuilder.Entity<FoodItem>().HasData(
            new FoodItem
            {
                Id = 1,
                Title = "پوره سیب و موز ارگانیک",
                Description = "بسیار مقوی و زودهضم، سرشار از فیبر و ویتامین ث برای نوزادان",
                Price = 85000,
                MinAgeMonths = 6,
                Category = FoodCategory.Puree,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FoodItem
            {
                Id = 2,
                Title = "سوپ جوانه گندم و قلم",
                Description = "حاوی عصاره قلم گوساله، سبزیجات تازه و جوانه گندم برای وزن‌گیری عالی",
                Price = 120000,
                MinAgeMonths = 8,
                Category = FoodCategory.Soup,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new FoodItem
            {
                Id = 3,
                Title = "کوکی دندان‌گیر جو دوسر",
                Description = "بدون شکر افزوده، با شیرینی طبیعی خرما و بافت مناسب تسکین لثه کودک",
                Price = 95000,
                MinAgeMonths = 10,
                Category = FoodCategory.Snack,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}