using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس بیزینس مدیریت والدین و دانش‌آموزان در پنل ادمین
// طبق اصول معماری تمیز، کنترلر فقط با این اینترفیس صحبت می‌کنه و از جزئیات خبر نداره
public interface IAdminParentService
{
    // دریافت لیست کلیه اولیا و سرپرستان به همراه آمار اجمالی کیف پول و فرزندان
    Task<List<AdminParentListItemDto>> GetAllParentsAsync();

    // دریافت اطلاعات دقیق و کامل یک والد به همراه مشخصات مدرسه‌ای و رژیمی فرزندان
    Task<AdminParentDetailDto?> GetParentDetailAsync(Guid parentId);

    // تغییر وضعیت فعال یا غیرفعال بودن حساب کاربری والد
    Task<bool> ToggleParentStatusAsync(Guid parentId);

    // فعال یا غیرفعال کردن وضعیت یک دانش‌آموز خاص
    Task<bool> ToggleChildStatusAsync(Guid childId);

    // اطمینان از وجود داده‌های اولیه اولیا و دانش‌آموزان برای نمایش کامل و دمو
    Task EnsureSeedParentsAndStudentsAsync();
}
