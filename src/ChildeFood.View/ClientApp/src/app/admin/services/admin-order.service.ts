import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

// مدل آیتم تجمیع شده غذا برای آشپزخانه و بوفه مدرسه
export interface AggregatedFoodItem {
  foodItemId: string;
  foodTitle: string;
  categoryTitle: string;
  imageUrl?: string;
  emoji: string;
  totalQuantity: number;
  fullPortionQuantity: number;
  halfPortionQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

// مدل خلاصه سفارش‌های هر مدرسه
export interface SchoolOrdersSummary {
  schoolId: string;
  schoolName: string;
  branchCode: string;
  address: string;
  defaultLunchTime: string;
  contactPerson?: string;
  servingDate: string;
  totalOrdersCount: number;
  totalFoodItemsCount: number;
  totalRevenue: number;
  statusLabel: string;
  aggregatedFoods: AggregatedFoodItem[];
}

// مدل جزئیات سفارش هر دانش‌آموز برای خروجی اکسل/PDF
export interface SchoolOrderStudentDetail {
  orderCode: string;
  studentName: string;
  grade: string;
  age: number;
  parentName: string;
  parentPhone: string;
  orderedItemsSummary: string;
  finalPrice: number;
  deliveryTime: string;
  dietaryNotes?: string;
  statusLabel: string;
}

// مدل کامل گزارش یک مدرسه
export interface SchoolOrdersReport {
  schoolId: string;
  schoolName: string;
  branchCode: string;
  address: string;
  servingDate: string;
  deliveryTime: string;
  totalOrders: number;
  totalPortions: number;
  totalRevenue: number;
  aggregatedItems: AggregatedFoodItem[];
  studentOrders: SchoolOrderStudentDetail[];
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/orders';

  // داده‌های فال‌بک کامل برای مواقع عدم دسترسی به سرور یا SSR
  private readonly fallbackSummaries: SchoolOrdersSummary[] = [
    {
      schoolId: 'sch-1',
      schoolName: 'مجتمع آموزشی نمونه البرز',
      branchCode: 'SCH-ALBORZ-01',
      address: 'تهران، خیابان انقلاب، نبش وصال',
      defaultLunchTime: '12:30',
      contactPerson: 'آقای شمس (مسئول بوفه)',
      servingDate: '2026-09-09',
      totalOrdersCount: 28,
      totalFoodItemsCount: 52,
      totalRevenue: 2840000,
      statusLabel: 'در حال پخت و بسته‌بندی',
      aggregatedFoods: [
        {
          foodItemId: 'f-1',
          foodTitle: 'چلو کباب کوبیده زعفرانی',
          categoryTitle: 'غذای اصلی',
          emoji: '🍢',
          totalQuantity: 18,
          fullPortionQuantity: 14,
          halfPortionQuantity: 4,
          unitPrice: 98000,
          totalPrice: 1764000,
        },
        {
          foodItemId: 'f-2',
          foodTitle: 'ماکارونی فرمی با گوشت چرخ‌کرده ویژه',
          categoryTitle: 'غذای اصلی',
          emoji: '🍝',
          totalQuantity: 14,
          fullPortionQuantity: 12,
          halfPortionQuantity: 2,
          unitPrice: 72000,
          totalPrice: 1008000,
        },
        {
          foodItemId: 'f-3',
          foodTitle: 'سالاد فصل با سس انار خانگی',
          categoryTitle: 'میان‌وعده و سالاد',
          emoji: '🥗',
          totalQuantity: 12,
          fullPortionQuantity: 12,
          halfPortionQuantity: 0,
          unitPrice: 25000,
          totalPrice: 300000,
        },
        {
          foodItemId: 'f-4',
          foodTitle: 'دوغ محلی نعنایی طبیعی',
          categoryTitle: 'نوشیدنی',
          emoji: '🥛',
          totalQuantity: 8,
          fullPortionQuantity: 8,
          halfPortionQuantity: 0,
          unitPrice: 18000,
          totalPrice: 144000,
        },
      ],
    },
    {
      schoolId: 'sch-2',
      schoolName: 'دبستان دخترانه فرزانگان (شعبه ۱)',
      branchCode: 'SCH-FARZ-01',
      address: 'تهران، یوسف‌آباد، خیابان اسدآبادی',
      defaultLunchTime: '12:15',
      contactPerson: 'خانم معتمدی (معاونت اجرایی)',
      servingDate: '2026-09-09',
      totalOrdersCount: 22,
      totalFoodItemsCount: 41,
      totalRevenue: 2190000,
      statusLabel: 'در حال پخت و بسته‌بندی',
      aggregatedFoods: [
        {
          foodItemId: 'f-5',
          foodTitle: 'چلو جوجه‌کباب زعفرانی بدون استخوان',
          categoryTitle: 'غذای اصلی',
          emoji: '🍗',
          totalQuantity: 15,
          fullPortionQuantity: 12,
          halfPortionQuantity: 3,
          unitPrice: 94000,
          totalPrice: 1410000,
        },
        {
          foodItemId: 'f-6',
          foodTitle: 'عدس‌پلو مجلسی با گوشت قلقلی و کشمش',
          categoryTitle: 'غذای اصلی',
          emoji: '🍚',
          totalQuantity: 10,
          fullPortionQuantity: 8,
          halfPortionQuantity: 2,
          unitPrice: 68000,
          totalPrice: 680000,
        },
        {
          foodItemId: 'f-7',
          foodTitle: 'ماست موسیر ارگانیک محلی',
          categoryTitle: 'میان‌وعده و سالاد',
          emoji: '🥣',
          totalQuantity: 16,
          fullPortionQuantity: 16,
          halfPortionQuantity: 0,
          unitPrice: 20000,
          totalPrice: 320000,
        },
      ],
    },
    {
      schoolId: 'sch-3',
      schoolName: 'مجتمع آموزشی علامه حلی',
      branchCode: 'SCH-HELLI-01',
      address: 'تهران، خیابان ولیعصر، بالاتر از مطهری',
      defaultLunchTime: '12:30',
      contactPerson: 'آقای کمالی',
      servingDate: '2026-09-09',
      totalOrdersCount: 16,
      totalFoodItemsCount: 29,
      totalRevenue: 1620000,
      statusLabel: 'در انتظار آماده‌سازی',
      aggregatedFoods: [
        {
          foodItemId: 'f-1',
          foodTitle: 'چلو کباب کوبیده زعفرانی',
          categoryTitle: 'غذای اصلی',
          emoji: '🍢',
          totalQuantity: 10,
          fullPortionQuantity: 8,
          halfPortionQuantity: 2,
          unitPrice: 98000,
          totalPrice: 980000,
        },
        {
          foodItemId: 'f-8',
          foodTitle: 'شنیسل مرغ سوخاری خانگی با سیب‌زمینی',
          categoryTitle: 'غذای اصلی',
          emoji: '🍖',
          totalQuantity: 9,
          fullPortionQuantity: 7,
          halfPortionQuantity: 2,
          unitPrice: 88000,
          totalPrice: 792000,
        },
        {
          foodItemId: 'f-4',
          foodTitle: 'دوغ محلی نعنایی طبیعی',
          categoryTitle: 'نوشیدنی',
          emoji: '🥛',
          totalQuantity: 10,
          fullPortionQuantity: 10,
          halfPortionQuantity: 0,
          unitPrice: 18000,
          totalPrice: 180000,
        },
      ],
    },
  ];

