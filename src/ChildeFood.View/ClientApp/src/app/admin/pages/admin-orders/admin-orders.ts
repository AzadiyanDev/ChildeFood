import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
  AdminOrderService,
  SchoolOrdersReport,
  SchoolOrdersSummary,
} from '../../services/admin-order.service';

// کامپوننت مدیریت سفارش‌های مدارس در پنل ادمین
// با استایل مینیمال، مدرن، ردیف‌های آکاردئونی منظم و ۲ مودال مجزا:
// ۱. مودال تغییر وضعیت آماده‌سازی
// ۲. مودال جزئیات و دانلود اکسل / چاپ مانیفست
@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-orders.html',
})
export class AdminOrders implements OnInit {
  readonly service = inject(AdminOrderService);
  private readonly cdr = inject(ChangeDetectorRef);

  // وضعیت بارگذاری و لیست سفارش‌ها
  orders = signal<SchoolOrdersSummary[]>([]);
  isLoading = signal(false);

  // تاریخ انتخابی (پیش‌فرض امروز)
  selectedDate = signal<string>(new Date().toISOString().substring(0, 10));

  // کادر جستجو
  searchQuery = signal('');

  // شناسه‌های مدارسی که آکاردئون اقلامشان باز است
  expandedSchoolIds = signal<Set<string>>(new Set());

  // مودال ۱: تغییر وضعیت آماده‌سازی
  statusModalSchool = signal<SchoolOrdersSummary | null>(null);
  selectedNewStatus = signal<number>(3); // ۳ = در حال پخت و بسته‌بندی
  isSavingStatus = signal(false);
  saveStatusSuccess = signal(false);

  // مودال ۲: جزئیات جامع و مانیفست پرینت/دانلود
  detailsModalReport = signal<SchoolOrdersReport | null>(null);
  isLoadingDetails = signal(false);

