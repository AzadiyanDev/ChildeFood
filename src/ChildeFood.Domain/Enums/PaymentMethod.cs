namespace ChildeFood.Domain.Enums;

// روش‌های پرداخت هزینه سفارش؛ یا از کیف پول چایلدفود یا مستقیم آنلاین از درگاه بانکی.
public enum PaymentMethod
{
    Wallet = 1,     // پرداخت از شارژ کیف پول
    Online = 2      // پرداخت اینترنتی مستقیم
}
