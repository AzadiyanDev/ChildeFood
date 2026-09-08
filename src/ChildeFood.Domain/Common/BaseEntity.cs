namespace ChildeFood.Domain.Common;

// این کلاس ریشه تمام انتیتی‌هامونه؛ آیدی گویید (Guid) و زمان ثبت رو اینجا میذاریم تا نخوایم توی تک‌تک انتیتی‌ها تکرارشون کنیم.
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}