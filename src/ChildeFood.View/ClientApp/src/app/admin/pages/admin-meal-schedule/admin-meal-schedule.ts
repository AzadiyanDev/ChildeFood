import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AdminMealScheduleService, CalendarDay, FoodItemPicker, ScheduledMealItem} from '../../services/admin-meal-schedule.service';

// صفحه اصلی برنامه غذایی و منو
@Component({
  selector: 'app-admin-meal-schedule',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-meal-schedule.html',
})
export class AdminMealSchedule implements OnInit {
  private readonly service = inject(AdminMealScheduleService);
  private readonly cdr = inject(ChangeDetectorRef);

  // داده‌های اصلی
  calendarDays = signal<CalendarDay[]>([]);
  selectedDay = signal<CalendarDay | null>(null);
  daySchedule = signal<ScheduledMealItem[]>([]);
  allFoodItems = signal<FoodItemPicker[]>([]);

  // سیگنال محاسباتی: Set از FoodItemId‌هایی که الان توی برنامه روز هستن
  // این رو توی مودال استفاده می‌کنیم تا غذاهای قبلاً اضافه‌شده disable بشن
  alreadyAddedFoodIds = computed<Set<string>>(() =>
    new Set(this.daySchedule().map(m => m.foodItemId))
  );

  // وضعیت‌های UI
  isLoadingCalendar = signal(false);
  isLoadingSchedule = signal(false);
  isLoadingFoodItems = signal(false);
  isSaving = signal(false);
  showModal = signal(false);

  // غذاهای انتخاب شده در مودال (فقط غذاهای جدید، نه قبلاً اضافه‌شده)
  selectedFoodIds = signal<Set<string>>(new Set());

  // فیلتر جستجو در مودال
  modalSearch = signal('');

  // لیست فیلترشده برای مودال — بر اساس سرچ
  filteredFoodItems = computed(() => {
    const search = this.modalSearch().toLowerCase().trim();
    const items = this.allFoodItems();
    if (!search) return items;
    return items.filter(f => f.title.toLowerCase().includes(search));
  });

  async ngOnInit() {
    await this.loadCalendar();
  }

  async loadCalendar() {
    this.isLoadingCalendar.set(true);
    try {
      const days = await this.service.getCalendarDays();
      this.calendarDays.set(days);
      const today = days.find(d => d.isToday);
      if (today) await this.selectDay(today);
    } finally {
      this.isLoadingCalendar.set(false);
      this.cdr.markForCheck();
    }
  }

  async selectDay(day: CalendarDay) {
    this.selectedDay.set(day);
    this.daySchedule.set([]);
    this.isLoadingSchedule.set(true);
    try {
      const schedule = await this.service.getDaySchedule(day.date);
      this.daySchedule.set(schedule);
    } finally {
      this.isLoadingSchedule.set(false);
      this.cdr.markForCheck();
    }
  }

  async openAddModal() {
    this.showModal.set(true);
    this.selectedFoodIds.set(new Set());
    this.modalSearch.set('');

    // فقط اگه قبلاً لود نشده بار بزن
    if (this.allFoodItems().length === 0) {
      this.isLoadingFoodItems.set(true);
      try {
        const items = await this.service.getAllFoodItems();
        this.allFoodItems.set(items);
      } finally {
        this.isLoadingFoodItems.set(false);
        this.cdr.markForCheck();
      }
    }
  }

  // تاگل انتخاب غذا در مودال — اگه قبلاً اضافه شده باشه نمیشه انتخابش کرد
  toggleFoodSelection(food: FoodItemPicker) {
    if (this.alreadyAddedFoodIds().has(food.id)) return; // قفله، نمیشه
    if (!food.isAvailable) return;

    const current = new Set(this.selectedFoodIds());
    if (current.has(food.id)) current.delete(food.id);
    else current.add(food.id);
    this.selectedFoodIds.set(current);
  }

  async confirmAddMeals() {
    const day = this.selectedDay();
    if (!day) return;

    const ids = Array.from(this.selectedFoodIds());
    if (!ids.length) return;

    this.isSaving.set(true);
    try {
      await this.service.addMeals(day.date, ids);
      this.showModal.set(false);
      // رفرش همزمان برنامه روز و تقویم
      await Promise.all([this.selectDay(day), this.refreshCalendar()]);
    } finally {
      this.isSaving.set(false);
      this.cdr.markForCheck();
    }
  }

  async removeMeal(scheduleId: string) {
    try {
      await this.service.removeMeal(scheduleId);
      const day = this.selectedDay();
      if (day) await Promise.all([this.selectDay(day), this.refreshCalendar()]);
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async refreshCalendar() {
    const days = await this.service.getCalendarDays();
    this.calendarDays.set(days);
    this.cdr.markForCheck();
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedFoodIds.set(new Set());
    this.modalSearch.set('');
  }

  onModalSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.modalSearch.set(val);
    this.cdr.markForCheck();
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fa-IR') + ' تومان';
  }

  getCategoryBadgeClass(category: string): string {
    const map: Record<string, string> = {
      'Main': 'bg-orange-50 text-orange-600',
      'Drink': 'bg-blue-50 text-blue-600',
      'Dessert': 'bg-pink-50 text-pink-600',
      'Snack': 'bg-emerald-50 text-emerald-600',
    };
    return map[category] ?? 'bg-zinc-100 text-zinc-500';
  }

  getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      'Main': 'غذای اصلی',
      'Drink': 'نوشیدنی',
      'Dessert': 'دسر',
      'Snack': 'میان‌وعده',
    };
    return map[category] ?? category;
  }

  // آیا این غذا از قبل اضافه شده؟ — برای حالت disabled در مودال
  isAlreadyAdded(foodId: string): boolean {
    return this.alreadyAddedFoodIds().has(foodId);
  }
}