  // گزینه‌های وضعیت آماده‌سازی
  readonly statusOptions = [
    {
      value: 2,
      label: 'در انتظار آماده‌سازی',
      desc: 'سفارش‌ها ثبت شده و در نوبت پخت آشپزخانه قرار دارند.',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      value: 3,
      label: 'در حال پخت و بسته‌بندی',
      desc: 'آشپزخانه در حال طبخ و بسته‌بندی پک‌های حرارتی است.',
      colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      value: 4,
      label: 'تحویل داده شده به مدرسه',
      desc: 'سفارشات توسط پیک به مسئول بوفه مدرسه تحویل داده شد.',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  // فیلتر مدارس بر اساس عبارت جستجو
  filteredSchools = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.orders();

    return this.orders().filter(
      (s) =>
        s.schoolName.toLowerCase().includes(q) ||
        s.branchCode.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  });

  // آمار کلی روز
  schoolsWithOrdersCount = computed(
    () => this.orders().filter((s) => s.totalOrdersCount > 0).length
  );
  totalOrdersCount = computed(() =>
    this.orders().reduce((acc, s) => acc + s.totalOrdersCount, 0)
  );
  totalPortionsCount = computed(() =>
    this.orders().reduce((acc, s) => acc + s.totalFoodItemsCount, 0)
  );
  totalRevenue = computed(() =>
    this.orders().reduce((acc, s) => acc + s.totalRevenue, 0)
  );

  async ngOnInit() {
    await this.loadOrders(this.selectedDate());
  }

  // واکشی داده‌ها از سرویس
  async loadOrders(date?: string) {
    this.isLoading.set(true);
    try {
      const data = await this.service.getSchoolOrders(date);
      this.orders.set(data);

      // به صورت پیش‌فرض اولین مدرسه‌ای که سفارش دارد باز باشد
      const firstWithOrders = data.find((s) => s.totalOrdersCount > 0);
      if (firstWithOrders) {
        this.expandedSchoolIds.set(new Set([firstWithOrders.schoolId]));
      }
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  // باز و بسته کردن آکاردئون اقلام مدرسه
  toggleExpand(schoolId: string) {
    this.expandedSchoolIds.update((current) => {
      const updated = new Set(current);
      if (updated.has(schoolId)) {
        updated.delete(schoolId);
      } else {
        updated.add(schoolId);
      }
      return updated;
    });
    this.cdr.markForCheck();
  }

  isExpanded(schoolId: string): boolean {
    return this.expandedSchoolIds().has(schoolId);
  }

  // ─── مودال ۱: تغییر وضعیت آماده‌سازی ───────────────────────────
  openStatusModal(school: SchoolOrdersSummary, event?: MouseEvent) {
    event?.stopPropagation();
    this.statusModalSchool.set(school);
    this.saveStatusSuccess.set(false);

    // تشخیص مقدار پیش‌فرض بر اساس لیبل فعلی
    if (school.statusLabel.includes('تحویل')) {
      this.selectedNewStatus.set(4);
    } else if (school.statusLabel.includes('پخت')) {
      this.selectedNewStatus.set(3);
    } else {
      this.selectedNewStatus.set(2);
    }
    this.cdr.markForCheck();
  }

  closeStatusModal() {
    this.statusModalSchool.set(null);
    this.cdr.markForCheck();
  }

  async saveSchoolStatus() {
    const school = this.statusModalSchool();
    if (!school) return;

    this.isSavingStatus.set(true);
    try {
      const res = await this.service.updateSchoolStatus(
        school.schoolId,
        this.selectedDate(),
        this.selectedNewStatus()
      );

      // به‌روزرسانی لحظه‌ای وضعیت در استیت
      this.orders.update((list) =>
        list.map((s) =>
          s.schoolId === school.schoolId
            ? { ...s, statusLabel: res.statusLabel }
            : s
        )
      );

      this.saveStatusSuccess.set(true);
      setTimeout(() => {
        this.closeStatusModal();
      }, 700);
    } finally {
      this.isSavingStatus.set(false);
      this.cdr.markForCheck();
    }
  }

  // ─── مودال ۲: جزئیات سفارشات و دانلود اکسل/PDF ─────────────────
  async openDetailsModal(school: SchoolOrdersSummary, event?: MouseEvent) {
    event?.stopPropagation();
    this.isLoadingDetails.set(true);
    this.cdr.markForCheck();

    try {
      const report = await this.service.getSchoolReport(
        school.schoolId,
        this.selectedDate()
      );
      if (report) {
        this.detailsModalReport.set(report);
      }
    } finally {
      this.isLoadingDetails.set(false);
      this.cdr.markForCheck();
    }
  }

  closeDetailsModal() {
    this.detailsModalReport.set(null);
    this.cdr.markForCheck();
  }

  // دانلود فایل اکسل (CSV UTF-8)
  downloadExcelFromModal() {
    const report = this.detailsModalReport();
    if (report) {
      this.service.exportToExcel(report);
    }
  }

  // پرینت مانیفست
  printReport() {
    window.print();
  }

  // ─── ابزارهای تاریخ و جستجو ───────────────────────────────────
  // بررسی فعال بودن دکمه‌های امروز، فردا، پس‌فردا
  isPresetActive(offsetDays: number): boolean {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().substring(0, 10);
    return this.selectedDate() === dateStr;
  }

  async setDatePreset(offsetDays: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().substring(0, 10);
    this.selectedDate.set(dateStr);
    await this.loadOrders(dateStr);
  }

  async onDateChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.selectedDate.set(val);
      await this.loadOrders(val);
    }
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fa-IR') + ' تومان';
  }

  getStatusBadgeClass(statusLabel: string): string {
    if (statusLabel.includes('تحویل')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
    if (statusLabel.includes('پخت')) {
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    }
    if (statusLabel.includes('انتظار')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    }
    return 'bg-zinc-100 text-zinc-400 border-zinc-200/60';
  }
}
