using ChildeFood.Domain.Common;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Domain.Entities;

// موجودیت غذای کودک؛ فقط فیلدهای دیتا بدون هیچ کار منطقی یا وابستگی بیرونی.
public class FoodItem : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int MinAgeMonths { get; set; } // حداقل سن مناسب کودک به ماه
    public FoodCategory Category { get; set; } = FoodCategory.Puree;
    public bool IsAvailable { get; set; } = true;
}