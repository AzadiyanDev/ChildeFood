using ChildeFood.Domain.Enums;

namespace ChildeFood.Application.DTOs;

// وقتی می‌خوایم یه غذای جدید به منو اضافه کنیم، این دیتاها رو از فرانت می‌گیریم.
public class CreateFoodItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MinAgeMonths { get; set; }
    public FoodCategory Category { get; set; } = FoodCategory.Puree;
}