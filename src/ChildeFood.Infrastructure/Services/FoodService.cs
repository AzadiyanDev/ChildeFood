using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Infrastructure.Services;

// تمام منطق بیزینس و کارهای اصلی غذاها اینجاست تا کنترلر سبک بمونه و کار اضافه نکنه.
public class FoodService : IFoodService
{
    private readonly ChildeFoodDbContext _context;

    public FoodService(ChildeFoodDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FoodItemDto>> GetAllFoodsAsync(CancellationToken cancellationToken = default)
    {
        // دیتابیس رو در صورت نیاز می‌سازیم تا بار اول خالی نباشه
        await _context.Database.EnsureCreatedAsync(cancellationToken);

        // دیتا رو با AsNoTracking می‌خونیم که پرفورمنس بالا باشه و الکی ترکینگ نخوره
        return await _context.FoodItems
            .AsNoTracking()
            .OrderBy(f => f.MinAgeMonths)
            .Select(f => new FoodItemDto
            {
                Id = f.Id,
                Title = f.Title,
                Description = f.Description,
                Price = f.Price,
                MinAgeMonths = f.MinAgeMonths,
                Category = f.Category,
                IsAvailable = f.IsAvailable
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<FoodItemDto?> GetFoodByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var food = await _context.FoodItems
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

        if (food is null)
            return null;

        return new FoodItemDto
        {
            Id = food.Id,
            Title = food.Title,
            Description = food.Description,
            Price = food.Price,
            MinAgeMonths = food.MinAgeMonths,
            Category = food.Category,
            IsAvailable = food.IsAvailable
        };
    }

    public async Task<FoodItemDto> CreateFoodAsync(CreateFoodItemDto dto, CancellationToken cancellationToken = default)
    {
        // اینجا اعتبارسنجی اولیه رو انجام می‌دیم تا دیتای خراب وارد دیتابیس نشه
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("عنوان غذا نمی‌تونه خالی باشه.");

        if (dto.Price <= 0)
            throw new ArgumentException("قیمت باید بزرگتر از صفر باشه.");

        var newFood = new FoodItem
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            MinAgeMonths = dto.MinAgeMonths,
            Category = dto.Category,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.FoodItems.AddAsync(newFood, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new FoodItemDto
        {
            Id = newFood.Id,
            Title = newFood.Title,
            Description = newFood.Description,
            Price = newFood.Price,
            MinAgeMonths = newFood.MinAgeMonths,
            Category = newFood.Category,
            IsAvailable = newFood.IsAvailable
        };
    }
}