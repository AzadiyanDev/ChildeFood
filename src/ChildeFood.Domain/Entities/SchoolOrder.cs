using ChildeFood.Domain.Common;
using ChildeFood.Domain.Enums;

namespace ChildeFood.Domain.Entities;

// موجودیت اصلی سفارش مدرسه؛ هر ردیف نشون‌دهنده یک سفارش ثبت شده توسط والد برای فرزند در یک روز مشخصه.
public class SchoolOrder : BaseEntity
{
    // کد یکتای سفارش برای پیگیری کاربر (مثلاً ORD-14030616-001)
    public string OrderCode { get; set; } = string.Empty;

    // شناسه والدی که سفارش رو ثبت کرده
    public Guid ParentId { get; set; }

    // شناسه فرزندی که غذا براش تحویل میشه
    public Guid ChildId { get; set; }

    // تاریخ روزی که قرار است ناهار در مدرسه تحویل و سرو شود
    public DateOnly ServingDate { get; set; }

    // ساعت تحویل ناهار (معمولاً طبق زمان ناهار مدرسه، مثلاً ۱۲:۳۰)
    public string DeliveryTime { get; set; } = "12:30";

    // مبلغ کل ناخالص غذاها قبل از هرگونه تخفیف
    public decimal TotalRawPrice { get; set; }

    // مبلغ تخفیف اعمال شده (از طریق کوپن یا پروموشن)
    public decimal DiscountAmount { get; set; }

    // مبلغ نهایی و قابل پرداخت توسط کاربر بعد از اعمال تخفیف
    public decimal FinalPayablePrice { get; set; }

    // نحوه پرداخت (کیف پول یا درگاه آنلاین)
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Wallet;

    // وضعیت پردازش و تحویل سفارش
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    // کد رهگیری بانکی یا پیگیری سیستمی
    public string? TrackingCode { get; set; }

    // کد کوپن تخفیف در صورت استفاده
    public string? CouponCode { get; set; }

    // ناوبری: والدی که سفارش را ثبت کرده
    public ApplicationUser? Parent { get; set; }

    // ناوبری: فرزندی که سفارش متعلق به اوست
    public Child? Child { get; set; }

    // ناوبری: ردیف‌های اقلام داخل این سفارش
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
