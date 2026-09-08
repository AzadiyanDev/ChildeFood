using ChildeFood.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ChildeFood.Persistence.Data;

// کانتکست اصلی دیتابیس پروژه‌مون؛ از IdentityDbContext با کلید Guid ارث می‌بره تا جدول‌های کاربران و تمام جداول بیزینس یکجا مدیریت بشن.
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // ثبت کلیه جداول و DbSetهای ده‌گانه طبق نیازمندی تسک ۳
    public DbSet<Child> Children => Set<Child>();
    public DbSet<School> Schools => Set<School>();
    public DbSet<FoodItem> FoodItems => Set<FoodItem>();
    public DbSet<DailyMealSchedule> DailyMealSchedules => Set<DailyMealSchedule>();
    public DbSet<SchoolOrder> SchoolOrders => Set<SchoolOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // حتما اول base رو صدا می‌زنیم تا جداول پیش‌فرض Identity مثل Users و Roles درست رجیستر بشن
        base.OnModelCreating(builder);

        // تمیز کردن نام جدول‌های آیدنتیتی تا توی دیتابیس با پیشوند نامناسب نباشن
        builder.Entity<ApplicationUser>(b => b.ToTable("Users"));
        builder.Entity<IdentityRole<Guid>>(b => b.ToTable("Roles"));
        builder.Entity<IdentityUserRole<Guid>>(b => b.ToTable("UserRoles"));
        builder.Entity<IdentityUserClaim<Guid>>(b => b.ToTable("UserClaims"));
        builder.Entity<IdentityUserLogin<Guid>>(b => b.ToTable("UserLogins"));
        builder.Entity<IdentityRoleClaim<Guid>>(b => b.ToTable("RoleClaims"));
        builder.Entity<IdentityUserToken<Guid>>(b => b.ToTable("UserTokens"));

        // لود کردن تمام کانفیگ‌های Fluent API موجود در این اسمبلی به صورت خودکار
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
