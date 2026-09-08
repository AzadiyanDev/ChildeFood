using ChildeFood.Domain.Common;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Domain.Entities;

// موجودیت آیتم غذایی؛ تعریف جامع غذاها به همراه مقادیر تغذیه‌ای، قیمت و برچسب‌های ظاهری.
public class FoodItem : BaseEntity
{
    // نام یا عنوان غذا (مثلاً چلو چنجه، برگر دوبل اسمش)
    public string Title { get; set; } = string.Empty;

    // توضیح مختصر زیر عنوان (مثلاً همراه با سالاد فصل و سس مخصوص)
    public string? Subtitle { get; set; }

    // قیمت پرس کامل به تومان
    public decimal Price { get; set; }

    // قیمت نیم‌پرس برای بچه‌های کوچکتر (اختیاری)
    public decimal? HalfPortionPrice { get; set; }

    // دسته‌بندی اصلی خوراکی (غذای اصلی، نوشیدنی، دسر، میان‌وعده)
    public FoodCategory Category { get; set; } = FoodCategory.Main;

    // متن بج و برچسب روی کارت (مثل "محبوب‌ترین"، "پیشنهاد سرآشپز")
    public string? BadgeText { get; set; }

    // استایل بج (مثلا popular, chef, discount, special)
    public string? BadgeType { get; set; }

    // ایموجی اختصاصی غذا برای نمایش فانتزی در اپ موبایل (مثل 🍔، 🍕)
    public string? Emoji { get; set; }

    // آدرس تصویر باکیفیت غذا
    public string? ImageUrl { get; set; }

    // کالری بر حسب کیلوکالری
    public int Calories { get; set; }

    // میزان پروتئین بر حسب گرم
    public int Protein { get; set; }

    // میزان کربوهیدرات بر حسب گرم
    public int Carbs { get; set; }

    // میزان چربی بر حسب گرم
    public int Fat { get; set; }

    // ترکیبات و مواد تشکیل‌دهنده غذا (مثلاً گوشت گرم، پنیر، گوجه، نان جو)
    public string? Ingredients { get; set; }

    // هشدارهای حساسیتی (مثلاً شامل گلوتن، لبنیات، تخم‌مرغ)
    public string? Allergens { get; set; }

    // آیا در حال حاضر این غذا قابل سفارش است یا تموم شده؟
    public bool IsAvailable { get; set; } = true;

    // ناوبری: روزهایی که این غذا در مدارس سرو میشه
    public ICollection<DailyMealSchedule> MealSchedules { get; set; } = new List<DailyMealSchedule>();

    // ناوبری: آیتم‌های سفارش که به این غذا ارجاع دارن
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}