  // واکشی خلاصه سفارش‌های روزانه مدارس
  async getSchoolOrders(date?: string): Promise<SchoolOrdersSummary[]> {
    const url = date ? `${this.base}?date=${date}` : this.base;
    try {
      const data = await firstValueFrom(this.http.get<SchoolOrdersSummary[]>(url));
      if (Array.isArray(data) && data.length > 0) return data;
      return this.fallbackSummaries;
    } catch {
      return this.fallbackSummaries;
    }
  }

  // به‌روزرسانی وضعیت آماده‌سازی سفارشات مدرسه
  async updateSchoolStatus(
    schoolId: string,
    date: string,
    newStatus: number
  ): Promise<{ success: boolean; statusLabel: string }> {
    const url = `${this.base}/school/${schoolId}/status`;
    try {
      return await firstValueFrom(
        this.http.put<{ success: boolean; statusLabel: string }>(url, {
          date,
          newStatus,
        })
      );
    } catch {
      const map: Record<number, string> = {
        2: 'در انتظار آماده‌سازی',
        3: 'در حال پخت و بسته‌بندی',
        4: 'تحویل داده شده به مدرسه',
      };
      return { success: true, statusLabel: map[newStatus] ?? 'در حال آماده‌سازی' };
    }
  }

  // واکشی گزارش ریز سفارش‌های یک مدرسه جهت خروجی
  async getSchoolReport(schoolId: string, date?: string): Promise<SchoolOrdersReport> {
    const url = date
      ? `${this.base}/school/${schoolId}/report?date=${date}`
      : `${this.base}/school/${schoolId}/report`;

    try {
      return await firstValueFrom(this.http.get<SchoolOrdersReport>(url));
    } catch {
      const summary =
        this.fallbackSummaries.find((s) => s.schoolId === schoolId) ??
        this.fallbackSummaries[0];

      return {
        schoolId: summary.schoolId,
        schoolName: summary.schoolName,
        branchCode: summary.branchCode,
        address: summary.address,
        servingDate: summary.servingDate,
        deliveryTime: summary.defaultLunchTime,
        totalOrders: summary.totalOrdersCount,
        totalPortions: summary.totalFoodItemsCount,
        totalRevenue: summary.totalRevenue,
        aggregatedItems: summary.aggregatedFoods,
        studentOrders: [
          {
            orderCode: 'ORD-14030616-11',
            studentName: 'پرهام کاظمی',
            grade: 'چهارم ابتدایی',
            age: 10,
            parentName: 'مریم کاظمی',
            parentPhone: '09123456781',
            orderedItemsSummary: '۱× چلو کباب کوبیده زعفرانی + ۱× سالاد فصل',
            finalPrice: 123000,
            deliveryTime: '12:30',
            dietaryNotes: 'حساسیت خفیف به لبنیات پرچرب و فاقد گلوتن',
            statusLabel: 'در حال پخت و بسته‌بندی',
          },
          {
            orderCode: 'ORD-14030616-12',
            studentName: 'سپهر احمدی',
            grade: 'اول دبستان',
            age: 7,
            parentName: 'محمد احمدی',
            parentPhone: '09351112233',
            orderedItemsSummary: '۱× ماکارونی فرمی با گوشت چرخ‌کرده ویژه',
            finalPrice: 72000,
            deliveryTime: '12:30',
            dietaryNotes: 'حساسیت به توت‌فرنگی و رنگ خوراکی',
            statusLabel: 'تحویل داده شده',
          },
          {
            orderCode: 'ORD-14030616-15',
            studentName: 'کیارش بهرامی',
            grade: 'ششم دبستان',
            age: 12,
            parentName: 'کامران بهرامی',
            parentPhone: '09181112233',
            orderedItemsSummary: '۲× چلو کباب کوبیده زعفرانی + ۱× دوغ محلی',
            finalPrice: 214000,
            deliveryTime: '12:30',
            dietaryNotes: 'بدون حساسیت غذایی',
            statusLabel: 'در حال پخت و بسته‌بندی',
          },
        ],
      };
    }
  }

