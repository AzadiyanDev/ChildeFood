import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';
import {ChildItem} from '../../models/food.model';

// مدل اطلاعاتی هر روز تقویم
interface CalendarDay {
  dayNumber: number;
  label: string;
  dayOfWeekName: string;
  isPast: boolean;
  isToday: boolean;
  isHoliday: boolean; // روزهای تعطیل رسمی یا جمعه با نشانگر قرمز
}

@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- کانتینر اصلی صفحه تقویم؛ پالت کاملا مینیمال، پس‌زمینه سفید، تایپوگرافی مشکی عمیق و لهجه نارنجی -->
    <div id="calendar-page-view" class="px-5 pt-4 pb-32 select-none animate-in fade-in duration-200">
      
      <!-- =========================================================================
           ۱. بخش سربرگ مینیمال (HEADER)
           طبق مشخصات: راست‌چین، عنوان بزرگ، زیرعنوان ملایم، آیکون تقویم نارنجی و دکمه بازگشت بدون بج اضافی
           ========================================================================= -->
      <header id="calendar-header-section" class="flex items-center justify-between gap-3 mb-4">
        
        <!-- سمت راست: آیکون تقویم با لهجه نارنجی گرم، عنوان بولد و زیرعنوان توضیح فلو -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-[#FF6B3D] flex items-center justify-center flex-shrink-0 shadow-xs">
            <!-- آیکون خطی مینیمال تقویم با لهجه نارنجی -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>

          <div class="min-w-0">
            <h1 id="calendar-title" class="text-lg sm:text-xl font-black text-[#111111] tracking-tight leading-tight">
              رزرو ناهار مدرسه
            </h1>
            <p id="calendar-subtitle" class="text-xs text-[#8F8F8F] font-normal mt-0.5 line-clamp-1">
              روزهایی که فرزندت در مدرسه غذا دریافت میکند را انتخاب کن
            </p>
          </div>
        </div>

        <!-- سمت چپ: دکمه کوچک بازگشت با ارگونومی لمسی استاندارد -->
        <button
          type="button"
          id="btn-calendar-back"
          aria-label="بازگشت"
          (click)="foodStore.goToHome()"
          class="min-h-[44px] px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-[#111111] text-xs font-bold border border-gray-200/80 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0">
          <svg class="w-3.5 h-3.5 transform rotate-180 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span>بازگشت</span>
        </button>

      </header>

      <!-- =========================================================================
           ۲. کارت پروفایل فرزند (CHILD SELECTOR CARD)
           کارت سفید فشرده، گوشه‌های گرد ۲۰px، سایه ملایم، مشخصات فرزند و دکمه تغییر
           ========================================================================= -->
      <section id="child-selector-card" class="mb-4" data-purpose="child-profile-card">
        <div class="bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
          
          <!-- آواتار دایره‌ای + نام فرزند + پایه و مدرسه -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- آواتار گرد فرزند -->
            <div class="w-11 h-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-xl flex-shrink-0 shadow-xs">
              <span id="child-card-avatar">{{ activeChild().avatar }}</span>
            </div>

            <div class="min-w-0">
              <h2 id="child-card-name" class="text-sm font-bold text-[#111111] truncate">
                {{ activeChild().name }}
              </h2>
              <p id="child-card-details" class="text-[11px] text-[#8F8F8F] font-normal truncate mt-0.5">
                {{ activeChild().grade }} - {{ activeChild().school }}
              </p>
            </div>
          </div>

          <!-- دکمه تغییر فرزند با سایز لمسی ۴۴ پیکسلی -->
          <button
            type="button"
            id="btn-change-child"
            aria-label="تغییر فرزند"
            (click)="toggleChildPicker()"
            class="min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#FF6B3D] hover:text-[#FF6B3D] bg-gray-50/80 hover:bg-white text-xs font-bold text-[#111111] transition-all flex items-center gap-1 cursor-pointer flex-shrink-0">
            <span>تغییر</span>
            <svg class="w-3.5 h-3.5 transform rotate-180 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

        </div>

        <!-- پنجره بازشونده سریع برای انتخاب بین فرزندان والد -->
        @if (showChildPicker()) {
          <div
            id="child-picker-dropdown"
            class="mt-2 p-2.5 bg-white rounded-2xl border border-orange-200/80 shadow-lg animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1.5">
            <span class="text-[11px] font-bold text-gray-500 px-2 py-1">انتخاب فرزند جهت رزرو ناهار:</span>
            @for (child of foodStore.children(); track child.id) {
              <button
                type="button"
                [id]="'picker-child-' + child.id"
                (click)="selectChild(child)"
                [class]="
                  foodStore.selectedChildId() === child.id
                    ? 'w-full px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B3D] flex items-center justify-between text-xs font-bold transition-all cursor-pointer'
                    : 'w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[#111111] flex items-center justify-between text-xs font-medium transition-all cursor-pointer'
                ">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ child.avatar }}</span>
                  <span>{{ child.name }}</span>
                  <span class="text-[10px] text-gray-400">({{ child.grade }})</span>
                </div>
                @if (foodStore.selectedChildId() === child.id) {
                  <span class="text-xs">✓</span>
                }
              </button>
            }
          </div>
        }
      </section>

      <!-- =========================================================================
           ۳. کارت ماه و تقویم اصلی (MONTH CALENDAR CARD & DAYS GRID)
           کارت سفید بزرگ، گوشه‌های گرد، عنوان ماه، فلش‌های قبلی/بعدی، نام روزهای هفته و گرید روزها
           طبق فیدبک کاربر، بخش روزهای انتخاب شده از روی این صفحه حذف شد و مستقیماً داخل نوار پایین هندل می‌شود
           ========================================================================= -->
      <section id="month-calendar-card" class="mb-4" data-purpose="calendar-card">
        <div class="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          
          <!-- ردیف بالای تقویم: عنوان ماه (شهریور ۱۴۰۵) سمت راست و فلش‌های قبلی/بعدی سمت چپ -->
          <div class="flex items-center justify-between pb-3.5 mb-3 border-b border-gray-100">
            <div>
              <h3 id="calendar-month-title" class="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                {{ currentMonthTitle() }}
              </h3>
              <span class="text-[10px] text-[#8F8F8F] font-normal">
                روزهای کاری و آموزشی مدرسه
              </span>
            </div>

            <!-- فلش‌های قبلی / بعدی ماه -->
            <div class="flex items-center gap-1">
              <button
                type="button"
                id="btn-prev-month"
                aria-label="ماه قبل"
                (click)="handlePrevMonth()"
                class="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-[#111111] flex items-center justify-center transition-all cursor-pointer border border-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button
                type="button"
                id="btn-next-month"
                aria-label="ماه بعد"
                (click)="handleNextMonth()"
                class="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-[#111111] flex items-center justify-center transition-all cursor-pointer border border-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          <!-- ردیف نام روزهای هفته (ش، ی، د، س، چ، پ، ج) با خاکستری ملایم -->
          <div class="grid grid-cols-7 gap-1.5 text-center mb-2.5" role="row">
            <span class="text-xs font-bold text-[#8F8F8F] py-1">ش</span>
            <span class="text-xs font-bold text-[#8F8F8F] py-1">ی</span>
            <span class="text-xs font-bold text-[#8F8F8F] py-1">د</span>
            <span class="text-xs font-bold text-[#8F8F8F] py-1">س</span>
            <span class="text-xs font-bold text-[#8F8F8F] py-1">چ</span>
            <span class="text-xs font-bold text-[#8F8F8F] py-1">پ</span>
            <span class="text-xs font-bold text-rose-400 py-1">ج</span>
          </div>

          <!-- =========================================================================
               ۴. گرید روزهای تقویم (CALENDAR DAYS)
               سلول‌های بزرگ و راحت، حالت‌های: قابل انتخاب (سفید/مشکی)، انتخاب‌شده (نارنجی پررنگ)،
               روز گذشته (خاکستری روشن غیرفعال) و تعطیل (نشانگر کوچک قرمز)
               ========================================================================= -->
          <div class="grid grid-cols-7 gap-2 text-center" role="grid" aria-label="روزهای ماه شهریور">
            @for (day of monthDays(); track day.dayNumber) {
              @let isSelected = selectedDays().includes(day.dayNumber);

              @if (day.isPast) {
                <!-- روزهای گذشته: غیرفعال، خاکستری روشن، بدون امکان تاچ و بدون شلوغی بج‌ها -->
                <div
                  [id]="'calendar-day-' + day.dayNumber"
                  class="min-h-[50px] sm:min-h-[54px] rounded-2xl bg-gray-50/70 border border-transparent flex flex-col items-center justify-center text-gray-300 select-none cursor-not-allowed"
                  [attr.aria-disabled]="true">
                  <span class="text-sm font-semibold">{{ day.label }}</span>
                </div>
              } @else {
                <!-- روزهای فعال آینده: قابل لمس با سایز بزرگ و حالت انتخاب مشخص -->
                <button
                  type="button"
                  [id]="'calendar-day-' + day.dayNumber"
                  [attr.aria-label]="day.label + ' شهریور ' + (isSelected ? 'انتخاب شده' : 'انتخاب نشده')"
                  (click)="toggleDay(day.dayNumber)"
                  [class]="
                    isSelected
                      ? 'min-h-[50px] sm:min-h-[54px] rounded-2xl bg-[#FF6B3D] text-white shadow-md shadow-[#FF6B3D]/30 ring-2 ring-[#FF6B3D]/25 scale-[1.02] flex flex-col items-center justify-center font-bold cursor-pointer transition-all'
                      : 'min-h-[50px] sm:min-h-[54px] rounded-2xl bg-white hover:bg-orange-50/40 text-[#111111] border border-gray-100 hover:border-orange-200/80 active:scale-95 flex flex-col items-center justify-center font-bold cursor-pointer transition-all'
                  ">
                  
                  <!-- شماره روز به فارسی -->
                  <span class="text-base font-bold leading-none tracking-tight">
                    {{ day.label }}
                  </span>

                  <!-- نشانگر قرمز کوچک برای روزهای تعطیل در صورت عدم انتخاب -->
                  @if (!isSelected && day.isHoliday) {
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" title="تعطیل رسمی"></span>
                  }
                </button>
              }
            }
          </div>

          <!-- پیام راهنمای انتخاب روزهای تعطیل اگر والد روی جمعه کلیک کرد -->
          @if (holidayToastMessage()) {
            <div class="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-600 text-xs font-medium text-center animate-in fade-in">
              {{ holidayToastMessage() }}
            </div>
          }

        </div>
      </section>

    </div>
  `,
})
export class CalendarPage {
  // استور اصلی برای دسترسی به وضعیت فرزندان، روزهای رزرو و ناوبری صفحات
  readonly foodStore = inject(FoodStore);

  // روزهای انتخاب شده مستقیماً و به صورت کاملاً واکنشی از استور خوانده می‌شوند
  readonly selectedDays = computed(() => this.foodStore.selectedCalendarDays());

  // نمایش یا عدم نمایش دراپ‌داون تعویض فرزند
  readonly showChildPicker = signal<boolean>(false);

  // عنوان ماه جاری
  readonly currentMonthTitle = signal<string>('شهریور ۱۴۰۵');

  // پیام هشدار در صورت لمس روز تعطیل
  readonly holidayToastMessage = signal<string | null>(null);

  // فرزند فعلی انتخاب شده برای سفارش غذا
  readonly activeChild = computed(() => this.foodStore.selectedChild());

  // محاسبه ۳۱ روز شهریور ۱۴۰۵؛ روز ۱۵ام شنبه است، پس روز ۱ام هم شنبه بوده
  readonly monthDays = computed<CalendarDay[]>(() => {
    const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    const days: CalendarDay[] = [];

    for (let i = 1; i <= 31; i++) {
      const dayOfWeekIndex = (i - 1) % 7; // ۰: شنبه، ۶: جمعه
      const isPast = i < 15; // روزهای ۱ تا ۱۴ سپری شده‌اند
      const isToday = i === 15;
      const isHoliday = dayOfWeekIndex === 6; // جمعه‌ها تعطیل رسمی مدرسه هستند

      days.push({
        dayNumber: i,
        label: i.toLocaleString('fa-IR'),
        dayOfWeekName: dayNames[dayOfWeekIndex],
        isPast,
        isToday,
        isHoliday,
      });
    }

    return days;
  });

  constructor() {
    // هنگام ورود، اطمینان حاصل می‌کنیم هیچ روزی انتخاب نشده است
    this.foodStore.selectedCalendarDays.set([]);
  }

  // تاگل کردن انتخاب یا عدم انتخاب یک روز در تقویم و همگام‌سازی فوری با استور
  toggleDay(dayNumber: number): void {
    if (dayNumber < 15) {
      // روزهای گذشته غیرقابل انتخاب هستند
      return;
    }

    // روزهای جمعه که تعطیل هستند
    const dayOfWeekIndex = (dayNumber - 1) % 7;
    if (dayOfWeekIndex === 6) {
      this.holidayToastMessage.set('روز جمعه مدرسه تعطیل است و سرویس ناهار ارائه نمی‌شود.');
      setTimeout(() => this.holidayToastMessage.set(null), 3000);
      return;
    }

    const current = this.foodStore.selectedCalendarDays();
    const updated = current.includes(dayNumber)
      ? current.filter((d) => d !== dayNumber)
      : [...current, dayNumber].sort((a, b) => a - b);

    this.foodStore.selectedCalendarDays.set(updated);
  }

  // پاک کردن تمام روزهای انتخاب شده
  clearAllDays(): void {
    this.foodStore.selectedCalendarDays.set([]);
  }

  // باز و بسته کردن لیست انتخاب فرزند
  toggleChildPicker(): void {
    this.showChildPicker.update((v) => !v);
  }

  // انتخاب فرزند دیگر
  selectChild(child: ChildItem): void {
    this.foodStore.selectChild(child.id);
    this.showChildPicker.set(false);
  }

  // ورق زدن به ماه قبل
  handlePrevMonth(): void {
    this.holidayToastMessage.set('در حال حاضر فقط سفارش‌های ماه جاری (شهریور ۱۴۰۵) فعال است.');
    setTimeout(() => this.holidayToastMessage.set(null), 2500);
  }

  // ورق زدن به ماه بعد
  handleNextMonth(): void {
    this.holidayToastMessage.set('تقویم مهرماه پس از پایان شهریور بازگشایی خواهد شد.');
    setTimeout(() => this.holidayToastMessage.set(null), 2500);
  }
}
