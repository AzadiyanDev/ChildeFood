using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول کاربران والد و مدیران با فلوئنت ای‌پی‌آی؛ رفتارهای حذف امن و محدودیت طول فیلدها.
public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FullName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.NationalId)
            .HasMaxLength(10);

        builder.Property(x => x.Address)
            .HasMaxLength(500);

        builder.Property(x => x.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(x => x.RoleTitle)
            .HasMaxLength(50);

        // رابطه والد با فرزندان: یک والد چندین فرزند دارد و حذف والد نباید فرزندان رو به صورت آبشاری حذف کنه (Restrict)
        builder.HasMany(x => x.Children)
            .WithOne(x => x.Parent)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه والد با سفارش‌ها: جلوگیری از حذف تصادفی تاریخچه سفارش‌ها با حذف اکانت
        builder.HasMany(x => x.Orders)
            .WithOne(x => x.Parent)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه والد با کیف پول: هر والد حداکثر یک کیف پول فعال دارد
        builder.HasOne(x => x.Wallet)
            .WithOne(x => x.Parent)
            .HasForeignKey<Wallet>(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه والد با تراکنش‌های کیف پول
        builder.HasMany(x => x.WalletTransactions)
            .WithOne(x => x.Parent)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
