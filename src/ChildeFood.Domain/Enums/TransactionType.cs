namespace ChildeFood.Domain.Enums;

// نوع تراکنش مالی توی کیف پول؛ شارژ کردن، خرید غذا، یا برگشت وجه در صورت لغو سفارش.
public enum TransactionType
{
    Deposit = 1,    // شارژ یا واریز به کیف پول
    Purchase = 2,   // کسر بابت خرید غذا
    Refund = 3      // عودت وجه بعد از کنسل شدن
}
