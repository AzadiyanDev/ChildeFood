using ChildeFood.Domain.Common;

namespace ChildeFood.Domain.Entities;

// جدول کدهای تایید یکبارمصرف؛ این موجودیت رو توی دیتابیس نگه می‌داریم تا بدونیم چه کدی برای چه شماره‌ای صادر شده
// و با چک کردن دقیق تاریخ انقضا و وضعیت مصرف، از سوءاستفاده یا ورود تکراری جلوگیری کنیم.
public class OtpCode : BaseEntity
{
    // شماره همراه کاربر که براش پیامک فرستادیم (مثلا 09179898057)
    public string PhoneNumber { get; set; } = string.Empty;

    // کد ۵ رقمی صادر شده که کاربر باید وارد کنه
    public string Code { get; set; } = string.Empty;

    // مهلت زمانی اعتبار کد (به وقت UTC)؛ مثلا ۲ دقیقه بعد از زمان تولید
    public DateTime ExpiresAt { get; set; }

    // آیا این کد قبلاً استفاده شده؟ اگر یکبار لاگین شد تیک می‌خوره تا بسوزه
    public bool IsUsed { get; set; } = false;

    // تاریخ و زمان دقیقی که کاربر با این کد لاگین کرد
    public DateTime? UsedAt { get; set; }

    // تعداد تلاش‌های ناموفق کاربر؛ برای اینکه جلوی بروت فورس رو بگیریم
    public int AttemptCount { get; set; } = 0;
}
