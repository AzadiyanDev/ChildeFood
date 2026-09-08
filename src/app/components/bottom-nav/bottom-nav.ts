import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

// نوار ناوبری شناور جزیره‌ای مشکی با انیمیشن فوق‌العاده نرم دوطرفه (Home <-> Calendar)
// بخش‌های کپسول همیشه در DOM حضور دارند تا ترنزیشن‌ها کاملاً ۶۰ فریم و بدون پرش ناگهانی اجرا شوند
@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      id="floating-bottom-nav"
      class="fixed inset-x-0 z-40 flex justify-center pointer-events-none px-4 bottom-5 pb-[env(safe-area-inset-bottom,0px)]"
      data-purpose="bottom-navigation">
      
      <!-- کانتینر مشترک جزیره‌ای برای ناوبری و فلو تسویه‌حساب با ترنزیشن نرم ۵۰۰ میلی‌ثانیه‌ای -->
      <div
        id="nav-island-container"
        [class]="
          'w-full max-w-[360px] h-[65px] flex items-center justify-between pointer-events-auto select-none transition-all duration-500 ease-out ' +
          (foodStore.activePage() === 'calendar' ? 'gap-2.5' : 'gap-0')
        ">
        
        <!-- =========================================================================
             بخش اول (سمت راست در RTL): بخش مشکی (دایره شمارنده / کپسول باز شده روزها)
             دائماً در DOM حضور دارد تا هنگام باز شدن از عرض ۰ به ۶۲px انیمیشن مایع و طبیعی داشته باشد
             ========================================================================= -->
        <div
          id="calendar-black-section"
          [class]="
            foodStore.activePage() !== 'calendar'
              ? 'w-0 h-[62px] opacity-0 scale-50 pointer-events-none overflow-hidden m-0 p-0 border-0 flex-shrink-0 transition-all duration-500 ease-out'
              : isDaysExpanded()
                ? 'flex-1 h-[62px] bg-[#111111] rounded-full px-3 flex items-center justify-between shadow-2xl shadow-black/40 border border-white/15 transition-all duration-500 ease-out overflow-hidden gap-1.5 opacity-100 scale-100 pointer-events-auto flex-shrink-0'
                : 'w-[62px] h-[62px] rounded-full bg-[#111111] border border-white/15 shadow-2xl shadow-black/40 flex flex-col items-center justify-center text-white scale-100 opacity-100 transition-all duration-500 ease-out flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-orange-400/50 active:scale-95 pointer-events-auto'
          ">

          @if (!isDaysExpanded()) {
            <!-- حالت شمارنده روزها (۱۰ درصدی) -->
            <button
              type="button"
              id="calendar-days-counter-circle"
              aria-label="نمایش روزهای انتخاب شده"
              (click)="toggleDaysExpand($event)"
              class="w-full h-full flex flex-col items-center justify-center text-white cursor-pointer select-none">
              <!-- عدد تعداد روزهای انتخاب شده به فارسی -->
              <span id="counter-days-number" class="text-base sm:text-lg font-black leading-none text-white tracking-tight">
                {{ foodStore.selectedCalendarDays().length.toLocaleString('fa-IR') }}
              </span>
              <span class="text-[9px] font-bold text-gray-400 mt-0.5">روز</span>

              @if (foodStore.selectedCalendarDays().length > 0) {
                <!-- نقطه کوچک نارنجی نشانگر فعال بودن انتخاب‌ها -->
                <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D] absolute top-1.5 right-2 animate-pulse"></span>
              }
            </button>
          } @else {
            <!-- حالت باز شده: لیست افقی روزها (۹۰ درصدی) فقط با شماره تاریخ -->
            <div
              id="calendar-expanded-days-container"
              class="w-full h-full flex items-center justify-between gap-1.5 animate-in fade-in">
              
              <div
                id="expanded-days-scroll-list"
                class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
                @if (foodStore.selectedCalendarDays().length > 0) {
                  @for (day of foodStore.selectedCalendarDays(); track day) {
                    <div
                      [id]="'expanded-pill-' + day"
                      class="h-9 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center gap-1.5 flex-shrink-0 text-xs font-black transition-all">
                      <span>{{ day.toLocaleString('fa-IR') }}</span>
                      <button
                        type="button"
                        (click)="removeDay(day, $event)"
                        [attr.aria-label]="'حذف روز ' + day"
                        class="w-4 h-4 rounded-full hover:bg-rose-500/30 text-gray-400 hover:text-rose-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors">
                        ×
                      </button>
                    </div>
                  }
                } @else {
                  <span class="text-xs text-gray-400 font-medium px-2">روزی انتخاب نشده</span>
                }
              </div>

              <!-- دکمه بستن ✕ -->
              <button
                type="button"
                id="btn-collapse-days"
                aria-label="بستن روزها"
                (click)="toggleDaysExpand($event)"
                class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer transition-all">
                ✕
              </button>
            </div>
          }
        </div>

        <!-- =========================================================================
             بخش دوم (سمت چپ در RTL): کپسول اصلی ناوبری / دکمه نارنجی ادامه
             در حالت پیش‌فرض صفحه اصلی: ۱۰۰ درصد مشکی با ۴ تب اصلی
             در حالت تقویم عادی: ۹۰ درصد نارنجی با متن بزرگ «ادامه»
             در حالت تقویم بازشده: ۱۰ درصد دایره‌ای با آیکون فلش «←»
             ========================================================================= -->
        <div
          id="nav-pill-wrapper"
          [class]="
            foodStore.activePage() !== 'calendar'
              ? 'w-full h-[65px] bg-[#111111] rounded-full px-4 flex items-center justify-between shadow-2xl shadow-black/35 border border-white/10 transition-all duration-500 ease-out relative overflow-hidden'
              : isDaysExpanded()
                ? 'w-[62px] h-[62px] rounded-full bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.95] flex items-center justify-center shadow-2xl shadow-[#FF6B3D]/35 border border-white/20 transition-all duration-500 ease-out flex-shrink-0 overflow-hidden cursor-pointer'
                : 'flex-1 h-[62px] bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] rounded-full px-5 flex items-center justify-center shadow-2xl shadow-[#FF6B3D]/35 border border-white/20 transition-all duration-500 ease-out relative overflow-hidden cursor-pointer'
          ">
          
          <!-- تب‌های ناوبری اصلی ۴گانه -->
          <div
            id="nav-tabs-group"
            [class]="
              foodStore.activePage() === 'calendar'
                ? 'opacity-0 scale-75 pointer-events-none absolute inset-0 flex items-center justify-between px-4 transition-all duration-300'
                : 'opacity-100 scale-100 w-full flex items-center justify-between transition-all duration-300'
            ">
            <!-- ۱. تب خانه -->
            <button
              id="nav-tab-home"
              aria-label="خانه"
              title="خانه"
              (click)="foodStore.setActiveNavTab('home'); $event.stopPropagation()"
              [class]="
                foodStore.activeNavTab() === 'home' || foodStore.activePage() === 'home'
                  ? 'w-11 h-11 rounded-full bg-[#FF6B3D] flex items-center justify-center text-white shadow-lg shadow-[#FF6B3D]/30 active:scale-95 transition-all cursor-pointer'
                  : 'w-10 h-10 rounded-full flex items-center justify-center text-[#8F8F8F] hover:text-white active:scale-95 transition-all cursor-pointer'
              "
              type="button">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </button>

            <!-- ۲. تب سفارش‌ها -->
            <button
              id="nav-tab-orders"
              aria-label="سفارش‌ها"
              title="سفارش‌ها"
              (click)="foodStore.setActiveNavTab('orders'); $event.stopPropagation()"
              [class]="
                foodStore.activeNavTab() === 'orders' || foodStore.activePage() === 'orders'
                  ? 'w-11 h-11 rounded-full bg-[#FF6B3D] flex items-center justify-center text-white shadow-lg shadow-[#FF6B3D]/30 active:scale-95 transition-all cursor-pointer'
                  : 'w-10 h-10 rounded-full flex items-center justify-center text-[#8F8F8F] hover:text-white active:scale-95 transition-all cursor-pointer relative'
              "
              type="button">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V4.5A1.5 1.5 0 014.5 3h15a1.5 1.5 0 011.5 1.5v18l-2-1.5z" />
              </svg>
              @if (foodStore.todayOrders().length > 0 && foodStore.activePage() !== 'orders') {
                <span class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
              }
            </button>

            <!-- ۳. تب کیف پول -->
            <button
              id="nav-tab-wallet"
              aria-label="کیف پول"
              title="کیف پول"
              (click)="foodStore.setActiveNavTab('wallet'); $event.stopPropagation()"
              [class]="
                foodStore.activeNavTab() === 'wallet' || foodStore.activePage() === 'wallet'
                  ? 'w-11 h-11 rounded-full bg-[#FF6B3D] flex items-center justify-center text-white shadow-lg shadow-[#FF6B3D]/30 active:scale-95 transition-all cursor-pointer'
                  : 'w-10 h-10 rounded-full flex items-center justify-center text-[#8F8F8F] hover:text-white active:scale-95 transition-all cursor-pointer'
              "
              type="button">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5zm0 0h-4a2 2 0 00-2 2v0a2 2 0 002 2h4M7 9h.01" />
              </svg>
            </button>

            <!-- ۴. تب پروفایل -->
            <button
              id="nav-tab-profile"
              aria-label="پروفایل"
              title="پروفایل"
              (click)="foodStore.setActiveNavTab('profile'); $event.stopPropagation()"
              [class]="
                foodStore.activeNavTab() === 'profile' || foodStore.activePage() === 'profile'
                  ? 'w-11 h-11 rounded-full bg-[#FF6B3D] flex items-center justify-center text-white shadow-lg shadow-[#FF6B3D]/30 active:scale-95 transition-all cursor-pointer'
                  : 'w-10 h-10 rounded-full flex items-center justify-center text-[#8F8F8F] hover:text-white active:scale-95 transition-all cursor-pointer'
              "
              type="button">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>
          </div>

          <!-- دکمه نارنجی «ادامه» فلو تقویم -->
          <button
            type="button"
            id="nav-calendar-cta"
            aria-label="ادامه و ثبت روزهای تقویم"
            (click)="handlePillClick()"
            [class]="
              foodStore.activePage() === 'calendar'
                ? 'opacity-100 scale-100 w-full h-full flex items-center justify-center gap-2 text-white font-black text-lg transition-all duration-400 ease-out cursor-pointer'
                : 'opacity-0 scale-75 pointer-events-none absolute transition-all duration-300'
            ">
            @if (!isDaysExpanded()) {
              <span id="btn-calendar-continue-label" class="tracking-tight">ادامه</span>
            }
            <svg class="w-5 h-5 transform rotate-180 text-white flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

        </div>

      </div>

      <!-- پیام پاپ‌آپ کوچک در صورتی که والد بدون انتخاب روز روی ادامه کلیک کند -->
      @if (showValidationToast()) {
        <div
          id="calendar-validation-toast"
          class="fixed bottom-24 z-50 bg-[#111111] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 pointer-events-auto flex items-center gap-2">
          <span>⚠️</span>
          <span>لطفاً حداقل یک روز را برای رزرو ناهار فرزندت انتخاب کن.</span>
        </div>
      }

    </nav>
  `,
})
export class BottomNav {
  // استور اصلی برای دسترسی به وضعیت صفحات و روزهای انتخابی تقویم
  readonly foodStore = inject(FoodStore);

  // نمایش یا عدم نمایش پیام هشدار عدم انتخاب روز
  readonly showValidationToast = signal<boolean>(false);

  // وضعیت باز شدن افقی لیست روزها و جابجایی ۹۰٪ مشکی و ۱۰٪ نارنجی
  readonly isDaysExpanded = signal<boolean>(false);


  // کلیک روی دایره مشکی ۳ روز برای باز و بسته کردن لیست افقی روزها
  toggleDaysExpand(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isDaysExpanded.update((v) => !v);
  }

  // حذف یک روز از لیست روزهای انتخابی با زدن ضربدر کوچک
  removeDay(day: number, event: MouseEvent): void {
    event.stopPropagation();
    const current = this.foodStore.selectedCalendarDays();
    const updated = current.filter((d) => d !== day);
    this.foodStore.selectedCalendarDays.set(updated);
    if (updated.length === 0) {
      // اگر همه روزها حذف شدند، وضعیت بازشده را می‌بندیم
      this.isDaysExpanded.set(false);
    }
  }

  // هندل کردن کلیک روی دکمه نارنجی ادامه
  handlePillClick(): void {
    if (this.foodStore.activePage() === 'calendar') {
      const selected = this.foodStore.selectedCalendarDays();
      if (selected.length === 0) {
        this.showValidationToast.set(true);
        setTimeout(() => this.showValidationToast.set(false), 3000);
        return;
      }

      // ثبت روزها و رفتن به صفحه انتخاب غذا
      this.isDaysExpanded.set(false);
      this.foodStore.confirmCalendarDays(selected);
    }
  }
}
