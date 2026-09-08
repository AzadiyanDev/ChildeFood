using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ‌های جدول مدارس؛ اطمینان از یکتا بودن کد شعبه مدرسه و فیلدهای آدرس و ساعت تحویل ناهار.
public class SchoolConfiguration : IEntityTypeConfiguration<School>
{
    public void Configure(EntityTypeBuilder<School> builder)
    {
        builder.ToTable("Schools");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.BranchCode)
            .IsRequired()
            .HasMaxLength(50);

        // ایندکس یونیک روی کد شعبه مدرسه تا تکراری ثبت نشه
        builder.HasIndex(x => x.BranchCode)
            .IsUnique();

        builder.Property(x => x.Address)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(x => x.DefaultLunchTime)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ContactPerson)
            .HasMaxLength(100);

        // رابطه با دانش‌آموزان (Restrict)
        builder.HasMany(x => x.Children)
            .WithOne(x => x.School)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با برنامه غذایی روزانه (Restrict)
        builder.HasMany(x => x.MealSchedules)
            .WithOne(x => x.School)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
