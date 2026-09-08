using ChildeFood.Application.Interfaces;
using ChildeFood.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace ChildeFood.Infrastructure;

// اکستنشن متد برای ثبت سرویس‌های لایه زیرساخت
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        // لاجیک بیزینس غذا رو به اینترفیس متصل می‌کنیم
        services.AddScoped<IFoodService, FoodService>();

        return services;
    }
}