using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;

namespace ChildeFood.Infrastructure.Services;

// تمام منطق بیزینس و کارهای اصلی غذاها اینجاست؛ از یونیت آو ورک برای دسترسی به دیتا استفاده می‌کنیم تا کنترلر کاملاً سبک و دام بمونه.
public class FoodService : IFoodService
{
    private readonly IUnitOfWork _unitOfWork;

    public FoodService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<FoodItemDto>> GetAllFoodsAsync(CancellationToken cancellationToken = default)
    {
        // غذاهای فعال و در دسترس رو از ریپازیتوری لود می‌کنیم
        var foods = await _unitOfWork.Foods.GetAvailableFoodsAsync(cancellationToken);

        return foods.Select(f => new FoodItemDto
        {
            Id = f.Id,
            Title = f.Title,
            Subtitle = f.Subtitle,
            Price = f.Price,
            HalfPortionPrice = f.HalfPortionPrice,
            Category = f.Category,
            BadgeText = f.BadgeText,
            BadgeType = f.BadgeType,
            Emoji = f.Emoji,
            ImageUrl = f.ImageUrl,
            Calories = f.Calories,
            Protein = f.Protein,
            Carbs = f.Carbs,
            Fat = f.Fat,
            Ingredients = f.Ingredients,
            Allergens = f.Allergens,
            IsAvailable = f.IsAvailable
        });
    }

    public async Task<FoodItemDto?> GetFoodByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var food = await _unitOfWork.Foods.GetByIdAsync(id, cancellationToken);

        if (food is null)
            return null;

        return new FoodItemDto
        {
            Id = food.Id,
            Title = food.Title,
            Subtitle = food.Subtitle,
            Price = food.Price,
            HalfPortionPrice = food.HalfPortionPrice,
            Category = food.Category,
            BadgeText = food.BadgeText,
            BadgeType = food.BadgeType,
            Emoji = food.Emoji,
            ImageUrl = food.ImageUrl,
            Calories = food.Calories,
            Protein = food.Protein,
            Carbs = food.Carbs,
            Fat = food.Fat,
            Ingredients = food.Ingredients,
            Allergens = food.Allergens,
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
            Subtitle = dto.Subtitle?.Trim(),
            Price = dto.Price,
            HalfPortionPrice = dto.HalfPortionPrice,
            Category = dto.Category,
            BadgeText = dto.BadgeText?.Trim(),
            BadgeType = dto.BadgeType?.Trim(),
            Emoji = dto.Emoji?.Trim(),
            ImageUrl = dto.ImageUrl?.Trim(),
            Calories = dto.Calories,
            Protein = dto.Protein,
            Carbs = dto.Carbs,
            Fat = dto.Fat,
            Ingredients = dto.Ingredients?.Trim(),
            Allergens = dto.Allergens?.Trim(),
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Foods.AddAsync(newFood, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FoodItemDto
        {
            Id = newFood.Id,
            Title = newFood.Title,
            Subtitle = newFood.Subtitle,
            Price = newFood.Price,
            HalfPortionPrice = newFood.HalfPortionPrice,
            Category = newFood.Category,
            BadgeText = newFood.BadgeText,
            BadgeType = newFood.BadgeType,
            Emoji = newFood.Emoji,
            ImageUrl = newFood.ImageUrl,
            Calories = newFood.Calories,
            Protein = newFood.Protein,
            Carbs = newFood.Carbs,
            Fat = newFood.Fat,
            Ingredients = newFood.Ingredients,
            Allergens = newFood.Allergens,
            IsAvailable = newFood.IsAvailable
        };
    }
}