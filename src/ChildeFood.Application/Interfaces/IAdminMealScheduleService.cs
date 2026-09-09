using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// اینترفیس سرویس مدیریت برنامه غذایی روزانه توی پنل ادمین
public interface IAdminMealScheduleService
{
    // لیست روزها رو برای نوار تقویم برمیگردونه (از date شروع تا date+days روز)
    Task<List<AdminCalendarDayDto>> GetCalendarDaysAsync(DateOnly from, int days = 31);

    // غذاهای برنامه‌ریزی شده یک روز خاص رو میاره
    Task<List<ScheduledMealItemDto>> GetDayScheduleAsync(DateOnly date, Guid? schoolId = null);

    // همه غذاهای موجود رو برای مودال سلکت میاره
    Task<List<FoodItemPickerDto>> GetAllFoodItemsAsync();

    // غذاهای انتخابی رو به یه روز اضافه می‌کنه
    Task AddMealsToScheduleAsync(AddMealsToScheduleDto dto);

    // یه آیتم رو از برنامه روز حذف می‌کنه
    Task RemoveMealFromScheduleAsync(Guid scheduleId);
}
