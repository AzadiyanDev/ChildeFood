namespace ChildeFood.Domain.Common;

// این کلاس پایه تمام انتیتی‌های پروژه‌مونه تا آیدی و زمان ثبت رو همه داشته باشن و نخوایم هی تکرارشون کنیم.
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}