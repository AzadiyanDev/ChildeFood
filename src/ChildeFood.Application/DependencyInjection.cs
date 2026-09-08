using Microsoft.Extensions.DependencyInjection;

namespace ChildeFood.Application;

// متد اکستنشن برای رجیستر کردن نیازمندی‌های لایه اپلیکیشن توی کانتینر DI.
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // اینجا در صورت نیاز ابزارهایی مثل ولیدیتورها یا مپرها رجیستر میشن.
        return services;
    }
}