using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// تنظیمات Fluent API برای جدول کدهای یکبارمصرف؛ ایندکس‌گذاری بهینه برای جستجوی سریع در زمان لاگین
public class OtpCodeConfiguration : IEntityTypeConfiguration<OtpCode>
{
    public void Configure(EntityTypeBuilder<OtpCode> builder)
    {
        builder.ToTable("OtpCodes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PhoneNumber)
            .IsRequired()
            .HasMaxLength(15);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.ExpiresAt)
            .IsRequired();

        builder.Property(x => x.IsUsed)
            .IsRequired()
            .HasDefaultValue(false);

        // ایندکس ترکیبی قدرتمند برای چک کردن فوری کد ارسالی کاربر بدون کندی روی تعداد رکوردهای بالا
        builder.HasIndex(x => new { x.PhoneNumber, x.Code, x.IsUsed });

        // ایندکس شماره تلفن برای ابطال سریع کدهای قبلی
        builder.HasIndex(x => x.PhoneNumber);
    }
}
