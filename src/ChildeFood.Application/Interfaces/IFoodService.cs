using ChildeFood.Application.DTOs;

namespace ChildeFood.Application.Interfaces;

// قرارداد سرویس غذاها؛ اینترفیس اینجاست تا کنترلر به پیاده‌سازی وابسته نباشه و لاجیک بره تو اینفرا.
public interface IFoodService
{
    Task<IEnumerable<FoodItemDto>> GetAllFoodsAsync(CancellationToken cancellationToken = default);
    Task<FoodItemDto?> GetFoodByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<FoodItemDto> CreateFoodAsync(CreateFoodItemDto dto, CancellationToken cancellationToken = default);
}