using ChildeFood.Application;
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

// در محیط دولوپمنت، اگر کاربر پورت ۵۱۰۹ رو باز کرد، اتوماتیک بره روی سرور زنده ۴۲۰۰ با هات‌ریلود
if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("http://127.0.0.1:4200"));
}

// ۶. سرو کردن ویوی انگولار برای محیط پروداکشن (در محیط دولوپمنت، سرور زنده با هات‌ریلود فعال است)
if (!app.Environment.IsDevelopment())
{
    var clientAppDist = Path.Combine(builder.Environment.ContentRootPath, "ClientApp", "dist", "app", "browser");
    if (Directory.Exists(clientAppDist))
    {
        app.UseDefaultFiles(new DefaultFilesOptions
        {
            FileProvider = new PhysicalFileProvider(clientAppDist)
        });

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(clientAppDist)
        });

        // روت فال‌بک برای SPA انگولار
        app.MapFallback(async context =>
        {
            var indexPath = Path.Combine(clientAppDist, "index.html");
            context.Response.ContentType = "text/html; charset=utf-8";
            await context.Response.SendFileAsync(indexPath);
        });
    }
}

app.Run();