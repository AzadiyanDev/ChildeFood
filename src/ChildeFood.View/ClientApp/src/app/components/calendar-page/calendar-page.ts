import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

interface CalendarDay {
  dayNumber: number;
  label: string;
  dayOfWeekName: string;
  isPast: boolean;
  isToday: boolean;
  isFriday: boolean;
}

@Component({
  selector: 'app-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="calendar-page-view" class="px-4 pt-3 pb-36 animate-in fade-in duration-200">
      
      <!-- Top Navigation Bar & Title -->
      <div class="flex items-center justify-between py-2 mb-2">
        <div class="flex items-center space-x-2 space-x-reverse">
          <div class="w-10 h-10 rounded-2xl bg-orange-50 text-[#f97352] flex items-center justify-center text-xl font-bold shadow-xs border border-orange-200/60">
            📅
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 id="calendar-title" class="text-base font-black text-[#141517] tracking-tight">
                تقویم رزرو ناهار مدرسه
              </h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100/70 text-[#f97352] border border-orange-200/50">
                مرحله ۱ از ۲
              </span>
            </div>
            <p class="text-[11px] text-gray-500 font-medium mt-0.5">
              روزهای مورد نظر برای دریافت ناهار گرم را انتخاب کنید
            </p>
          </div>
        </div>

        <!-- Back to Home Button -->
        <button
          type="button"
          id="btn-calendar-back"
          aria-label="بازگشت به صفحه اصلی"
          (click)="foodStore.goToHome()"
          class="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-xs font-black flex items-center space-x-1 space-x-reverse transition-all cursor-pointer">
          <svg class="w-3.5 h-3.5 transform rotate-180 text-gray-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <span>خانه</span>
        </button>
      </div>

      <!-- Child Context Badge & Quick Switcher -->
      <div class="bg-[#141517] rounded-2xl p-3.5 mb-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
        <div class="absolute -top-12 -left-12 w-32 h-32 bg-[#f97352]/20 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex items-center space-x-3 space-x-reverse relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
            {{ foodStore.selectedChild().avatar }}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] text-orange-200 font-medium">سفارش برای:</span>
              <strong class="text-sm font-black text-white">{{ foodStore.selectedChild().name }}</strong>
            </div>
            <p class="text-[10px] text-gray-400 font-medium mt-0.5">
              {{ foodStore.selectedChild().grade }} • {{ foodStore.selectedChild().school }}
            </p>
          </div>
        </div>

        <!-- Switch child quick menu -->
        <div class="flex items-center gap-1.5 relative z-10">
          @for (child of foodStore.children(); track child.id) {
            <button
              type="button"
              [attr.aria-label]="'سفارش برای ' + child.name"
              (click)="foodStore.selectedChildId.set(child.id)"
              [class]="
                foodStore.selectedChildId() === child.id
                  ? 'w-8 h-8 rounded-xl bg-[#f97352] text-white flex items-center justify-center text-sm shadow-sm ring-2 ring-white/30 font-bold cursor-pointer transition-all'
                  : 'w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-sm cursor-pointer transition-all'
              ">
              {{ child.avatar }}
            </button>
          }
        </div>
      </div>

      <!-- Main Calendar Card: Only Current Month (Shahrivar 1405) -->
      <div class="bg-white rounded-[28px] p-4 sm:p-5 border border-black/[0.06] shadow-xs mb-4">
        
        <!-- Month Header -->
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-lg">🗓️</span>
            <div>
              <h2 class="text-sm font-black text-[#141517]">
                شهریور ۱۴۰۵
              </h2>
              <span class="text-[10px] text-gray-400 font-medium">
                امروز: شنبه ۱۵ شهریور • ناهار گرم مدارس
              </span>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ماه جاری</span>
          </span>
        </div>

        <!-- Quick Selection Action Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-gray-100 no-scrollbar">
          <button
            type="button"
            (click)="selectCurrentWeek()"
            class="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#f97352] text-[10px] font-black border border-orange-200/60 whitespace-nowrap active:scale-95 transition-all cursor-pointer">
            ⚡ روزهای این هفته (۱۵ تا ۱۹)
          </button>
          <button
            type="button"
            (click)="selectAllSchoolDays()"
            class="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200/60 whitespace-nowrap active:scale-95 transition-all cursor-pointer">
            📚 روزهای مدرسه تا پایان ماه
          </button>
          <button
            type="button"
            (click)="clearSelection()"
            class="px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 text-[10px] font-medium border border-gray-200/40 whitespace-nowrap active:scale-95 transition-all cursor-pointer mr-auto">
            پاک کردن
          </button>
        </div>

        <!-- Weekday Headers (شنبه تا جمعه) -->
        <div class="grid grid-cols-7 gap-1.5 text-center mb-2">
          <div class="text-[11px] font-black text-gray-500 py-1">ش</div>
          <div class="text-[11px] font-black text-gray-500 py-1">ی</div>
          <div class="text-[11px] font-black text-gray-500 py-1">د</div>
          <div class="text-[11px] font-black text-gray-500 py-1">س</div>
          <div class="text-[11px] font-black text-gray-500 py-1">چ</div>
          <div class="text-[11px] font-black text-gray-500 py-1">پ</div>
          <div class="text-[11px] font-black text-rose-500 py-1">ج</div>
        </div>

        <!-- 31 Month Days Grid -->
        <div class="grid grid-cols-7 gap-1.5 text-center" role="grid" aria-label="روزهای ماه شهریور">
          @for (day of monthDays(); track day.dayNumber) {
            @let isSelected = selectedDays().includes(day.dayNumber);

            @if (day.isPast) {
              <!-- Past Day: Disabled / Non-clickable -->
              <div
                class="h-11 sm:h-12 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col items-center justify-center text-gray-300 select-none cursor-not-allowed"
                [attr.aria-disabled]="true"
                [title]="'روز گذشته: ' + day.label + ' شهریور'">
                <span class="text-xs font-semibold">{{ day.label }}</span>
                <span class="text-[8px] text-gray-300 -mt-0.5">گذشته</span>
              </div>
            } @else {
              <!-- Active / Future Day: Clickable & Selectable -->
              <button
                type="button"
                [id]="'calendar-day-' + day.dayNumber"
                [attr.aria-label]="day.label + ' شهریور ' + (isSelected ? 'انتخاب شده' : 'انتخاب نشده')"
                (click)="toggleDay(day.dayNumber)"
                [class]="
                  isSelected
                    ? 'h-11 sm:h-12 rounded-2xl bg-[#f97352] text-white shadow-md shadow-orange-500/25 ring-2 ring-[#f97352]/30 scale-[1.03] flex flex-col items-center justify-center font-black cursor-pointer transition-all'
                    : day.isToday
                      ? 'h-11 sm:h-12 rounded-2xl bg-orange-50/80 hover:bg-orange-100 text-[#f97352] border-2 border-[#f97352] flex flex-col items-center justify-center font-black cursor-pointer active:scale-95 transition-all'
                      : day.isFriday
                        ? 'h-11 sm:h-12 rounded-2xl bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 border border-rose-200/50 flex flex-col items-center justify-center font-bold cursor-pointer active:scale-95 transition-all'
                        : 'h-11 sm:h-12 rounded-2xl bg-white hover:bg-orange-50/60 text-gray-800 border border-gray-200/80 flex flex-col items-center justify-center font-bold cursor-pointer active:scale-95 transition-all'
                ">
                
                <span class="text-xs leading-none tracking-tight">
                  {{ day.label }}
                </span>

                @if (isSelected) {
                  <span class="text-[8px] font-bold text-orange-100 -mt-0.5">رزرو</span>
                } @else if (day.isToday) {
                  <span class="text-[8px] font-bold text-[#f97352] -mt-0.5">امروز</span>
                } @else if (day.isFriday) {
                  <span class="text-[8px] font-medium text-rose-400 -mt-0.5">تعطیل</span>
                } @else {
                  <span class="text-[8px] text-gray-400 font-normal -mt-0.5">{{ day.dayOfWeekName }}</span>
                }
              </button>
            }
          }
        </div>

        <!-- Legend -->
        <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-around text-[10px] text-gray-500 font-medium">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-lg bg-[#f97352] shadow-xs"></span>
            <span>انتخاب شده برای ناهار</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-lg bg-white border border-gray-300"></span>
            <span>روزهای فعال و باز</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-lg bg-gray-100 text-gray-300"></span>
            <span>روزهای گذشته</span>
          </div>
        </div>

      </div>

      <!-- Summary of Selected Days -->
      <div class="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-xs mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-black text-[#141517] flex items-center gap-1.5">
            <span>📋</span>
            <span>خلاصه روزهای انتخابی شما:</span>
          </span>
          <span class="text-xs font-black text-[#f97352]">
            {{ selectedDays().length.toLocaleString('fa-IR') }} روز انتخاب شده
          </span>
        </div>

        @if (selectedDays().length > 0) {
          <div class="flex flex-wrap gap-1.5 mt-2">
            @for (dayNum of selectedDays(); track dayNum) {
              <span class="px-2.5 py-1 rounded-xl bg-orange-50 text-[#f97352] text-xs font-black border border-orange-200/60 flex items-center gap-1 animate-in zoom-in-95 duration-100">
                <span>{{ dayNum.toLocaleString('fa-IR') }} شهریور</span>
                <button
                  type="button"
                  [attr.aria-label]="'حذف روز ' + dayNum"
                  (click)="toggleDay(dayNum)"
                  class="text-orange-400 hover:text-rose-500 font-black cursor-pointer mr-1">
                  ×
                </button>
              </span>
            }
          </div>
          <p class="text-[10px] text-gray-400 font-medium mt-3">
            ✓ ناهار در هر کدام از این روزها مستقیماً به بوفه مدرسه {{ foodStore.selectedChild().school }} ارسال خواهد شد.
          </p>
        } @else {
          <div class="py-3 text-center text-gray-400 text-xs">
            هنوز روزی را انتخاب نکرده‌اید. لطفاً روزهای مورد نظر خود را از تقویم بالا لمس کنید.
          </div>
        }
      </div>

      <!-- Sticky Floating Bottom Continue Button -->
      <div
        id="calendar-bottom-bar"
        class="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.06] p-4 max-w-md mx-auto shadow-2xl">
        
        <div class="flex items-center justify-between gap-3">
          <!-- Selection info text -->
          <div class="flex flex-col">
            <span class="text-[11px] text-gray-400 font-medium">مجموع روزهای رزرو</span>
            <div class="flex items-baseline gap-1">
              <span class="text-base font-black text-[#141517]">
                {{ selectedDays().length.toLocaleString('fa-IR') }}
              </span>
              <span class="text-xs text-gray-500 font-bold">روز کاری</span>
            </div>
          </div>

          <!-- Big Continue Button: "میزنم ادامه و وقتی که میآم توی ادامه، بعدش میآم توی سفارش غذا..." -->
          <button
            type="button"
            id="btn-calendar-continue"
            [disabled]="selectedDays().length === 0"
            (click)="handleContinue()"
            [class]="
              selectedDays().length > 0
                ? 'flex-1 py-3.5 px-6 rounded-2xl bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-sm font-black shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 space-x-reverse transition-all cursor-pointer'
                : 'flex-1 py-3.5 px-6 rounded-2xl bg-gray-200 text-gray-400 text-sm font-bold flex items-center justify-center space-x-2 space-x-reverse cursor-not-allowed'
            ">
            <span>ادامه و انتخاب غذا</span>
            <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>

    </div>
  `,
})
export class CalendarPage {
  readonly foodStore = inject(FoodStore);

  // Selected days signal (defaults to current week days or existing store selection)
  readonly selectedDays = signal<number[]>([]);

  // 31 days of Shahrivar 1405
  // Day 15 is Saturday, meaning Day 1 is Saturday
  readonly monthDays = computed<CalendarDay[]>(() => {
    const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    const days: CalendarDay[] = [];

    for (let i = 1; i <= 31; i++) {
      const dayOfWeekIndex = (i - 1) % 7; // 0: شنبه, 6: جمعه
      const isPast = i < 15; // Days 1-14 are past
      const isToday = i === 15;
      const isFriday = dayOfWeekIndex === 6; // جمعه

      days.push({
        dayNumber: i,
        label: i.toLocaleString('fa-IR'),
        dayOfWeekName: dayNames[dayOfWeekIndex],
        isPast,
        isToday,
        isFriday,
      });
    }

    return days;
  });

  constructor() {
    // Initialize with existing selection from store or default to remaining school days of this week
    const currentStoreDays = this.foodStore.selectedCalendarDays();
    if (currentStoreDays && currentStoreDays.length > 0) {
      this.selectedDays.set([...currentStoreDays].sort((a, b) => a - b));
    } else {
      this.selectedDays.set([15, 16, 17, 18, 19]);
    }
  }

  toggleDay(dayNumber: number): void {
    if (dayNumber < 15) return; // Past days cannot be toggled

    const current = this.selectedDays();
    if (current.includes(dayNumber)) {
      this.selectedDays.set(current.filter((d) => d !== dayNumber));
    } else {
      this.selectedDays.set([...current, dayNumber].sort((a, b) => a - b));
    }
  }

  selectCurrentWeek(): void {
    // 15 (Sat), 16 (Sun), 17 (Mon), 18 (Tue), 19 (Wed)
    this.selectedDays.set([15, 16, 17, 18, 19]);
  }

  selectAllSchoolDays(): void {
    // All Saturday to Wednesday days from 15 to 31
    const schoolDays: number[] = [];
    for (let i = 15; i <= 31; i++) {
      const dayOfWeekIndex = (i - 1) % 7;
      // 0 to 4 are Saturday through Wednesday
      if (dayOfWeekIndex <= 4) {
        schoolDays.push(i);
      }
    }
    this.selectedDays.set(schoolDays);
  }

  clearSelection(): void {
    this.selectedDays.set([]);
  }

  handleContinue(): void {
    const days = this.selectedDays();
    if (days.length === 0) return;
    this.foodStore.confirmCalendarDays(days);
  }
}
