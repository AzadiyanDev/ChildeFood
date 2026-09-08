using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// دی‌تی‌او انتقال دیتای غذا به سمت فرانت‌اند یا لایه‌های بالاتر بدون نشت مستقیم انتیتی دیتابیس.
public class FoodItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public decimal Price { get; set; }
    public decimal? HalfPortionPrice { get; set; }
    public FoodCategory Category { get; set; }
    public string CategoryTitle => Category switch
    {
        FoodCategory.Main => "غذای اصلی",
        FoodCategory.Drink => "نوشیدنی",
        FoodCategory.Dessert => "دسر",
        FoodCategory.Snack => "میان‌وعده",
        _ => "سایر"
    };
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
    public bool IsAvailable { get; set; }
}