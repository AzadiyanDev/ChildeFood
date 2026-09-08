using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// دی‌تی‌او برای افزودن غذای جدید به سیستم توسط آشپزخانه یا مدیر سامانه.
public class CreateFoodItemDto
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public decimal Price { get; set; }
    public decimal? HalfPortionPrice { get; set; }
    public FoodCategory Category { get; set; } = FoodCategory.Main;
    public string? BadgeText { get; set; }
    public string? BadgeType { get; set; }
    public string? Emoji { get; set; }
    public string? ImageUrl { get; set; }
    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    public string? Ingredients { get; set; }
    public string? Allergens { get; set; }
}