using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Persistence.Data;
using ChildeFood.Persistence.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChildeFood.Persistence;

// رجیستر کردن سرویس‌های لایه دیتابیس در کانتینر DI؛ دیتابیس، آیدنتیتی، ریپازیتوری‌ها و یونیت آو ورک.
public static class PersistenceServiceRegistration
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (!string.IsNullOrEmpty(connectionString))
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                });
            }
            else
            {
                // در صورتی که کانکشن استرینگ نبود، برای تست از دیتابیس این‌مموری استفاده بشه
                options.UseInMemoryDatabase("ChildeFoodDb");
            }
        });

        // ثبت سیستم احراز هویت آیدنتیتی با کلید Guid برای کاربر و رول‌ها
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
            options.User.RequireUniqueEmail = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // ثبت ریپازیتوری جنریک و ریپازیتوری‌های اختصاصی
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IChildRepository, ChildRepository>();
        services.AddScoped<IFoodRepository, FoodRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IWalletRepository, WalletRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();

        // ثبت الگوی واحد کار (Unit Of Work)
        services.AddScoped<IUnitOfWork, ChildeFood.Persistence.UnitOfWork.UnitOfWork>();

        return services;
    }
}
