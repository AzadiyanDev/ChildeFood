using ChildeFood.Domain.Common;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Domain.Entities;

// ردیف اقلام یک سفارش؛ مشخص می‌کنه توی این سفارش چه غذاهایی، با چه حجمی و به چه قیمتی ثبت شدن.
public class OrderItem : BaseEntity
{
    // شناسه سفارشی که این آیتم متعلق به اونه
    public Guid OrderId { get; set; }

    // شناسه غذایی که سفارش داده شده
    public Guid FoodItemId { get; set; }

    // عنوان غذا در زمان ثبت سفارش (تا در صورت تغییر نام غذا در آینده، فاکتور دست‌نخورده بمونه)
    public string FoodTitle { get; set; } = string.Empty;

    // نوع پرس انتخابی (پرس کامل یا نیم‌پرس)
    public PortionType Portion { get; set; } = PortionType.Full;

    // تعداد پرس‌های درخواستی
    public int Quantity { get; set; } = 1;

    // قیمت واحد غذا در لحظه خرید
    public decimal UnitPrice { get; set; }

    // قیمت کل این ردیف (تعداد ضرب در قیمت واحد)
    public decimal TotalPrice { get; set; }

    // ناوبری: سفارشی که این آیتم جزئی از اونه
    public SchoolOrder? Order { get; set; }

    // ناوبری: غذای اصلی انتخاب شده
    public FoodItem? FoodItem { get; set; }
}
