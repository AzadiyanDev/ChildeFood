using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.Interfaces;

// اینترفیس ریپازیتوری غذاها؛ واکشی غذاهای فعال، فیلتر دسته‌بندی و بررسی غذاهای موجود در منو.
public interface IFoodRepository : IGenericRepository<FoodItem>
{
    // دریافت غذاهای در دسترس و فعال در سیستم
    Task<IReadOnlyList<FoodItem>> GetAvailableFoodsAsync(CancellationToken cancellationToken = default);

    // فیلتر کردن غذاها بر اساس دسته‌بندی (اصلی، نوشیدنی، دسر، اسنک)
    Task<IReadOnlyList<FoodItem>> GetByCategoryAsync(FoodCategory category, CancellationToken cancellationToken = default);
}
