namespace ChildeFood.Application.DTOs;

// دی‌تی‌او پیشنهاد غذای امروز؛ محبوب‌ترین و پرفروش‌ترین غذای منوی روزانه
public class FoodRecommendationDto
{
    // شناسه غذا
    public Guid Id { get; set; }

    // عنوان یا نام غذا (مثلاً چلو جوجه کباب زعفرانی)
    public string Title { get; set; } = string.Empty;

    // توضیح مختصر و جذاب درباره طبخ
    public string? Subtitle { get; set; }

    // قیمت پرس کامل به تومان
    public decimal Price { get; set; }

    // متن بج (مثل "محبوب بچه‌ها" یا "پیشنهاد سرآشپز")
    public string? BadgeText { get; set; }

    // نوع استایل بج
    public string? BadgeType { get; set; }

    // ایموجی غذا
    public string? Emoji { get; set; }

    // آدرس تصویر غذا
    public string? ImageUrl { get; set; }

    // کالری بر حسب کیلوکالری
    public int Calories { get; set; }

    // پروتئین به گرم
    public int Protein { get; set; }

    // کربوهیدرات به گرم
    public int Carbs { get; set; }

    // چربی به گرم
    public int Fat { get; set; }

    // ترکیبات اصلی
    public string? Ingredients { get; set; }

    // هشدارهای آلرژی
    public string? Allergens { get; set; }

    // تعداد سفارش‌های ثبت‌شده از این غذا
    public int OrdersCount { get; set; }
}
