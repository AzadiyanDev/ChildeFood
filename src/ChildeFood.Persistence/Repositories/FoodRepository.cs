using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Repositories;

// ریپازیتوری غذاها؛ فیلتر کردن غذاهای در دسترس و لود دسته‌بندی‌ها به صورت AsNoTracking برای نهایت سرعت.
public class FoodRepository : GenericRepository<FoodItem>, IFoodRepository
{
    public FoodRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<FoodItem>> GetAvailableFoodsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(f => f.IsAvailable)
            .OrderBy(f => f.Category)
            .ThenBy(f => f.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FoodItem>> GetByCategoryAsync(FoodCategory category, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(f => f.Category == category && f.IsAvailable)
            .OrderBy(f => f.Title)
            .ToListAsync(cancellationToken);
    }
}
