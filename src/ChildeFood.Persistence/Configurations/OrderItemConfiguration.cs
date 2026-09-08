using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول اقلام ریز سفارش؛ فریز کردن قیمت و عنوان در لحظه ثبت و رفتارهای حذف ارتباطی.
public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FoodTitle)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.Portion)
            .HasConversion<int>();

        // رابطه با سفارش اصلی (Cascade)
        builder.HasOne(x => x.Order)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // رابطه با غذای مرجع (Restrict)
        builder.HasOne(x => x.FoodItem)
            .WithMany(x => x.OrderItems)
            .HasForeignKey(x => x.FoodItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
