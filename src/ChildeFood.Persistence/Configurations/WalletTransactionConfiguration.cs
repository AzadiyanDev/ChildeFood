using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول تراکنش‌های کیف پول؛ ثبت جزئیات واریز و برداشت با دقت مالی و لینک به فرزند و والد.
public class WalletTransactionConfiguration : IEntityTypeConfiguration<WalletTransaction>
{
    public void Configure(EntityTypeBuilder<WalletTransaction> builder)
    {
        builder.ToTable("WalletTransactions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Subtitle)
            .HasMaxLength(250);

        builder.Property(x => x.TrackingCode)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Type)
            .HasConversion<int>();

        // رابطه با کیف پول (Restrict)
        builder.HasOne(x => x.Wallet)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.WalletId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با والد (Restrict)
        builder.HasOne(x => x.Parent)
            .WithMany(x => x.WalletTransactions)
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با فرزند (SetNull)
        builder.HasOne(x => x.Child)
            .WithMany(x => x.WalletTransactions)
            .HasForeignKey(x => x.ChildId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
