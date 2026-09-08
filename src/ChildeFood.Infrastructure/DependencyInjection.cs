using ChildeFood.Application.Interfaces;
using ChildeFood.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ChildeFood.Infrastructure;

// اکستنشن متد برای ثبت سرویس‌های لایه زیرساخت
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        // حافظه موقت برای ذخیره کدهای اوتی‌پی
        services.AddMemoryCache();

        // لاجیک بیزینس غذا رو به اینترفیس متصل می‌کنیم
        services.AddScoped<IFoodService, FoodService>();

        // ثبت سرویس کاربران و احراز هویت
        services.AddScoped<IUserService, UserService>();

        // ثبت سرویس مدیریت مدارس برای سلکت‌باکس و ادمین
        services.AddScoped<ISchoolService, SchoolService>();

        // ثبت سرویس کیف پول برای تمام محاسبات مالی و تراکنش‌ها
        services.AddScoped<IWalletService, WalletService>();

        // ثبت سرویس سفارش‌ها برای واکشی سفارش‌های امروز و پیگیری
        services.AddScoped<IOrderService, OrderService>();

        return services;
    }
}