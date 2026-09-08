using ChildeFood.Application;
using ChildeFood.Application.Interfaces;
using ChildeFood.Infrastructure;
using ChildeFood.Persistence;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ۱. رجیستر کردن لایه‌های معماری تمیز در کانتینر DI
builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices();

// ۲. تنظیمات کنترلرهای وب
builder.Services.AddControllers();

// ۳. فعال‌سازی داکیومنت OpenAPI
builder.Services.AddOpenApi();

// ۴. تنظیم CORS برای ارتباط راحت سرور دات‌نت با فرانت‌اند انگولار در حالت دولوپمنت
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// اطمینان از پاکسازی دیتای خراب و سیدینگ خودکار دیتابیس در زمان استارت
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var schoolService = services.GetRequiredService<ISchoolService>();
        await schoolService.SeedDefaultSchoolsAsync();

        var foodService = services.GetRequiredService<IFoodService>();
        await foodService.SeedComprehensiveFoodCatalogAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "خطا در بررسی و سیدینگ اولیه داده‌های دیتابیس");
    }
}

// ۵. پایپ‌لاین ریکوئست‌ها
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthorization();

// مپ کردن اندپوینت‌های کنترلرها
app.MapControllers();

// ۶. سرو کردن فایل‌های آپلود شده کاربران (آواتارها و تصاویر)
var uploadsDir = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsDir))
{
    Directory.CreateDirectory(uploadsDir);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsDir),
    RequestPath = "/uploads"
});

// ۷. سرو کردن ویوی انگولار از پوشه dist با هدرهای قوی ضد کش برای نمایش قطعی آخرین تغییرات
var clientAppDist = Path.Combine(builder.Environment.ContentRootPath, "ClientApp", "dist", "app", "browser");
if (Directory.Exists(clientAppDist))
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(clientAppDist)
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(clientAppDist),
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
            ctx.Context.Response.Headers.Append("Pragma", "no-cache");
            ctx.Context.Response.Headers.Append("Expires", "0");
        }
    });

    // روت فال‌بک برای SPA انگولار
    app.MapFallback(async context =>
    {
        context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
        context.Response.Headers.Append("Pragma", "no-cache");
        context.Response.Headers.Append("Expires", "0");
        var indexPath = Path.Combine(clientAppDist, "index.html");
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(indexPath);
    });
}

app.Run();