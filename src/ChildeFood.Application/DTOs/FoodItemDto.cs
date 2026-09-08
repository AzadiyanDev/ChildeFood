using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// این دی‌تی‌او برای فرستادن اطلاعات غذا به کلاینته تا انتیتی مستقیم بیرون نره و دستکاری نشه.
public class FoodItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MinAgeMonths { get; set; }
    public FoodCategory Category { get; set; }
    public string CategoryTitle => Category switch
    {
        FoodCategory.Puree => "پوره و سرلاک",
        FoodCategory.Soup => "سوپ مقوی",
        FoodCategory.Snack => "میان‌وعده سالم",
        FoodCategory.MainDish => "غذای اصلی کودک",
        _ => "نامشخص"
    };
    public bool IsAvailable { get; set; }
}