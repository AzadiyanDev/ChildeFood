using ChildeFood.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ChildeFood.Persistence.Configurations;

// کانفیگ زمان‌بندی روزانه؛ کلید ترکیبی یونیک برای جلوگیری از ثبت تکراری یک غذا در یک مدرسه و روز خاص.
public class DailyMealScheduleConfiguration : IEntityTypeConfiguration<DailyMealSchedule>
{
    public void Configure(EntityTypeBuilder<DailyMealSchedule> builder)
    {
        builder.ToTable("DailyMealSchedules");

        builder.HasKey(x => x.Id);

        // ایندکس یونیک سه‌تایی: یک غذا برای یک مدرسه در یک تاریخ فقط یک بار تعریف میشه
        builder.HasIndex(x => new { x.Date, x.FoodItemId, x.SchoolId })
            .IsUnique();

        // رابطه با آیتم غذایی (Restrict)
        builder.HasOne(x => x.FoodItem)
            .WithMany(x => x.MealSchedules)
            .HasForeignKey(x => x.FoodItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // رابطه با مدرسه (Restrict)
        builder.HasOne(x => x.School)
            .WithMany(x => x.MealSchedules)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
