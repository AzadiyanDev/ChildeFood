using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول کیف پول؛ اطمینان از یکتایی شماره کارت مجازی و نگهداری دقیق مانده موجودی.
public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.ToTable("Wallets");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Balance)
            .HasPrecision(18, 2);

        builder.Property(x => x.VirtualCardNumber)
            .IsRequired()
            .HasMaxLength(30);

        // ایندکس یکتا روی شماره کارت مجازی
        builder.HasIndex(x => x.VirtualCardNumber)
            .IsUnique();

        // رابطه یک به یک با والد (Restrict)
        builder.HasOne(x => x.Parent)
            .WithOne(x => x.Wallet)
            .HasForeignKey<Wallet>(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با تراکنش‌های مالی (Restrict)
        builder.HasMany(x => x.Transactions)
            .WithOne(x => x.Wallet)
            .HasForeignKey(x => x.WalletId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
