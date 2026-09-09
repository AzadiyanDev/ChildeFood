import {CommonModule} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  AdminReportFilter,
  AdminReportResponse,
  AdminReportService
} from '../../services/admin-report.service';

export interface FoodDonutSlice {
  title: string;
  emoji: string;
  category: string;
  portions: number;
  amount: number;
  percentage: number;
  color: string;
  strokeDasharray: string;
  strokeDashoffset: number;
}

export interface DailyTrendBar {
  date: string;
  persianDate: string;
  dayName: string;
  ordersCount: number;
  portionsCount: number;
  totalAmount: number;
  heightPercent: number;
}

// پالت رنگی استاندارد و بسیار جذاب برای تکه‌های نمودار دوناتی غذاها
const DONUT_COLORS = [
  '#FF6B3D', // نارنجی امضای چایلدفود
  '#8B5CF6', // بنفش متالیک
  '#10B981', // سبز زمردی
  '#3B82F6', // آبی رویال
  '#F59E0B', // کهربایی پررنگ
  '#EC4899', // صورتی ملایم
  '#6366F1'  // ایندیگو
];

// کامپوننت بازطراحی‌شده کامل آمار و گزارش‌های مدیریتی؛
// دارای نمودار دوناتی چندرنگ چندبخشی، نمودارهای میله‌ای تحلیلی عملکرد مدارس و روزانه، و جدول فوق‌العاده شکیل
@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.html',
})
export class AdminReports implements OnInit {
  private readonly reportService = inject(AdminReportService);

  // حالت‌های فیلتر انتخابی
  readonly timeRange = signal<'all' | 'week' | 'month' | 'today'>('all');
  readonly selectedSchoolId = signal<string>('');
  readonly selectedFoodId = signal<string>('');
  readonly selectedStatus = signal<number | null>(null);
  readonly searchQuery = signal<string>('');

  // داده‌های گزارش واکشی‌شده از دیتابیس لوکال
  readonly reportData = signal<AdminReportResponse | null>(null);
  readonly loading = signal<boolean>(true);

  // اسلایس فعال نمودار دونات در زمان هاور
  readonly hoveredDonutIndex = signal<number | null>(null);

  // محیط دایره دونات برای محاسبات SVG (شعاع ۷۴ پیکسل)
  readonly donutRadius = 74;
  readonly donutCircumference = 2 * Math.PI * 74; // ~464.95

  // محاسبه تکه‌های چندرنگ نمودار دوناتی غذاها به صورت ری‌اکتیو
  readonly foodDonutSlices = computed<FoodDonutSlice[]>(() => {
    const data = this.reportData();
    if (!data || !data.foodBreakdown || data.foodBreakdown.length === 0) return [];

    const topFoods = data.foodBreakdown.slice(0, 6);
    let accumulatedLength = 0;

    return topFoods.map((f, idx) => {
      const color = DONUT_COLORS[idx % DONUT_COLORS.length];
      const sliceLength = (f.percentage / 100) * this.donutCircumference;
      const strokeDasharray = `${sliceLength} ${this.donutCircumference - sliceLength}`;
      const strokeDashoffset = -accumulatedLength;
      accumulatedLength += sliceLength;

      return {
        title: f.foodTitle,
        emoji: f.emoji,
        category: f.categoryTitle,
        portions: f.totalPortions,
        amount: f.totalAmount,
        percentage: f.percentage,
        color,
        strokeDasharray,
        strokeDashoffset
      };
    });
  });

  // محاسبه میله‌های روند روزانه سفارشات برای نمودار تحلیلی
  readonly dailyTrendBars = computed<DailyTrendBar[]>(() => {
    const data = this.reportData();
    if (!data || !data.dailyTrends || data.dailyTrends.length === 0) return [];

    const maxPortions = Math.max(...data.dailyTrends.map(d => d.portionsCount), 1);

    return data.dailyTrends.slice(-14).map(d => ({
      date: d.date,
      persianDate: d.persianDate,
      dayName: d.dayName,
      ordersCount: d.ordersCount,
      portionsCount: d.portionsCount,
      totalAmount: d.totalAmount,
      heightPercent: Math.max(14, Math.round((d.portionsCount / maxPortions) * 100))
    }));
  });

  ngOnInit(): void {
    this.loadReport();
  }

  // بارگذاری داده‌های گزارش از سرور دات‌نت با فیلترهای فعال
  async loadReport(): Promise<void> {
    this.loading.set(true);

    const filter: AdminReportFilter = {
      timeRange: this.timeRange(),
      schoolId: this.selectedSchoolId() || undefined,
      foodItemId: this.selectedFoodId() || undefined,
      status: this.selectedStatus() !== null ? this.selectedStatus()! : undefined,
      searchQuery: this.searchQuery() || undefined
    };

    try {
      const data = await this.reportService.getReportData(filter);
      this.reportData.set(data);
    } catch (error) {
      console.error('خطا در دریافت گزارش‌ها از دیتابیس:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // انتخاب بازه زمانی سریع (همه، هفته اخیر، یک ماه اخیر، امروز)
  setTimeRange(range: 'all' | 'week' | 'month' | 'today'): void {
    this.timeRange.set(range);
    this.loadReport();
  }

  // اعمال تغییر در فیلترهای کشویی (مدرسه، غذا، وضعیت)
  onFilterChange(): void {
    this.loadReport();
  }

  // جستجوی متنی با فشردن اینتر
  onSearchSubmit(): void {
    this.loadReport();
  }

  // پاک کردن تمام فیلترها و بازنشانی
  resetFilters(): void {
    this.timeRange.set('all');
    this.selectedSchoolId.set('');
    this.selectedFoodId.set('');
    this.selectedStatus.set(null);
    this.searchQuery.set('');
    this.loadReport();
  }

  // دانلود واقعی فایل اکسل (.xlsx) مستقیماً از بک‌اند با نام و آیکون رسمی
  downloadExcel(): void {
    const filter: AdminReportFilter = {
      timeRange: this.timeRange(),
      schoolId: this.selectedSchoolId() || undefined,
      foodItemId: this.selectedFoodId() || undefined,
      status: this.selectedStatus() !== null ? this.selectedStatus()! : undefined,
      searchQuery: this.searchQuery() || undefined
    };

    const url = this.reportService.getExcelDownloadUrl(filter);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // دانلود واقعی فایل پی‌دی‌اف (.pdf) تولید شده توسط QuestPDF در بک‌اند
  downloadPdf(): void {
    const filter: AdminReportFilter = {
      timeRange: this.timeRange(),
      schoolId: this.selectedSchoolId() || undefined,
      foodItemId: this.selectedFoodId() || undefined,
      status: this.selectedStatus() !== null ? this.selectedStatus()! : undefined,
      searchQuery: this.searchQuery() || undefined
    };

    const url = this.reportService.getPdfDownloadUrl(filter);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // فرمت ارقام و مبالغ به صورت استاندارد با جداکننده هزارگان
  formatNumber(val: number | undefined | null): string {
    if (val === undefined || val === null) return '۰';
    return Number(val).toLocaleString('fa-IR');
  }

  // کلاس‌های استایل وضعیت سفارش
  getStatusClass(status: number): string {
    switch (status) {
      case 4: // Delivered
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 3: // Preparing
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 2: // Paid
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 1: // Pending
        return 'bg-zinc-100 text-zinc-700 border-zinc-200/80';
      case 5: // Cancelled
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200/80';
    }
  }
}
