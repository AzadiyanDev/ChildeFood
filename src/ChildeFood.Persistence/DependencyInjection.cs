using ChildeFood.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChildeFood.Persistence;

// اینجا DbContext رو رجیستر می‌کنیم؛ اگر کانکشن‌استرینگ نبود هم به صورت این‌مموری کار می‌کنه تا بدون دیتابیس هم تست بشه.
public static class DependencyInjection
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ChildeFoodDbContext>(options =>
        {
            if (!string.IsNullOrEmpty(connectionString))
            {
                options.UseSqlServer(connectionString);
            }
            else
            {
                // برای این که در محیط دمو بدون ستاپ سنگین اس‌کیو‌ال اجرا بشه
                options.UseInMemoryDatabase("ChildeFoodDb");
            }
        });

        return services;
    }
}