using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول فرزندان دانش‌آموز؛ کلیدهای خارجی والد و مدرسه، ایندکس‌ها و رفتارهای حذف.
public class ChildConfiguration : IEntityTypeConfiguration<Child>
{
    public void Configure(EntityTypeBuilder<Child> builder)
    {
        builder.ToTable("Children");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Grade)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(x => x.DietaryNotes)
            .HasMaxLength(500);

        builder.Property(x => x.FavoriteFood)
            .HasMaxLength(150);

        // رابطه فرزند با والد (Restrict)
        builder.HasOne(x => x.Parent)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه فرزند با مدرسه (Restrict)
        builder.HasOne(x => x.School)
            .WithMany(x => x.Children)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه فرزند با سفارشات (Restrict)
        builder.HasMany(x => x.Orders)
            .WithOne(x => x.Child)
            .HasForeignKey(x => x.ChildId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه فرزند با تراکنش‌های کیف پول؛ اگر فرزند حذف بشه، ترنزکشن پاک نمیشه فقط فیلدش نال میشه
        builder.HasMany(x => x.WalletTransactions)
            .WithOne(x => x.Child)
            .HasForeignKey(x => x.ChildId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
