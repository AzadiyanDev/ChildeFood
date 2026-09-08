using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول کوپن‌های تخفیف؛ یکتا بودن کد تخفیف، محدودیت‌های سقف و کف مبالغ با دقت استاندارد مالی.
public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("Coupons");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(50);

        // ایندکس یکتا روی کد تخفیف تا کدهای مشابه ایجاد نشوند
        builder.HasIndex(x => x.Code)
            .IsUnique();

        builder.Property(x => x.DiscountType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.DiscountValue)
            .HasPrecision(18, 2);

        builder.Property(x => x.MaxDiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(x => x.MinOrderAmount)
            .HasPrecision(18, 2);
    }
}
