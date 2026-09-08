using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول سفارشات مدارس؛ کد پیگیری یکتا، دقت قیمت‌ها و حذف آبشاری فقط برای ردیف‌های خود سفارش.
public class SchoolOrderConfiguration : IEntityTypeConfiguration<SchoolOrder>
{
    public void Configure(EntityTypeBuilder<SchoolOrder> builder)
    {
        builder.ToTable("SchoolOrders");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OrderCode)
            .IsRequired()
            .HasMaxLength(50);

        // کد سفارش یونیک برای پیگیری مستقیم والدین
        builder.HasIndex(x => x.OrderCode)
            .IsUnique();

        builder.Property(x => x.DeliveryTime)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.TotalRawPrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(x => x.FinalPayablePrice)
            .HasPrecision(18, 2);

        builder.Property(x => x.TrackingCode)
            .HasMaxLength(100);

        builder.Property(x => x.CouponCode)
            .HasMaxLength(50);

        builder.Property(x => x.PaymentMethod)
            .HasConversion<int>();

        builder.Property(x => x.Status)
            .HasConversion<int>();

        // رابطه با والد ثبت‌کننده سفارش (Restrict)
        builder.HasOne(x => x.Parent)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با فرزند تحویل‌گیرنده سفارش (Restrict)
        builder.HasOne(x => x.Child)
            .WithMany(x => x.Orders)
            .HasForeignKey(x => x.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با اقلام داخل سفارش؛ اگر سفارش حذف شود، اقلام مربوطه‌اش هم باید به صورت خودکار حذف شوند (Cascade)
        builder.HasMany(x => x.OrderItems)
            .WithOne(x => x.Order)
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
