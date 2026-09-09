using System.Globalization;
using System.Text;
using ChildeFood.Application.DTOs;
using ChildeFood.Application.Interfaces;
using ChildeFood.Domain.Entities;
using ChildeFood.Domain.Enums;
using ChildeFood.Persistence.Data;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ChildeFood.Infrastructure.Services;

// سرویس اصلی تولید آمار و گزارش‌های مدیریتی؛
// تولید مستقیم فایل‌های استاندارد اکسل (xlsx) با پکیج ClosedXML و پی‌دی‌اف واقعی با پکیج QuestPDF
public class AdminReportService : IAdminReportService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<AdminReportService> _logger;

    public AdminReportService(ApplicationDbContext db, ILogger<AdminReportService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ─── دریافت اطلاعات جامع آمار و گزارش با انواع فیلترها ─────────────────────────────
    public async Task<AdminReportResponseDto> GetReportDataAsync(AdminReportFilterDto filter)
    {
        _logger.LogInformation("در حال واکشی آمار و گزارشات با فیلتر زمانی: {TimeRange}", filter.TimeRange);

        // واکشی لیست مدارس و غذاها جهت فیلتر
        var schools = await _db.Schools
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new ReportFilterOptionDto
            {
                Id = s.Id,
                Title = s.Name,
                Subtitle = s.Address
            })
            .ToListAsync();

        var foods = await _db.FoodItems
            .AsNoTracking()
            .Where(f => f.IsAvailable)
            .OrderBy(f => f.Title)
            .Select(f => new ReportFilterOptionDto
            {
                Id = f.Id,
                Title = f.Title,
                Subtitle = f.Category == FoodCategory.Main ? "غذای اصلی" :
                           f.Category == FoodCategory.Drink ? "نوشیدنی" :
                           f.Category == FoodCategory.Dessert ? "دسر" : "میان‌وعده"
            })
            .ToListAsync();

        // کوئری اصلی سفارشات با فرانت و ناوبری‌ها
        var query = _db.SchoolOrders
            .AsNoTracking()
            .Include(o => o.Child)
                .ThenInclude(c => c!.School)
            .Include(o => o.Parent)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.FoodItem)
            .AsQueryable();

        var today = DateOnly.FromDateTime(DateTime.Today);

        // ۱. فیلتر زمانی
        string timeFilterLabel = "کل سفارشات ثبت‌شده";
        switch (filter.TimeRange?.ToLowerInvariant())
        {
            case "today":
                query = query.Where(o => o.ServingDate == today);
                timeFilterLabel = $"امروز ({FormatPersianDate(today)})";
                break;

            case "week":
                var weekAgo = today.AddDays(-6);
                query = query.Where(o => o.ServingDate >= weekAgo && o.ServingDate <= today);
                timeFilterLabel = $"هفته اخیر (از {FormatPersianDate(weekAgo)} تا {FormatPersianDate(today)})";
                break;

            case "month":
                var monthAgo = today.AddDays(-29);
                query = query.Where(o => o.ServingDate >= monthAgo && o.ServingDate <= today);
                timeFilterLabel = $"یک ماه اخیر (از {FormatPersianDate(monthAgo)} تا {FormatPersianDate(today)})";
                break;

            case "custom":
                if (filter.FromDate.HasValue)
                {
                    query = query.Where(o => o.ServingDate >= filter.FromDate.Value);
                }
                if (filter.ToDate.HasValue)
                {
                    query = query.Where(o => o.ServingDate <= filter.ToDate.Value);
                }
                timeFilterLabel = "بازه انتخابی دلخواه";
                break;

            default:
                timeFilterLabel = "کل سفارشات بدون محدودیت زمانی";
                break;
        }

        // ۲. فیلتر مدرسه
        string schoolFilterLabel = "تمامی مدارس";
        if (filter.SchoolId.HasValue && filter.SchoolId.Value != Guid.Empty)
        {
            query = query.Where(o => o.Child != null && o.Child.SchoolId == filter.SchoolId.Value);
            var selectedSchool = schools.FirstOrDefault(s => s.Id == filter.SchoolId.Value);
            if (selectedSchool != null)
            {
                schoolFilterLabel = selectedSchool.Title;
            }
        }

        // ۳. فیلتر غذا
        string foodFilterLabel = "تمامی غذاها و منوها";
        if (filter.FoodItemId.HasValue && filter.FoodItemId.Value != Guid.Empty)
        {
            query = query.Where(o => o.OrderItems.Any(i => i.FoodItemId == filter.FoodItemId.Value));
            var selectedFood = foods.FirstOrDefault(f => f.Id == filter.FoodItemId.Value);
            if (selectedFood != null)
            {
                foodFilterLabel = selectedFood.Title;
            }
        }

        // ۴. فیلتر وضعیت
        if (filter.Status.HasValue)
        {
            query = query.Where(o => o.Status == filter.Status.Value);
        }

        // ۵. سرچ متنی (نام دانش‌آموز، والد، شماره تماس)
        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var q = filter.SearchQuery.Trim();
            query = query.Where(o =>
                (o.Child != null && o.Child.FullName.Contains(q)) ||
                (o.Parent != null && (o.Parent.FullName.Contains(q) || o.Parent.PhoneNumber!.Contains(q))));
        }

        var orders = await query
            .OrderByDescending(o => o.ServingDate)
            .ThenByDescending(o => o.CreatedAt)
            .ToListAsync();

        // شاخص‌های کلیدی (Overview)
        var totalOrdersCount = orders.Count;
        var totalPortionsCount = orders.SelectMany(o => o.OrderItems).Sum(i => i.Quantity);
        var totalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.FinalPayablePrice);
        var avgOrderVal = totalOrdersCount > 0 ? Math.Round(totalRevenue / totalOrdersCount, 0) : 0;

        var overview = new AdminReportOverviewDto
        {
            TotalOrders = totalOrdersCount,
            TotalPortions = totalPortionsCount,
            TotalRevenue = totalRevenue,
            AverageOrderValue = avgOrderVal,
            DeliveredOrdersCount = orders.Count(o => o.Status == OrderStatus.Delivered),
            PreparingOrdersCount = orders.Count(o => o.Status == OrderStatus.Preparing),
            PendingOrdersCount = orders.Count(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Paid),
            CancelledOrdersCount = orders.Count(o => o.Status == OrderStatus.Cancelled)
        };

        // تحلیل تفکیکی مدارس
        var schoolBreakdown = orders
            .Where(o => o.Child?.School != null)
            .GroupBy(o => new { o.Child!.SchoolId, o.Child.School!.Name })
            .Select(g =>
            {
                var ordersInSchool = g.ToList();
                var schoolRevenue = ordersInSchool.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.FinalPayablePrice);
                var pct = totalRevenue > 0 ? Math.Round((double)(schoolRevenue / totalRevenue) * 100, 1) : 0;

                return new AdminReportSchoolBreakdownDto
                {
                    SchoolId = g.Key.SchoolId,
                    SchoolName = g.Key.Name,
                    TotalOrders = ordersInSchool.Count,
                    TotalPortions = ordersInSchool.SelectMany(o => o.OrderItems).Sum(i => i.Quantity),
                    TotalAmount = schoolRevenue,
                    Percentage = pct
                };
            })
            .OrderByDescending(s => s.TotalAmount)
            .ToList();

        // تحلیل تفکیکی غذاها
        var allOrderItems = orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SelectMany(o => o.OrderItems)
            .ToList();

        var foodBreakdown = allOrderItems
            .GroupBy(i => new { i.FoodItemId, i.FoodTitle })
            .Select(g =>
            {
                var sample = g.First();
                var totalQty = g.Sum(x => x.Quantity);
                var fullQty = g.Where(x => x.Portion == PortionType.Full).Sum(x => x.Quantity);
                var halfQty = g.Where(x => x.Portion == PortionType.Half).Sum(x => x.Quantity);
                var foodTotalAmount = g.Sum(x => x.TotalPrice);
                var pct = totalPortionsCount > 0 ? Math.Round((double)totalQty / totalPortionsCount * 100, 1) : 0;

                return new AdminReportFoodBreakdownDto
                {
                    FoodItemId = g.Key.FoodItemId,
                    FoodTitle = string.IsNullOrWhiteSpace(g.Key.FoodTitle) ? (sample.FoodItem?.Title ?? "غذای ویژه") : g.Key.FoodTitle,
                    CategoryTitle = sample.FoodItem?.Category == FoodCategory.Drink ? "نوشیدنی" :
                                    sample.FoodItem?.Category == FoodCategory.Dessert ? "دسر" :
                                    sample.FoodItem?.Category == FoodCategory.Snack ? "میان‌وعده" : "غذای اصلی",
                    Emoji = sample.FoodItem?.Emoji ?? "🍱",
                    TotalPortions = totalQty,
                    FullPortions = fullQty,
                    HalfPortions = halfQty,
                    TotalAmount = foodTotalAmount,
                    Percentage = pct
                };
            })
            .OrderByDescending(f => f.TotalPortions)
            .ToList();

        // روند روزانه
        var dailyTrends = orders
            .GroupBy(o => o.ServingDate)
            .Select(g => new AdminReportDailyTrendDto
            {
                Date = g.Key,
                PersianDate = FormatPersianDate(g.Key),
                DayName = GetPersianDayName(g.Key),
                OrdersCount = g.Count(),
                PortionsCount = g.SelectMany(o => o.OrderItems).Sum(i => i.Quantity),
                TotalAmount = g.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.FinalPayablePrice)
            })
            .OrderBy(t => t.Date)
            .ToList();

        // لیست کامل سفارشات (بدون کد سفارش طبق درخواست صوتی کاربر)
        var mappedOrders = orders.Select(o =>
        {
            var itemsSummary = string.Join(" + ", o.OrderItems.Select(i =>
                $"{i.FoodTitle} ({i.Quantity} {(i.Portion == PortionType.Half ? "نیم‌پرس" : "پرس")})"));

            var statusTitle = o.Status switch
            {
                OrderStatus.Delivered => "تحویل شده",
                OrderStatus.Preparing => "در حال آماده‌سازی",
                OrderStatus.Paid => "پرداخت شده",
                OrderStatus.Pending => "در انتظار پرداخت",
                OrderStatus.Cancelled => "لغو شده",
                _ => "نامشخص"
            };

            var paymentTitle = o.PaymentMethod == PaymentMethod.Wallet ? "کیف پول اعتباری" : "درگاه بانکی شاپرک";

            return new AdminReportOrderItemDto
            {
                OrderId = o.Id,
                OrderCode = o.OrderCode,
                ServingDate = o.ServingDate,
                PersianDate = FormatPersianDate(o.ServingDate),
                ChildName = o.Child?.FullName ?? "دانش‌آموز نامشخص",
                Grade = o.Child?.Grade ?? "پایه نامشخص",
                SchoolName = o.Child?.School?.Name ?? "مدرسه ثبت‌نشده",
                ParentName = o.Parent?.FullName ?? "والد نامشخص",
                ParentPhoneNumber = o.Parent?.PhoneNumber ?? "-",
                FoodItemsSummary = string.IsNullOrWhiteSpace(itemsSummary) ? "سفارش غذای مدرسه" : itemsSummary,
                TotalPortions = o.OrderItems.Sum(i => i.Quantity),
                TotalAmount = o.FinalPayablePrice,
                Status = o.Status,
                StatusTitle = statusTitle,
                PaymentMethodTitle = paymentTitle,
                CreatedAt = o.CreatedAt
            };
        }).ToList();

        return new AdminReportResponseDto
        {
            Overview = overview,
            SchoolBreakdown = schoolBreakdown,
            FoodBreakdown = foodBreakdown,
            DailyTrends = dailyTrends,
            Orders = mappedOrders,
            AvailableSchools = schools,
            AvailableFoods = foods,
            AppliedFilterDescription = $"{timeFilterLabel} | {schoolFilterLabel} | {foodFilterLabel}"
        };
    }

    // ─── تولید واقعی فایل اکسل استاندارد (.xlsx) با پکیج ClosedXML ─────────────
    public async Task<(byte[] FileBytes, string FileName, string ContentType)> GenerateExcelReportAsync(AdminReportFilterDto filter)
    {
        var data = await GetReportDataAsync(filter);

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("گزارش سفارشات");
        ws.RightToLeft = true;

        // ۱. هدر اصلی و عنوان
        ws.Cell(1, 1).Value = "سامانه هوشمند مدیریت تغذیه مدارس (چایلد فود)";
        ws.Range(1, 1, 1, 9).Merge()
            .Style.Font.SetBold()
            .Font.SetFontSize(15)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0f172a"))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        ws.Row(1).Height = 35;

        // ۲. توضیحات فیلتر اعمال‌شده
        ws.Cell(2, 1).Value = $"فیلتر گزارش: {data.AppliedFilterDescription} | تاریخ صدور: {FormatPersianDate(DateOnly.FromDateTime(DateTime.Today))} ساعت {DateTime.Now:HH:mm}";
        ws.Range(2, 1, 2, 9).Merge()
            .Style.Font.SetFontSize(10)
            .Font.SetFontColor(XLColor.FromHtml("#475569"))
            .Fill.SetBackgroundColor(XLColor.FromHtml("#f8fafc"))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        ws.Row(2).Height = 24;

        // ۳. کارت‌های خلاصه آماری (KPI)
        ws.Cell(4, 1).Value = "تعداد کل سفارشات:";
        ws.Cell(4, 2).Value = data.Overview.TotalOrders;
        ws.Cell(4, 3).Value = "کل پرس‌های غذا:";
        ws.Cell(4, 4).Value = data.Overview.TotalPortions;
        ws.Cell(4, 5).Value = "گردش مالی کل (تومان):";
        ws.Cell(4, 6).Value = data.Overview.TotalRevenue;
        ws.Cell(4, 7).Value = "میانگین فاکتور (تومان):";
        ws.Cell(4, 8).Value = data.Overview.AverageOrderValue;

        var kpiRange = ws.Range(4, 1, 4, 8);
        kpiRange.Style.Font.SetBold().Font.SetFontSize(10)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#f1f5f9"))
            .Border.SetOutsideBorder(XLBorderStyleValues.Thin);
        ws.Cell(4, 6).Style.NumberFormat.Format = "#,##0";
        ws.Cell(4, 8).Style.NumberFormat.Format = "#,##0";
        ws.Row(4).Height = 22;

        // ۴. هدر جدول داده‌ها — بدون کد سفارش طبق درخواست صوتی کاربر
        string[] headers = ["ردیف", "تاریخ تحویل", "دانش‌آموز", "پایه تحصیلی", "مدرسه", "سرپرست (والد)", "شماره تماس", "اقلام سفارش", "تعداد پرس", "مبلغ کل (تومان)", "وضعیت"];
        int startRow = 6;
        ws.Row(startRow).Height = 26;

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(startRow, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.SetBold().Font.SetFontSize(11).Font.SetFontColor(XLColor.White)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#1e293b"))
                .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin);
        }

        // ۵. ردیف‌های داده
        int currRow = startRow + 1;
        int rowNum = 1;
        foreach (var ord in data.Orders)
        {
            ws.Cell(currRow, 1).Value = rowNum;
            ws.Cell(currRow, 1).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            ws.Cell(currRow, 2).Value = ord.PersianDate;
            ws.Cell(currRow, 2).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            ws.Cell(currRow, 3).Value = ord.ChildName;
            ws.Cell(currRow, 4).Value = ord.Grade;
            ws.Cell(currRow, 5).Value = ord.SchoolName;
            ws.Cell(currRow, 6).Value = ord.ParentName;

            ws.Cell(currRow, 7).Value = ord.ParentPhoneNumber;
            ws.Cell(currRow, 7).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            ws.Cell(currRow, 8).Value = ord.FoodItemsSummary;

            ws.Cell(currRow, 9).Value = ord.TotalPortions;
            ws.Cell(currRow, 9).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            ws.Cell(currRow, 10).Value = ord.TotalAmount;
            ws.Cell(currRow, 10).Style.NumberFormat.Format = "#,##0";
            ws.Cell(currRow, 10).Style.Font.SetBold().Font.SetFontColor(XLColor.FromHtml("#059669"));

            ws.Cell(currRow, 11).Value = ord.StatusTitle;
            ws.Cell(currRow, 11).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            // رنگ یک‌درمیان ردیف‌ها
            var rowRange = ws.Range(currRow, 1, currRow, 11);
            if (rowNum % 2 == 0)
            {
                rowRange.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#f8fafc"));
            }
            rowRange.Style.Border.SetOutsideBorder(XLBorderStyleValues.Hair);
            rowRange.Style.Border.SetInsideBorder(XLBorderStyleValues.Hair);
            ws.Row(currRow).Height = 22;

            currRow++;
            rowNum++;
        }

        ws.Columns().AdjustToContents(10, 45);

        using var memoryStream = new MemoryStream();
        workbook.SaveAs(memoryStream);
        var fileBytes = memoryStream.ToArray();
        var fileName = $"ChildeFood_Orders_{DateOnly.FromDateTime(DateTime.Today):yyyyMMdd}_{DateTime.Now:HHmm}.xlsx";

        return (fileBytes, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    // ─── تولید واقعی فایل پی‌دی‌اف (.pdf) در سمت سرور با پکیج QuestPDF ─────────────
    public async Task<(byte[] FileBytes, string FileName, string ContentType)> GeneratePdfReportAsync(AdminReportFilterDto filter)
    {
        var data = await GetReportDataAsync(filter);

        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.5f, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontFamily("Tahoma").FontSize(8));

                // هدر داکیومنت پی‌دی‌اف
                page.Header().Column(col =>
                {
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Column(c =>
                        {
                            c.Item().Text("سامانه مدیریت تغذیه هوشمند مدارس (چایلد فود)")
                                .Bold().FontSize(14).FontColor(Colors.Grey.Darken4);
                            c.Item().Text($"گزارش سفارشات و تحلیل مالی • {data.AppliedFilterDescription}")
                                .FontSize(9).FontColor(Colors.Grey.Darken2);
                        });

                        r.AutoItem().Column(c =>
                        {
                            c.Item().Text($"تاریخ گزارش: {FormatPersianDate(DateOnly.FromDateTime(DateTime.Today))}")
                                .FontSize(8).FontColor(Colors.Grey.Darken2);
                            c.Item().Text($"ساعت صدور: {DateTime.Now:HH:mm}")
                                .FontSize(8).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    col.Item().PaddingTop(6).PaddingBottom(10).Row(r =>
                    {
                        r.RelativeItem().Background(Colors.Grey.Lighten4).Padding(6).Column(c =>
                        {
                            c.Item().Text("کل سفارشات").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{data.Overview.TotalOrders:N0}").Bold().FontSize(11).FontColor(Colors.Blue.Darken2);
                        });
                        r.RelativeItem().Background(Colors.Grey.Lighten4).Padding(6).Column(c =>
                        {
                            c.Item().Text("کل پرس غذا").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{data.Overview.TotalPortions:N0}").Bold().FontSize(11).FontColor(Colors.Purple.Darken2);
                        });
                        r.RelativeItem().Background(Colors.Grey.Lighten4).Padding(6).Column(c =>
                        {
                            c.Item().Text("گردش مالی کل").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{data.Overview.TotalRevenue:N0} تومان").Bold().FontSize(11).FontColor(Colors.Green.Darken2);
                        });
                        r.RelativeItem().Background(Colors.Grey.Lighten4).Padding(6).Column(c =>
                        {
                            c.Item().Text("میانگین فاکتور").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"{data.Overview.AverageOrderValue:N0} تومان").Bold().FontSize(11).FontColor(Colors.Orange.Darken2);
                        });
                    });
                });

                // جدول پی‌دی‌اف — بدون کد سفارش طبق درخواست کاربر
                page.Content().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(24);   // #
                        columns.ConstantColumn(60);   // Date
                        columns.RelativeColumn(1.8f); // Student & Grade
                        columns.RelativeColumn(2.5f); // School
                        columns.RelativeColumn(2f);   // Parent & Phone
                        columns.RelativeColumn(3.5f); // Food items
                        columns.ConstantColumn(35);   // Portions
                        columns.RelativeColumn(1.8f); // Price
                        columns.RelativeColumn(1.6f); // Status
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("#").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("تاریخ").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("دانش‌آموز").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("مدرسه").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("سرپرست").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("اقلام سفارش").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("پرس").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("مبلغ (تومان)").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Grey.Darken3).Padding(4).AlignCenter().Text("وضعیت").FontColor(Colors.White).Bold();
                    });

                    int idx = 1;
                    foreach (var ord in data.Orders)
                    {
                        var bg = idx % 2 == 0 ? Colors.Grey.Lighten5 : Colors.White;
                        table.Cell().Background(bg).Padding(3).AlignCenter().Text(idx.ToString());
                        table.Cell().Background(bg).Padding(3).AlignCenter().Text(ord.PersianDate);
                        table.Cell().Background(bg).Padding(3).Text($"{ord.ChildName}\n{ord.Grade}");
                        table.Cell().Background(bg).Padding(3).Text(ord.SchoolName);
                        table.Cell().Background(bg).Padding(3).Text($"{ord.ParentName}\n{ord.ParentPhoneNumber}");
                        table.Cell().Background(bg).Padding(3).Text(ord.FoodItemsSummary);
                        table.Cell().Background(bg).Padding(3).AlignCenter().Text(ord.TotalPortions.ToString()).Bold();
                        table.Cell().Background(bg).Padding(3).AlignCenter().Text($"{ord.TotalAmount:N0}").Bold();
                        table.Cell().Background(bg).Padding(3).AlignCenter().Text(ord.StatusTitle);
                        idx++;
                    }
                });

                // فوتر با شماره صفحه
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("صفحه ");
                    x.CurrentPageNumber();
                    x.Span(" از ");
                    x.TotalPages();
                });
            });
        });

        var pdfBytes = document.GeneratePdf();
        var fileName = $"ChildeFood_Orders_{DateOnly.FromDateTime(DateTime.Today):yyyyMMdd}_{DateTime.Now:HHmm}.pdf";

        return (pdfBytes, fileName, "application/pdf");
    }

    // توابع قالب‌بندی تاریخ شمسی
    private static string FormatPersianDate(DateOnly date)
    {
        var pc = new PersianCalendar();
        var dt = date.ToDateTime(TimeOnly.MinValue);
        return $"{pc.GetYear(dt)}/{pc.GetMonth(dt):00}/{pc.GetDayOfMonth(dt):00}";
    }

    private static string GetPersianDayName(DateOnly date)
    {
        var dt = date.ToDateTime(TimeOnly.MinValue);
        return dt.DayOfWeek switch
        {
            DayOfWeek.Saturday => "شنبه",
            DayOfWeek.Sunday => "یکشنبه",
            DayOfWeek.Monday => "دوشنبه",
            DayOfWeek.Tuesday => "سه‌شنبه",
            DayOfWeek.Wednesday => "چهارشنبه",
            DayOfWeek.Thursday => "پنج‌شنبه",
            DayOfWeek.Friday => "جمعه",
            _ => "-"
        };
    }
}