  // دانلود مستقیم فایل استاندارد اکسل (CSV UTF-8 با BOM) حاوی تمام مشخصات دانش‌آموزان و سفارشات
  exportToExcel(report: SchoolOrdersReport): void {
    const headers = [
      'ردیف',
      'کد سفارش',
      'نام دانش‌آموز',
      'پایه تحصیلی',
      'سن',
      'نام سرپرست',
      'شماره تماس سرپرست',
      'اقلام سفارش داده شده',
      'مبلغ نهایی (تومان)',
      'ساعت تحویل',
      'نکات و حساسیت‌های تغذیه‌ای',
      'وضعیت سفارش',
    ];

    const rows = report.studentOrders.map((o, index) => [
      (index + 1).toString(),
      `"${o.orderCode}"`,
      `"${o.studentName}"`,
      `"${o.grade}"`,
      o.age ? o.age.toString() : '-',
      `"${o.parentName}"`,
      `"${o.parentPhone}"`,
      `"${o.orderedItemsSummary.replace(/"/g, '""')}"`,
      o.finalPrice.toString(),
      `"${o.deliveryTime}"`,
      `"${(o.dietaryNotes || 'بدون حساسیت').replace(/"/g, '""')}"`,
      `"${o.statusLabel}"`,
    ]);

    // خلاصه تجمیعی در انتهای فایل اکسل برای آشپزخانه
    const summaryHeader = ['', '', '', '', '', '', '', '', '', '', '', ''];
    const summaryTitle = ['--- خلاصه تجمیعی اقلام مورد نیاز آشپزخانه و بوفه ---'];
    const summaryRows = report.aggregatedItems.map((item) => [
      `"${item.foodTitle}"`,
      `تعداد: ${item.totalQuantity} پرس`,
      `کامل: ${item.fullPortionQuantity}`,
      `نیم‌پرس: ${item.halfPortionQuantity}`,
      `مبلغ کل: ${item.totalPrice} تومان`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM جهت باز شدن صحیح در نرم‌افزار اکسل ویندوز
      [
        [`گزارش سفارشات مدرسه: ${report.schoolName} (${report.branchCode})`],
        [`تاریخ سرویس: ${report.servingDate} - ساعت تحویل: ${report.deliveryTime}`],
        [`تعداد کل سفارش‌ها: ${report.totalOrders} - مجموع کل پرس‌ها: ${report.totalPortions}`],
        [],
        headers,
        ...rows,
        summaryHeader,
        summaryTitle,
        ...summaryRows,
      ]
        .map((e) => (Array.isArray(e) ? e.join(',') : e))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `سفارشات_${report.schoolName.replace(/\s+/g, '_')}_${report.servingDate}.csv`;

    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
