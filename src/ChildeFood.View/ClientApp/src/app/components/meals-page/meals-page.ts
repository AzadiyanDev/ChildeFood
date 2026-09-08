import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, computed, inject, signal} from '@angular/core';
import {FoodStore, toPersianDigits} from '../../services/food-store';

// صفحه ریدیزاین‌شده انتخاب غذای ناهار برای روزهای تقویم
// ۱. شروع از روز اول انتخابی، با انتخاب غذا و زدن دکمه «ادامه» روز نارنجی شده و به روز بعد می‌رود
// ۲. حذف کامل دکمه «انتخاب» از روی کارت‌ها و لمس خود کارت برای انتخاب غذا
// ۳. دکمه «ادامه» در پایین تا قبل از انتخاب غذا خاکستری و غیرفعال است و با انتخاب غذا نارنجی و فعال می‌شود
// ۴. دایره مشکی پایین، تاریخ همین روزی را نشان می‌دهد که در حال انتخاب آن هستیم
// ۵. گرید ۲ ستونه با کارت مشکی برای تنظیم پرس (کامل/نیم‌پرس) و تعداد
@Component({
  selector: 'app-meals-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="meals-page-view" class="pt-2 pb-36 animate-in fade-in duration-200 select-none">

      <!-- =========================================================================
           ۱. بخش سربرگ فشرده و استاندارد (CLEAN MEALS HEADER)
           سمت راست: فقط عنوان اصلی «انتخاب غذای ناهار» بدون زیرعنوان
           سمت چپ: ایندیکیتور ۵ مرحله‌ای فلو بدون دکمه بازگشت
           ========================================================================= -->
      <header id="meals-header" class="flex items-center justify-between gap-3 px-5 mb-3">
        
        <!-- سمت راست در چینش RTL: دکمه بازگشت و عنوان اصلی -->
        <div class="flex items-center gap-3 text-right">
          <button
            id="btn-meals-back"
            type="button"
            (click)="foodStore.navigateBack()"
            aria-label="بازگشت"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer flex-shrink-0">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <h1 id="meals-title" class="text-lg sm:text-xl font-black text-[#111111] tracking-tight leading-tight">
            انتخاب غذای ناهار
          </h1>
        </div>

        <!-- سمت چپ در چینش RTL: شمارنده ۵ مرحله‌ای فلو چسبیده به چپ بدون دکمه بازگشت -->
        <div id="meals-progress-indicator" class="flex flex-col items-end text-left flex-shrink-0">
          <span id="meals-progress-step" class="text-[11px] font-black text-gray-700">مرحله ۳ از ۵</span>
          <div class="flex items-center gap-1 mt-1" aria-label="● ● ● ○ ○">
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            <span class="sr-only">● ● ● ○ ○</span>
          </div>
        </div>

      </header>

      <!-- =========================================================================
           ۲. کارت مشخصات فرزند و تاریخ انتخابی (CHILD + DATE CARD)
           کارت سفید گرد، مشخصات آوا احمدی، تاریخ روز جاری و دکمه تغییر
           ========================================================================= -->
      <section id="child-date-card" class="px-5 mb-3.5" data-purpose="child-and-date-context">
        <div class="bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-2.5">
          
          <!-- اطلاعات فرزند: آواتار گرد، نام و پایه تحصیلی -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-11 h-11 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-xl flex-shrink-0 shadow-xs overflow-hidden">
              <span id="child-avatar" class="w-full h-full flex items-center justify-center">
                @if (foodStore.isImageAvatar(activeChild().avatar)) {
                  <img [src]="activeChild().avatar" [alt]="activeChild().name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                } @else {
                  {{ activeChild().avatar }}
                }
              </span>
            </div>
            <div class="min-w-0">
              <h2 id="child-name" class="text-sm font-black text-[#111111] truncate leading-snug">
                {{ activeChild().name }}
              </h2>
              <p id="child-grade" class="text-[11px] text-[#8F8F8F] font-normal truncate mt-0.5">
                {{ activeChild().grade }}
              </p>
            </div>
          </div>

          <!-- بج تاریخ انتخابی روز جاری و دکمه تغییر جمع‌وجور -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <div class="px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1 text-xs font-bold text-gray-800">
              <span id="selected-date-text">📅 {{ selectedDateLabel() }}</span>
            </div>

            <button
              type="button"
              id="btn-change-date"
              aria-label="تغییر روزها در تقویم"
              (click)="foodStore.goToCalendar()"
              class="min-h-[40px] px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#FF6B3D] hover:text-[#FF6B3D] bg-gray-50/80 hover:bg-white text-xs font-bold text-[#111111] transition-all flex items-center gap-1 cursor-pointer">
              <span>تغییر</span>
            </button>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۳. نوار افقی کارت‌های مربعی روزهای تقویم (DAYS SELECTION STRIP)
           - شروع همیشه از روز اول
           - هر روز که کاربر غذا انتخاب کرد و ادامه را زد، نارنجی و تیک‌دار می‌شود
           - روز فعال جاری به شکل متمایز با رینگ مشخص در وسط نوار قرار دارد
           ========================================================================= -->
      <section id="selected-days-bar" class="px-5 mb-4" data-purpose="days-selection-strip">
        <div class="flex items-center justify-between mb-2 px-0.5">
          <span class="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
            <span>📅</span>
            <span>روزهای رزرو ناهار</span>
          </span>
          <span id="days-summary-badge" class="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {{ formatNumber(completedDaysCount()) }} از {{ formatNumber(totalCalendarDaysCount()) }} روز ثبت شد
          </span>
        </div>

        <div
          #daysScrollContainer
          id="days-scroll-container"
          class="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
          @for (day of activeDays(); track day) {
            @let isCompleted = isDayCompleted(day);
            @let isCurrent = isCurrentDay(day);

            <!-- دکمه کارت مربعی هر روز -->
            <button
              type="button"
              [id]="'day-pill-' + day"
              [attr.aria-label]="'روز ' + day + ' شهریور ' + (isCompleted ? 'تکمیل شده' : 'انتخاب نشده')"
              (click)="selectDay(day)"
              [class]="
                isCompleted
                  ? (isCurrent
                      ? 'w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-2xl bg-[#FF6B3D] text-white ring-4 ring-[#FF6B3D]/30 scale-105 shadow-md shadow-[#FF6B3D]/30 flex flex-col items-center justify-center relative cursor-pointer flex-shrink-0 transition-all duration-300'
                      : 'w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-2xl bg-[#FF6B3D] text-white shadow-sm flex flex-col items-center justify-center relative cursor-pointer flex-shrink-0 transition-all duration-300')
                  : (isCurrent
                      ? 'w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-2xl bg-white text-[#111111] border-2 border-[#FF6B3D] ring-4 ring-[#FF6B3D]/20 scale-105 shadow-sm flex flex-col items-center justify-center relative cursor-pointer flex-shrink-0 transition-all duration-300'
                      : 'w-[64px] h-[64px] min-w-[64px] min-h-[64px] rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200/60 flex flex-col items-center justify-center relative cursor-pointer flex-shrink-0 transition-all duration-300')
              ">
              
              <!-- عدد روز به صورت درشت در بالای کارت -->
              <span class="font-mono text-base font-black leading-tight">
                {{ formatNumber(day) }}
              </span>

              <!-- نام ماه در پایین کارت مربعی -->
              <span class="text-[10px] font-bold leading-tight mt-0.5 opacity-90">
                شهریور
              </span>

              <!-- تیک سفید گوشه کارت در صورت تایید نهایی روز -->
              @if (isCompleted) {
                <span class="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-black absolute top-1 left-1 animate-in zoom-in-90">
                  ✓
                </span>
              }
            </button>
          }
        </div>
      </section>

      <!-- =========================================================================
           ۴. گرید مدرن ۲ ستونه کارت‌های غذا (2-COLUMN FOOD GRID)
           طبق بازخورد و دستور کاربر:
           - دکمه «انتخاب» به کلی از روی کارت‌ها برداشته شده و خود کارت قابل لمس است
           - با زدن روی کارت، اطلاعات عوض شده و کارت کاملاً مشکی می‌شود
           - کاربر نوع پرس (کامل/نیم‌پرس) و تعداد را داخل کارت مشکی تنظیم می‌کند
           ========================================================================= -->
      <section id="meals-food-grid" class="grid grid-cols-2 gap-3.5 px-5" data-purpose="food-cards-grid">
        @for (food of displayedFoods(); track food.id) {
          @let selected = isFoodSelected(food.id);

          @if (!selected) {
            <!-- حالت اول: کارت سفید عادی غذا؛ خود کارت قابل کلیک است و دکمه انتخاب حذف شده -->
            <article
              [id]="'food-card-' + food.id"
              (click)="selectFood(food.id)"
              role="button"
              tabindex="0"
              (keydown.enter)="selectFood(food.id)"
              (keydown.space)="selectFood(food.id)"
              [attr.aria-label]="'انتخاب ' + food.title"
              class="bg-white rounded-[24px] p-3.5 flex flex-col justify-between relative transition-all duration-300 border-2 border-gray-100 hover:border-[#FF6B3D]/50 shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:shadow-md active:scale-[0.98] cursor-pointer min-h-[250px]">
              
              <!-- تصویر و ایموجی بزرگ غذا -->
              <div [id]="'food-visual-' + food.id" class="h-24 sm:h-28 w-full flex items-center justify-center relative mb-1">
                <span [class]="'text-6xl select-none filter drop-shadow-sm transform transition-transform duration-200 ' + food.transform">
                  {{ food.emoji }}
                </span>

                @if (food.badge) {
                  <span class="absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF6B3D] border border-orange-200/60">
                    {{ food.badge }}
                  </span>
                }
              </div>

              <!-- مشخصات غذا: نام، توضیحات کوتاه و قیمت به تومان -->
              <div class="mt-1">
                <h3 [id]="'food-name-' + food.id" class="text-[13px] font-black text-[#111111] leading-tight line-clamp-1">
                  {{ food.title }}
                </h3>
                <p [id]="'food-desc-' + food.id" class="text-[11px] text-[#8F8F8F] font-normal leading-snug line-clamp-2 mt-1 min-h-[30px]">
                  {{ food.subtitle }}
                </p>
                
                <!-- قیمت به تومان با ارقام فارسی روان -->
                <div [id]="'food-price-' + food.id" class="mt-2 flex items-baseline gap-1">
                  <span class="text-xs font-black text-[#111111] font-mono">
                    {{ formatPrice(food.price) }}
                  </span>
                  <span class="text-[10px] font-bold text-gray-500">تومان</span>
                </div>
              </div>

            </article>
          } @else {
            <!-- حالت دوم: کارت کاملاً مشکی، مخفی‌سازی تصویر و توضیحات و نمایش پنل پرس و تعداد -->
            <article
              [id]="'food-card-' + food.id"
              class="bg-[#111111] text-white rounded-[24px] p-3.5 flex flex-col justify-between relative transition-all duration-300 border-2 border-[#FF6B3D] shadow-xl shadow-black/30 min-h-[250px] animate-in fade-in zoom-in-95 duration-200">
              
              <!-- بخش بالای کارت مشکی: نام غذا + بج تایید و دکمه انصراف ✕ -->
              <div>
                <div class="flex items-center justify-between gap-1 mb-1">
                  <span class="text-[10px] font-extrabold text-[#FF6B3D] flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D] animate-pulse"></span>
                    <span id="selected-badge-{{ food.id }}">✓ انتخاب شد</span>
                  </span>

                  <!-- دکمه ضربدر برای لغو انتخاب و بازگشت به کارت سفید معمولی -->
                  <button
                    type="button"
                    (click)="cancelFoodSelection()"
                    aria-label="انصراف از این غذا"
                    class="w-6 h-6 rounded-full bg-white/10 hover:bg-rose-500/30 text-gray-400 hover:text-rose-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-all">
                    ✕
                  </button>
                </div>

                <h3 [id]="'food-name-' + food.id" class="text-[13px] font-black text-white leading-tight line-clamp-1 mt-1">
                  {{ food.title }}
                </h3>
              </div>

              <!-- بخش وسط کارت مشکی: انتخابگر نوع پرس (کامل یا نیم پرس) -->
              <div [id]="'portion-selector-' + food.id" class="py-2 border-y border-white/10 my-auto flex flex-col gap-1.5">
                <span class="text-[10px] font-bold text-gray-400">نوع پرس غذا:</span>
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    [id]="'btn-portion-full-' + food.id"
                    aria-label="پرس کامل"
                    (click)="setPortion(food.id, 'کامل')"
                    [class]="
                      getPortion(food.id) === 'کامل'
                        ? 'min-h-[38px] py-1.5 rounded-xl bg-[#FF6B3D] text-white text-[11px] font-black shadow-xs cursor-pointer flex items-center justify-center transition-all'
                        : 'min-h-[38px] py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-[11px] font-bold cursor-pointer flex items-center justify-center transition-all'
                    ">
                    کامل
                  </button>
                  <button
                    type="button"
                    [id]="'btn-portion-half-' + food.id"
                    aria-label="نیم پرس"
                    (click)="setPortion(food.id, 'نیم پرس')"
                    [class]="
                      getPortion(food.id) === 'نیم پرس'
                        ? 'min-h-[38px] py-1.5 rounded-xl bg-[#FF6B3D] text-white text-[11px] font-black shadow-xs cursor-pointer flex items-center justify-center transition-all'
                        : 'min-h-[38px] py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-[11px] font-bold cursor-pointer flex items-center justify-center transition-all'
                    ">
                    نیم پرس
                  </button>
                </div>
              </div>

              <!-- بخش پایین کارت مشکی: کنترلر تعداد و قیمت نهایی این آیتم -->
              <div class="flex flex-col gap-2 pt-1">
                <div class="flex items-center justify-between text-[11px] text-gray-400 px-0.5">
                  <span>تعداد پرس:</span>
                  <div class="flex items-baseline gap-1">
                    <span class="font-mono text-xs font-black text-white">{{ formatPrice(food.price * getQuantity(food.id)) }}</span>
                    <span class="text-[9px]">تومان</span>
                  </div>
                </div>

                <div [id]="'qty-selector-' + food.id" class="flex items-center justify-between bg-white/10 rounded-2xl p-1 border border-white/10">
                  <button
                    type="button"
                    [id]="'btn-qty-minus-' + food.id"
                    aria-label="کاهش تعداد"
                    (click)="decreaseQuantity(food.id)"
                    class="w-9 h-9 min-h-[38px] min-w-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base font-black cursor-pointer transition-all">
                    -
                  </button>

                  <span [id]="'qty-display-' + food.id" class="text-sm font-black text-white font-mono px-2">
                    {{ formatNumber(getQuantity(food.id)) }}
                    <span class="sr-only">{{ getQuantity(food.id) }}</span>
                  </span>

                  <button
                    type="button"
                    [id]="'btn-qty-plus-' + food.id"
                    aria-label="افزایش تعداد"
                    (click)="increaseQuantity(food.id)"
                    class="w-9 h-9 min-h-[38px] min-w-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base font-black cursor-pointer transition-all">
                    +
                  </button>
                </div>
              </div>

            </article>
          }
        } @empty {
          <div id="no-meals-found" class="col-span-2 py-10 text-center text-gray-500">
            <span class="text-4xl mb-2 inline-block">🍱</span>
            <p class="text-sm font-bold text-[#111111]">غذایی برای این روز ثبت نشده است</p>
          </div>
        }
      </section>

      <!-- =========================================================================
           ۵. نوار اکشن جزیره‌ای پایین
           طبق درخواست دقیق کاربر:
           - دایره مشکی: تاریخ همین روزی را نشان می‌دهد که کاربر در حال انتخاب آن است
           - دکمه ادامه: در صورت عدم انتخاب غذا غیرفعال و خاکستری است و با انتخاب غذا نارنجی و روشن می‌شود
           - با زدن دکمه ادامه: روز جاری تایید شده، مربع بالا نارنجی می‌شود و فلو به روز بعد می‌رود
           ========================================================================= -->
      <footer
        id="meals-island-nav"
        class="fixed inset-x-0 bottom-5 z-40 flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]"
        data-purpose="meals-island-navigation">
        
        <div
          id="meals-island-container"
          class="w-full max-w-[360px] h-[65px] flex items-center justify-between pointer-events-auto select-none transition-all duration-500 ease-out gap-2.5">
          
          <!-- دایره مشکی تاریخ روز انتخابی جاری (طبق درخواست صریح کاربر: تاریخ روز انتخابی جاری) -->
          <div
            id="meals-black-circle-section"
            class="w-[62px] h-[62px] rounded-full bg-[#111111] border border-white/15 shadow-2xl shadow-black/40 flex flex-col items-center justify-center text-white scale-100 opacity-100 transition-all duration-500 ease-out flex-shrink-0 relative overflow-hidden select-none cursor-pointer hover:border-orange-400/50 active:scale-95"
            [attr.aria-label]="'تاریخ روز انتخابی ' + formatNumber(foodStore.selectedDay()) + ' شهریور'">
            
            <span id="meals-circle-day-number" class="text-base sm:text-lg font-black leading-none text-white tracking-tight font-mono">
              {{ formatNumber(foodStore.selectedDay()) }}
            </span>
            <span id="meals-circle-month-name" class="text-[9px] font-bold text-gray-400 mt-0.5">
              شهریور
            </span>

            @if (hasMealForCurrentDay()) {
              <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D] absolute top-1.5 right-2 animate-pulse"></span>
            }
          </div>

          <!-- دکمه «ادامه»: در حالت عادی خاکستری و غیرفعال، پس از انتخاب غذا نارنجی و فعال -->
          <button
            type="button"
            id="btn-meals-cta-action"
            [disabled]="!hasMealForCurrentDay()"
            [attr.aria-label]="isAllDaysCompleted() ? 'تکمیل سفارش' : 'ادامه'"
            (click)="handleCtaClick()"
            [class]="
              hasMealForCurrentDay()
                ? 'flex-1 h-[62px] bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] rounded-full px-5 flex items-center justify-center shadow-2xl shadow-[#FF6B3D]/35 border border-white/20 transition-all duration-300 cursor-pointer text-white font-black text-lg gap-2'
                : 'flex-1 h-[62px] bg-gray-200 text-gray-400 rounded-full px-5 flex items-center justify-center border border-gray-200 shadow-none cursor-not-allowed transition-all duration-300 gap-2 select-none'
            ">
            
            @if (isAllDaysCompleted()) {
              <!-- با تکمیل تمام روزها، دکمه به تکمیل سفارش تغییر می‌یابد -->
              <span id="btn-meals-cta-label" class="tracking-tight animate-in fade-in zoom-in-95 duration-200">
                تکمیل سفارش
              </span>
              <svg class="w-5 h-5 text-white flex-shrink-0 animate-in fade-in duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            } @else {
              <!-- دکمه ادامه به همراه آیکون فلش جهت انتقال به روز بعد -->
              <span id="btn-meals-cta-label" class="tracking-tight">ادامه</span>
              <svg
                class="w-5 h-5 transform rotate-180 flex-shrink-0 transition-colors"
                [class]="hasMealForCurrentDay() ? 'text-white' : 'text-gray-400'"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            }

          </button>

        </div>

      </footer>

      <!-- پیام هشدار در صورتی که کاربر بدون انتخاب غذا اقدام کند -->
      @if (showValidationNotice()) {
        <div
          id="checkout-validation-toast"
          class="fixed bottom-24 inset-x-6 z-50 max-w-sm mx-auto bg-[#111111] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          <span>⚠️</span>
          <span>لطفاً ابتدا غذای روز {{ selectedDateLabel() }} را انتخاب کن.</span>
        </div>
      }

      <!-- پیام موفقیت تکمیل همه روزها -->
      @if (showCompletionNotice()) {
        <div
          id="checkout-completion-toast"
          class="fixed bottom-24 inset-x-6 z-50 max-w-sm mx-auto bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
          <span>🎉</span>
          <span>غذای تمام روزها با موفقیت انتخاب شد! سفارش آماده است.</span>
        </div>
      }

    </div>
  `,
})
export class MealsPage implements OnInit, AfterViewInit {
  // اینجکشن استور اصلی برای مدیریت داده‌ها
  readonly foodStore = inject(FoodStore);

  // رفرنس به المنت اسکرولر افقی روزها
  @ViewChild('daysScrollContainer') daysScrollContainer?: ElementRef<HTMLDivElement>;

  // پیام خطای عدم انتخاب غذا
  readonly showValidationNotice = signal<boolean>(false);

  // پیام موفقیت پایان فلو
  readonly showCompletionNotice = signal<boolean>(false);

  // تایمر مخفی کردن پیام خطا
  private noticeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // استخراج فرزند فعال
  readonly activeChild = computed(() => {
    if (this.foodStore.isExplicitChildSelected()) {
      return this.foodStore.selectedChild();
    }
    const selected = this.foodStore.selectedChild();
    if (selected && selected.id !== 'child-1') {
      return selected;
    }
    const ava = this.foodStore.children().find((c) => c.id === 'child-2' || c.name.includes('آوا'));
    const defaultChild = {
      id: 'child-2',
      name: 'آوا احمدی',
      grade: 'پایه دوم ابتدایی',
      school: 'دبستان دخترانه سرو',
      avatar: '👧',
      age: 8,
      dietaryNote: 'رژیم بدون بادام زمینی',
      favoriteFood: 'پاستا آلفردو',
      hasOrderToday: true,
    };
    return ava || selected || defaultChild;
  });

  // روزهای فعال تقویم
  readonly activeDays = computed(() => {
    return this.foodStore.activeCalendarDays();
  });

  // تعداد کل روزهای تقویم انتخابی
  readonly totalCalendarDaysCount = computed(() => {
    return this.activeDays().length;
  });

  // تعداد روزهایی که غذایشان اوکی و تایید شده
  readonly completedDaysCount = computed(() => {
    return this.foodStore.completedDays().length;
  });

  // تعداد روزهای باقی‌مانده که غذا ندارند
  readonly remainingDaysCount = computed(() => {
    return this.foodStore.remainingDaysCount();
  });

  // متن تاریخ روز انتخابی جاری
  readonly selectedDateLabel = computed(() => {
    const day = this.foodStore.selectedDay();
    return `${toPersianDigits(day)} شهریور`;
  });

  // بررسی اینکه آیا برای روز انتخابی فعلی غذا انتخاب شده یا نه
  readonly hasMealForCurrentDay = computed(() => {
    return this.foodStore.hasMealForDay(this.foodStore.selectedDay());
  });

  // بررسی این‌که آیا تمام روزها با انتخاب روز جاری کامل شده‌اند یا خیر
  readonly isAllDaysCompleted = computed(() => {
    const days = this.activeDays();
    if (days.length === 0) return false;
    const current = this.foodStore.selectedDay();
    const otherDays = days.filter((d) => d !== current);
    const otherDaysDone = otherDays.every((d) => this.isDayCompleted(d));
    return otherDaysDone && this.hasMealForCurrentDay();
  });

  // لیست غذاهای روز فعال جاری
  readonly displayedFoods = computed(() => {
    const day = this.foodStore.selectedDay();
    const mappedDay = this.foodStore.foodsByDate[day] ? day : (((((day - 12) % 7) + 7) % 7) + 12);
    return this.foodStore.foodsByDate[day] || this.foodStore.foodsByDate[mappedDay] || this.foodStore.foodsByDate[16] || [];
  });

  ngOnInit(): void {
    // شروع تمیز همیشه از اولین روز انتخاب‌شده
    const days = this.activeDays();
    if (days.length > 0) {
      // به اولین روزی که هنوز تایید نشده، یا روز اول لیست می‌رویم
      const firstUnconfirmed = days.find((d) => !this.isDayCompleted(d));
      this.foodStore.setSelectedDay(firstUnconfirmed ?? days[0]);
    }
  }

  ngAfterViewInit(): void {
    // تنظیم پوزیشن اولیه بدون دستکاری اسکرول عمودی صفحه
    this.centerActiveDay();
  }

  // بررسی این‌که آیا روز مورد نظر تایید شده و نارنجی است یا خیر
  isDayCompleted(day: number): boolean {
    return this.foodStore.isDayCompleted(day);
  }

  // بررسی این‌که آیا روز مورد نظر، روز فعال فعلی است یا نه
  isCurrentDay(day: number): boolean {
    return this.foodStore.selectedDay() === day;
  }

  // تغییر روز فعال با کلیک کاربر روی کارت‌های مربعی روزها
  selectDay(day: number): void {
    this.foodStore.setSelectedDay(day);
    this.centerActiveDay(day);
  }

  // اسکرول نرم و دقیق فقط روی خود کانتینر افقی روزها (بدون بالا پریدن صفحه)
  centerActiveDay(day?: number): void {
    const targetDay = day ?? this.foodStore.selectedDay();
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      const container = this.daysScrollContainer?.nativeElement || document.getElementById('days-scroll-container');
      const targetPill = document.getElementById(`day-pill-${targetDay}`);
      if (container && targetPill) {
        const containerWidth = container.clientWidth;
        const targetLeft = targetPill.offsetLeft;
        const targetWidth = targetPill.clientWidth;
        const scrollPos = targetLeft - (containerWidth / 2) + (targetWidth / 2);
        container.scrollTo({
          left: scrollPos,
          behavior: 'smooth',
        });
      }
    }, 50);
  }

  // بررسی وضعیت انتخاب غذا در روز جاری
  isFoodSelected(foodId: string): boolean {
    const currentDay = this.foodStore.selectedDay();
    const daySelection = this.foodStore.dayMealSelections()[currentDay];
    if (daySelection) {
      return daySelection.foodId === foodId && daySelection.quantity > 0;
    }
    return false;
  }

  // با زدن روی کارت غذا، غذا انتخاب شده و کارت مشکی می‌شود
  selectFood(foodId: string): void {
    if (this.showValidationNotice()) {
      this.showValidationNotice.set(false);
      if (this.noticeTimeoutId) {
        clearTimeout(this.noticeTimeoutId);
        this.noticeTimeoutId = null;
      }
    }

    const currentDay = this.foodStore.selectedDay();
    const currentPortion = this.foodStore.getPortion(foodId) || 'کامل';
    this.foodStore.setMealForDay(currentDay, foodId, currentPortion, 1);
  }

  // انصراف از انتخاب این غذا و بازگرداندن کارت به حالت سفید عادی
  cancelFoodSelection(): void {
    const currentDay = this.foodStore.selectedDay();
    this.foodStore.removeMealForDay(currentDay);
  }

  // افزایش تعداد غذای روز جاری
  increaseQuantity(foodId: string): void {
    const currentDay = this.foodStore.selectedDay();
    const currentQty = this.getQuantity(foodId);
    const currentPortion = this.getPortion(foodId);
    this.foodStore.setMealForDay(currentDay, foodId, currentPortion, currentQty + 1);
  }

  // کاهش تعداد غذا؛ با رسیدن به صفر، از حالت انتخاب خارج می‌شود
  decreaseQuantity(foodId: string): void {
    const currentDay = this.foodStore.selectedDay();
    const currentQty = this.getQuantity(foodId);
    if (currentQty <= 1) {
      this.foodStore.removeMealForDay(currentDay);
    } else {
      const currentPortion = this.getPortion(foodId);
      this.foodStore.setMealForDay(currentDay, foodId, currentPortion, currentQty - 1);
    }
  }

  // رفتن به روز بعدی در لیست روزها
  goToNextDay(): void {
    const days = this.activeDays();
    const current = this.foodStore.selectedDay();
    const currentIndex = days.indexOf(current);

    if (currentIndex >= 0 && currentIndex < days.length - 1) {
      const nextDay = days[currentIndex + 1];
      this.foodStore.setSelectedDay(nextDay);
      this.centerActiveDay(nextDay);
    } else {
      const firstUncompleted = days.find((d) => !this.isDayCompleted(d));
      if (firstUncompleted) {
        this.foodStore.setSelectedDay(firstUncompleted);
        this.centerActiveDay(firstUncompleted);
      }
    }
  }

  // خواندن تعداد انتخاب‌شده برای این غذا
  getQuantity(foodId: string): number {
    const currentDay = this.foodStore.selectedDay();
    const daySelection = this.foodStore.dayMealSelections()[currentDay];
    if (daySelection && daySelection.foodId === foodId) {
      return daySelection.quantity;
    }
    return this.foodStore.getFoodItemCount(foodId);
  }

  // تنظیم نوع پرس
  setPortion(foodId: string, portion: 'کامل' | 'نیم پرس'): void {
    const currentDay = this.foodStore.selectedDay();
    const currentQty = Math.max(1, this.getQuantity(foodId));
    this.foodStore.setMealForDay(currentDay, foodId, portion, currentQty);
  }

  // خواندن نوع پرس
  getPortion(foodId: string): 'کامل' | 'نیم پرس' {
    return this.foodStore.getPortion(foodId);
  }

  // هندل کردن کلیک روی دکمه نارنجی ادامه یا تکمیل سفارش
  handleCtaClick(): void {
    const currentDay = this.foodStore.selectedDay();
    if (!this.hasMealForCurrentDay()) {
      return;
    }

    // ۱. تایید روز جاری تا مربع بالای صفحه نارنجی و تیک‌دار شود
    this.foodStore.confirmDay(currentDay);

    const days = this.activeDays();
    const allCompleted = days.length > 0 && days.every((d) => this.isDayCompleted(d));

    if (allCompleted) {
      this.showCompletionNotice.set(true);
      setTimeout(() => {
        this.showCompletionNotice.set(false);
        this.foodStore.goToCheckout();
      }, 700);
    } else {
      // ۲. رفتن به روز بعدی در تقویم
      this.goToNextDay();
    }
  }

  // فرمت عدد به فارسی
  formatNumber(value: number): string {
    return toPersianDigits(value);
  }

  // فرمت قیمت به تومان
  formatPrice(price: number): string {
    return toPersianDigits(price);
  }
}
