using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول غذاها؛ تنظیمات دقیق انواع فیلدهای رشته‌ای، قیمت‌ها و عدم حذف تصادفی غذاهای سفارش داده شده.
public class FoodItemConfiguration : IEntityTypeConfiguration<FoodItem>
{
    public void Configure(EntityTypeBuilder<FoodItem> builder)
    {
        builder.ToTable("FoodItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Subtitle)
            .HasMaxLength(250);

        // دقت اعشار قیمت غذا به صورت استاندارد مالی
        builder.Property(x => x.Price)
            .HasPrecision(18, 2);

        builder.Property(x => x.HalfPortionPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.BadgeText)
            .HasMaxLength(50);

        builder.Property(x => x.BadgeType)
            .HasMaxLength(50);

        builder.Property(x => x.Emoji)
            .HasMaxLength(20);

        builder.Property(x => x.ImageUrl)
            .HasMaxLength(500);

        builder.Property(x => x.Ingredients)
            .HasMaxLength(1000);

        builder.Property(x => x.Allergens)
            .HasMaxLength(500);

        // ذخیره اینام دسته‌بندی به عنوان عدد یا رشته
        builder.Property(x => x.Category)
            .HasConversion<int>();

        // رابطه با برنامه‌ریزی روزانه (Restrict)
        builder.HasMany(x => x.MealSchedules)
            .WithOne(x => x.FoodItem)
            .HasForeignKey(x => x.FoodItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با اقلام سفارش‌ها (Restrict)؛ اگر غذایی قبلاً سفارش داده شده نباید بدون هماهنگی پاک بشه
        builder.HasMany(x => x.OrderItems)
            .WithOne(x => x.FoodItem)
            .HasForeignKey(x => x.FoodItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}