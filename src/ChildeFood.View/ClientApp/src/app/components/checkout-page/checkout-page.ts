import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore, toPersianDigits} from '../../services/food-store';

interface CheckoutOrderItem {
  dayNumber: number;
  dateLabel: string;
  foodId: string;
  foodName: string;
  foodSubtitle: string;
  foodEmoji: string;
  foodImage: string;
  portion: 'کامل' | 'نیم پرس';
  portionLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-checkout-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="checkout-page-view" class="pt-2 pb-36 animate-in fade-in duration-200 select-none" dir="rtl">

      <!-- =========================================================================
           ۱. بخش سربرگ فشرده و استاندارد بررسی سفارش (CLEAN HEADER)
           سمت راست: فقط عنوان بولد «بررسی و تکمیل سفارش» بدون زیرعنوان
           سمت چپ: ایندیکیتور مرحله ۴ از ۵ جای دکمه قبلی بازگشت
           ========================================================================= -->
      <header id="checkout-header" class="flex items-center justify-between gap-3 px-5 mb-4">
        
        <!-- سمت راست در RTL: فقط عنوان اصلی بدون هیچ متن زیرعنوان -->
        <div class="flex items-center text-right">
          <h1 id="checkout-title" class="text-lg sm:text-xl font-black text-[#111111] tracking-tight leading-tight">
            بررسی و تکمیل سفارش
          </h1>
        </div>

        <!-- سمت چپ در RTL: ایندیکیتور مرحله ۴ از ۵ چسبیده به سمت چپ (جایگزین دکمه قبلی بازگشت) -->
        <div id="checkout-progress-indicator" class="flex flex-col items-end text-left flex-shrink-0">
          <span id="checkout-progress-step" class="text-[11px] font-black text-gray-700">مرحله ۴ از ۵</span>
          <div class="flex items-center gap-1 mt-1" aria-label="● ● ● ● ○">
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#FF6B3D]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            <span class="sr-only">● ● ● ● ○</span>
          </div>
        </div>

      </header>

      <!-- =========================================================================
           ۲. کارت مشخصات دانش‌آموز و روزهای انتخابی (STUDENT INFORMATION CARD)
           کارت گرد سفید، آواتار آوا احمدی، پایه دوم ابتدایی، مدرسه سرو، روزهای انتخابی
           ========================================================================= -->
      <section id="checkout-student-card" class="px-5 mb-4" data-purpose="student-information">
        <div class="bg-white rounded-[24px] p-4 border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] transition-all">
          
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <!-- آواتار گرد کودک -->
              <div class="w-12 h-12 rounded-full bg-orange-50 border border-orange-100/80 flex items-center justify-center text-2xl flex-shrink-0 shadow-xs overflow-hidden">
                <span id="checkout-child-avatar" class="w-full h-full flex items-center justify-center">
                  @if (foodStore.isImageAvatar(activeChild().avatar)) {
                    <img [src]="activeChild().avatar" [alt]="activeChild().name" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
                  } @else {
                    {{ activeChild().avatar }}
                  }
                </span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 id="checkout-child-name" class="text-sm font-black text-[#111111] truncate">
                    {{ activeChild().name }}
                  </h2>
                  <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                    دانش‌آموز
                  </span>
                </div>
                <p id="checkout-child-grade" class="text-xs text-[#8F8F8F] font-normal truncate mt-0.5">
                  {{ activeChild().grade }} • {{ activeChild().school }}
                </p>
              </div>
            </div>

            <!-- دکمه ویرایش تاریخ‌ها و غذا -->
            <button
              type="button"
              id="btn-edit-meals"
              (click)="foodStore.goToMeals()"
              class="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#FF6B3D] hover:text-[#FF6B3D] bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer flex-shrink-0">
              ویرایش
            </button>
          </div>

          <!-- نوار خلاصه روزهای رزرو شده -->
          <div class="pt-3 border-t border-gray-100/80 flex items-center justify-between text-xs">
            <span class="text-gray-500 flex items-center gap-1.5">
              <span>📅</span>
              <span class="font-medium">روزهای انتخابی:</span>
            </span>
            <span id="checkout-selected-dates-badge" class="font-black text-gray-900 bg-gray-100/80 px-2.5 py-1 rounded-lg">
              {{ selectedDatesSummaryText() }}
            </span>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۳. لیست اقلام سفارش و وعده‌های غذایی (ORDER ITEMS)
           کارت‌های مینیمال و شیک شامل تاریخ، عکس/اموجی غذا، نام، پرس کامل/نیم پرس، تعداد، قیمت
           ========================================================================= -->
      <section id="checkout-order-items-section" class="px-5 mb-4" data-purpose="order-items-summary">
        
        <div class="flex items-center justify-between mb-2.5 px-1">
          <h3 class="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
            <span>🍱</span>
            <span>وعده‌های غذایی انتخابی ({{ formatNumber(orderItems().length) }} وعده)</span>
          </h3>
          <span class="text-[11px] text-[#8F8F8F] font-medium">تحویل گرم در مدرسه</span>
        </div>

        <div class="space-y-2.5">
          @for (item of orderItems(); track item.dayNumber + '-' + item.foodId) {
            <div
              [id]="'order-item-card-' + item.dayNumber"
              class="bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
              
              <!-- تصویر غذا، تاریخ و مشخصات -->
              <div class="flex items-center gap-3 min-w-0">
                
                <!-- باکس تصویر غذا با اموجی و فال‌بک تصویری -->
                <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-xs">
                  <span class="text-3xl select-none">{{ item.foodEmoji }}</span>
                  <div class="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[8px] text-center font-mono py-0.5 backdrop-blur-xs">
                    {{ formatNumber(item.dayNumber) }} شهریور
                  </div>
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                      {{ item.dateLabel }}
                    </span>
                    <span class="text-[10px] font-bold text-[#FF6B3D] bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100/60">
                      {{ item.portionLabel }}
                    </span>
                  </div>

                  <h4 class="text-xs sm:text-sm font-black text-gray-900 truncate">
                    {{ item.foodName }}
                  </h4>
                  <p class="text-[11px] text-gray-400 truncate mt-0.5">
                    {{ item.foodSubtitle }}
                  </p>
                </div>
              </div>

              <!-- تعداد و قیمت کل آیتم -->
              <div class="flex flex-col items-end flex-shrink-0 text-left">
                <span class="text-xs font-bold text-gray-500 mb-0.5">
                  {{ formatNumber(item.quantity) }} × {{ formatPrice(item.unitPrice) }}
                </span>
                <span class="text-xs sm:text-sm font-black text-[#111111] font-mono">
                  {{ formatPrice(item.totalPrice) }} تومان
                </span>
              </div>

            </div>
          }
        </div>

      </section>

      <!-- =========================================================================
           ۴. بخش کد تخفیف (DISCOUNT SECTION)
           کارت مجزا با فیلد ورودی، دکمه اعمال و نمایش وضعیت موفقیت‌آمیز
           ========================================================================= -->
      <section id="checkout-discount-card" class="px-5 mb-4" data-purpose="discount-code">
        <div class="bg-white rounded-[24px] p-4 border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
              <span>🎟️</span>
              <span>کد تخفیف دارید؟</span>
            </span>
            @if (isDiscountApplied()) {
              <span class="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60">
                کد فعال است
              </span>
            }
          </div>

          @if (!isDiscountApplied()) {
            <div class="flex items-center gap-2 mt-2">
              <div class="relative flex-1">
                <input
                  type="text"
                  id="input-discount-code"
                  placeholder="کد خود را وارد کنید (مثلاً MADRESEH)"
                  [value]="discountCodeInput()"
                  (input)="onDiscountInput($event)"
                  class="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#FF6B3D] transition text-right" />
              </div>
              <button
                type="button"
                id="btn-apply-discount"
                [disabled]="!discountCodeInput().trim()"
                (click)="applyDiscount()"
                class="min-h-[44px] px-4 rounded-xl bg-gray-900 hover:bg-black active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-black transition-all cursor-pointer">
                اعمال
              </button>
            </div>

            @if (discountError()) {
              <p class="text-[11px] text-red-500 font-bold mt-1.5 text-right">
                {{ discountError() }}
              </p>
            }
          } @else {
            <!-- کارت وضعیت موفقیت اعمال تخفیف -->
            <div class="mt-2 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">🎉</span>
                <div>
                  <p class="text-xs font-black text-emerald-900">
                    کد تخفیف «{{ appliedCodeLabel() }}» با موفقیت اعمال شد
                  </p>
                  <p class="text-[11px] text-emerald-700 font-medium mt-0.5">
                    مبلغ {{ formatPrice(discountAmount()) }} تومان از فاکتور شما کسر گردید.
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-remove-discount"
                (click)="removeDiscount()"
                class="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-white rounded-lg border border-red-200 transition cursor-pointer">
                حذف
              </button>
            </div>
          }

        </div>
      </section>

      <!-- =========================================================================
           ۵. روش پرداخت با رادیو باتن (PAYMENT METHOD SELECTION)
           انتخاب پرداخت از کیف پول با نمایش موجودی، یا درگاه شتاب آنلاین
           ========================================================================= -->
      <section id="checkout-payment-method-card" class="px-5 mb-4" data-purpose="payment-methods">
        <div class="bg-white rounded-[24px] p-4 border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          
          <h3 class="text-xs font-extrabold text-[#111111] mb-3 flex items-center gap-1.5">
            <span>💳</span>
            <span>روش پرداخت</span>
          </h3>

          <div class="space-y-2.5">
            
            <!-- گزینه ۱: کیف پول حساب کاربری -->
            <button
              type="button"
              id="payment-option-wallet"
              (click)="selectPaymentMethod('wallet')"
              class="w-full text-right flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer"
              [class]="selectedPaymentMethod() === 'wallet' ? 'border-[#FF6B3D] bg-orange-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'">
              
              <div class="flex items-center gap-3">
                <!-- رادیو باتن سفارشی -->
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  [class]="selectedPaymentMethod() === 'wallet' ? 'border-[#FF6B3D]' : 'border-gray-300'">
                  @if (selectedPaymentMethod() === 'wallet') {
                    <div class="w-2.5 h-2.5 rounded-full bg-[#FF6B3D]"></div>
                  }
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-gray-900">کیف پول مدرسه</span>
                    <span class="text-[10px] text-gray-500 font-normal">
                      (موجودی: {{ formatPrice(walletBalance()) }} تومان)
                    </span>
                  </div>
                  <p class="text-[11px] font-medium mt-0.5"
                    [class]="isWalletSufficient() ? 'text-emerald-600' : 'text-amber-600'">
                    {{ isWalletSufficient() ? 'موجودی کیف پول برای این سفارش کافی است' : 'موجودی کمتر از مبلغ است (نیاز به شارژ)' }}
                  </p>
                </div>
              </div>

              <span class="text-2xl">👛</span>
            </button>

            <!-- گزینه ۲: پرداخت اینترنتی آنلاین شتاب -->
            <button
              type="button"
              id="payment-option-online"
              (click)="selectPaymentMethod('online')"
              class="w-full text-right flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer"
              [class]="selectedPaymentMethod() === 'online' ? 'border-[#FF6B3D] bg-orange-50/30' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'">
              
              <div class="flex items-center gap-3">
                <!-- رادیو باتن سفارشی -->
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  [class]="selectedPaymentMethod() === 'online' ? 'border-[#FF6B3D]' : 'border-gray-300'">
                  @if (selectedPaymentMethod() === 'online') {
                    <div class="w-2.5 h-2.5 rounded-full bg-[#FF6B3D]"></div>
                  }
                </div>

                <div>
                  <span class="text-xs font-black text-gray-900">پرداخت اینترنتی با کارت شتاب</span>
                  <p class="text-[11px] text-gray-400 font-normal mt-0.5">
                    اتصال به کلیه بانک‌های عضو شتاب از طریق درگاه امن شاپرک
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 text-base">
                <span>🏦</span>
              </div>
            </button>

          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۶. خلاصه مالی پرداخت (PAYMENT SUMMARY)
           جمع غذاها، تخفیف، هزینه ارسال، مبلغ نهایی قابل پرداخت با تایپوگرافی قوی
           ========================================================================= -->
      <section id="checkout-payment-summary-card" class="px-5 mb-6" data-purpose="pricing-breakdown">
        <div class="bg-white rounded-[24px] p-4 border border-gray-100 shadow-[0_2px_14px_rgba(0,0,0,0.03)] space-y-3">
          
          <h3 class="text-xs font-extrabold text-[#111111] flex items-center gap-1.5 pb-1 border-b border-gray-100">
            <span>🧾</span>
            <span>صورتحساب نهایی سفارش</span>
          </h3>

          <!-- جمع کل غذاها -->
          <div class="flex justify-between items-center text-xs text-gray-600">
            <span>جمع مبالغ غذاها ({{ formatNumber(orderItems().length) }} وعده):</span>
            <span class="font-bold text-gray-900 font-mono">{{ formatPrice(rawSubtotal()) }} تومان</span>
          </div>

          <!-- تخفیف -->
          <div class="flex justify-between items-center text-xs text-gray-600">
            <span>تخفیف اعمال شده:</span>
            @if (discountAmount() > 0) {
              <span class="font-bold text-emerald-600 font-mono">- {{ formatPrice(discountAmount()) }} تومان</span>
            } @else {
              <span class="text-gray-400">۰ تومان</span>
            }
          </div>

          <!-- هزینه خدمات و پذیرایی -->
          <div class="flex justify-between items-center text-xs text-gray-600">
            <span>هزینه پذیرایی و تحویل در مدرسه:</span>
            <span class="font-bold text-emerald-600">رایگان (طرح سلامت مدارس)</span>
          </div>

          <!-- خط جداکننده -->
          <div class="border-t border-dashed border-gray-200 my-1"></div>

          <!-- مبلغ نهایی با تایپوگرافی درشت و چشم‌نواز -->
          <div class="flex justify-between items-center pt-1">
            <div>
              <span class="text-sm font-black text-gray-900">مبلغ نهایی قابل پرداخت:</span>
              <p class="text-[10px] text-gray-400 mt-0.5">شامل مالیات و عوارض قانونی</p>
            </div>
            <div class="text-left">
              <span id="checkout-final-price" class="text-lg sm:text-xl font-black text-[#111111] font-mono leading-none">
                {{ formatPrice(finalPayableAmount()) }}
              </span>
              <span class="text-xs font-bold text-gray-500 mr-1">تومان</span>
            </div>
          </div>

        </div>
      </section>

      <!-- =========================================================================
           ۷. نوار اکشن جزیره‌ای پایین صفحه دقیقا مشابه صفحه قبل (FLOATING ISLAND BAR)
           شامل:
           - المان مشکی حاوی قیمت نهایی که بر اساس تعداد ارقام کشیده و بزرگ‌تر می‌شود
           - دکمه نارنجی «تکمیل سفارش» با آیکون تیک دقیقا با طراحی و ابعاد صفحه قبل
           ========================================================================= -->
      <footer
        id="checkout-island-nav"
        class="fixed inset-x-0 bottom-5 z-40 flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom,0px)]"
        data-purpose="checkout-island-navigation">
        
        <div
          id="checkout-island-container"
          class="w-full max-w-[360px] h-[65px] flex items-center justify-between pointer-events-auto select-none transition-all duration-500 ease-out gap-2.5">
          
          <!-- دایره مشکی قیمت نهایی: با افزایش ارقام قیمت به صورت کپسولی کشیده و عریض‌تر می‌شود -->
          <div
            id="checkout-black-price-section"
            class="h-[62px] rounded-full bg-[#111111] border border-white/15 shadow-2xl shadow-black/40 flex flex-col items-center justify-center text-white scale-100 opacity-100 transition-all duration-300 ease-out flex-shrink-0 relative overflow-hidden select-none px-3 cursor-pointer hover:border-orange-400/50 active:scale-95"
            [style.width]="blackPriceBadgeWidth()"
            [style.min-width]="blackPriceBadgeWidth()"
            [attr.aria-label]="'مبلغ نهایی: ' + formatPrice(finalPayableAmount()) + ' تومان'">
            
            <span id="checkout-badge-price-number" class="text-sm sm:text-base font-black leading-none text-white tracking-tight font-mono whitespace-nowrap">
              {{ formatPrice(finalPayableAmount()) }}
            </span>
            <span id="checkout-badge-price-unit" class="text-[9px] font-bold text-gray-400 mt-0.5 whitespace-nowrap">
              تومان
            </span>
          </div>

          <!-- دکمه «تکمیل سفارش» نارنجی دقیقا مشابه صفحه قبل با آیکون تیک -->
          <button
            type="button"
            id="btn-complete-checkout"
            [disabled]="isSubmitting() || (selectedPaymentMethod() === 'wallet' && !isWalletSufficient())"
            [attr.aria-label]="'تکمیل سفارش'"
            (click)="submitPayment()"
            class="flex-1 min-w-0 h-[62px] bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none rounded-full px-4 flex items-center justify-center shadow-2xl shadow-[#FF6B3D]/35 border border-white/20 transition-all duration-300 cursor-pointer text-white font-black text-base sm:text-lg gap-2 whitespace-nowrap overflow-hidden">
            
            @if (isSubmitting()) {
              <svg class="animate-spin h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span class="text-xs sm:text-sm font-bold tracking-tight">در حال پرداخت...</span>
            } @else {
              <span id="btn-checkout-cta-label" class="tracking-tight animate-in fade-in zoom-in-95 duration-200">
                تکمیل سفارش
              </span>
              <svg class="w-5 h-5 text-white flex-shrink-0 animate-in fade-in duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            }
          </button>

        </div>

      </footer>

      <!-- پیام هشدار در صورت عدم موجودی کافی کیف پول -->
      @if (selectedPaymentMethod() === 'wallet' && !isWalletSufficient()) {
        <div
          id="checkout-wallet-warning-toast"
          class="fixed bottom-24 inset-x-6 z-40 max-w-sm mx-auto bg-[#111111] text-amber-400 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 text-center">
          <span>⚠️</span>
          <span>موجودی کیف پول کافی نیست. لطفاً پرداخت اینترنتی را انتخاب کنید.</span>
        </div>
      }

      <!-- =========================================================================
           ۸. مدال جشن موفقیت ثبت سفارش (CELEBRATION OVERLAY)
           ========================================================================= -->
      @if (orderSuccessData(); as data) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              ✓
            </div>

            <div>
              <h3 class="text-lg font-black text-gray-900">سفارش با موفقیت ثبت شد!</h3>
              <p class="text-xs text-gray-500 mt-1">
                غذای ناهار برای {{ activeChild().name }} در {{ activeChild().school }} رزرو گردید.
              </p>
            </div>

            <div class="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-right space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">کد پیگیری سفارش:</span>
                <span class="font-mono font-bold text-gray-900">{{ data.trackingCode }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">مبلغ پرداخت شده:</span>
                <span class="font-mono font-bold text-emerald-600">{{ formatPrice(data.amount) }} تومان</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">روش پرداخت:</span>
                <span class="font-bold text-gray-800">{{ data.method === 'wallet' ? 'کیف پول مدرسه' : 'درگاه شتاب' }}</span>
              </div>
            </div>

            <div class="space-y-2 pt-2">
              <button
                type="button"
                id="btn-view-orders"
                (click)="viewOrders()"
                class="w-full py-3 bg-[#FF6B3D] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#e05432] transition cursor-pointer">
                مشاهده در تاریخچه سفارش‌ها
              </button>
              <button
                type="button"
                id="btn-back-home"
                (click)="backToHome()"
                class="w-full py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-200 transition cursor-pointer">
                بازگشت به صفحه اصلی
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class CheckoutPage {
  readonly foodStore = inject(FoodStore);

  // وضعیت ورودی کد تخفیف
  readonly discountCodeInput = signal<string>('');
  readonly isDiscountApplied = signal<boolean>(false);
  readonly appliedCodeLabel = signal<string>('');
  readonly discountAmount = signal<number>(0);
  readonly discountError = signal<string>('');

  // روش پرداخت انتخابی: 'wallet' یا 'online'
  readonly selectedPaymentMethod = signal<'wallet' | 'online'>('wallet');

  // وضعیت در حال ارسال فرم
  readonly isSubmitting = signal<boolean>(false);

  // داده‌های سفارش ثبت‌شده برای نمایش جشن موفقیت
  readonly orderSuccessData = signal<{
    trackingCode: string;
    amount: number;
    method: 'wallet' | 'online';
  } | null>(null);

  // فرزند فعال
  readonly activeChild = computed(() => {
    return this.foodStore.selectedChild();
  });

  // موجودی کیف پول والد
  readonly walletBalance = computed(() => {
    return this.foodStore.parentProfile().walletBalance;
  });

  // تولید اقلام سفارش ناهار برای بررسی نهایی
  readonly orderItems = computed<CheckoutOrderItem[]>(() => {
    const daySelections = this.foodStore.dayMealSelections();
    const allFoods = this.foodStore.foods();
    const activeDays = this.foodStore.activeCalendarDays();
    const items: CheckoutOrderItem[] = [];

    // روزهایی که کاربر غذا انتخاب کرده
    for (const day of activeDays) {
      const selection = daySelections[day];
      if (selection && selection.quantity > 0) {
        const food = allFoods.find((f) => f.id === selection.foodId) || this.foodStore.foodsByDate[day]?.[0];
        if (food) {
          items.push({
            dayNumber: day,
            dateLabel: `${toPersianDigits(day)} شهریور`,
            foodId: food.id,
            foodName: food.title,
            foodSubtitle: food.subtitle,
            foodEmoji: food.emoji,
            foodImage: `/assets/school_lunch_hero.jpg`,
            portion: selection.portion || 'کامل',
            portionLabel: (selection.portion || 'کامل') === 'کامل' ? 'پرس کامل' : 'نیم پرس',
            quantity: selection.quantity,
            unitPrice: food.price,
            totalPrice: food.price * selection.quantity,
          });
        }
      }
    }

    // اگر از صفحه غذاها هیچ آیتمی در نگاشت نبود، از اقلام سبد خرید استفاده می‌کنیم
    if (items.length === 0) {
      const cart = this.foodStore.cart();
      let dayCounter = 15;
      for (const [foodId, count] of Object.entries(cart)) {
        if (count > 0) {
          const food = allFoods.find((f) => f.id === foodId);
          if (food) {
            const portion = this.foodStore.getPortion(foodId);
            items.push({
              dayNumber: dayCounter,
              dateLabel: `${toPersianDigits(dayCounter)} شهریور`,
              foodId: food.id,
              foodName: food.title,
              foodSubtitle: food.subtitle,
              foodEmoji: food.emoji,
              foodImage: `/assets/school_lunch_hero.jpg`,
              portion: portion,
              portionLabel: portion === 'کامل' ? 'پرس کامل' : 'نیم پرس',
              quantity: count,
              unitPrice: food.price,
              totalPrice: food.price * count,
            });
            dayCounter++;
          }
        }
      }
    }

    // اگر باز هم خالی بود (مثلاً بازدید مستقیم)، منوی نمونه کامل و استاندارد برای آوا احمدی نشان داده می‌شود
    if (items.length === 0) {
      return [
        {
          dayNumber: 15,
          dateLabel: 'شنبه ۱۵ شهریور',
          foodId: 'pasta-alfredo',
          foodName: 'پاستا آلفردو با فیله مرغ',
          foodSubtitle: 'پاستا پنه با سس قارچ تازه و پنیر پارمسان',
          foodEmoji: '🍝',
          foodImage: `/assets/school_lunch_hero.jpg`,
          portion: 'کامل',
          portionLabel: 'پرس کامل',
          quantity: 1,
          unitPrice: 92000,
          totalPrice: 92000,
        },
        {
          dayNumber: 16,
          dateLabel: 'یکشنبه ۱۶ شهریور',
          foodId: 'burger-double-smash-16',
          foodName: 'برگر دوبل اسمش',
          foodSubtitle: 'دو لایه گوشت تازه با پنیر چدار دوبل',
          foodEmoji: '🍔',
          foodImage: `/assets/chef_kitchen_preview.jpg`,
          portion: 'کامل',
          portionLabel: 'پرس کامل',
          quantity: 1,
          unitPrice: 75000,
          totalPrice: 75000,
        },
      ];
    }

    return items;
  });

  // متن خلاصه روزهای انتخابی
  readonly selectedDatesSummaryText = computed(() => {
    const items = this.orderItems();
    if (items.length === 0) return 'روزهای کاری شهریور';
    const dayNumbers = items.map((i) => toPersianDigits(i.dayNumber)).join('، ');
    return `${dayNumbers} شهریور`;
  });

  // جمع کل مبالغ غذاها
  readonly rawSubtotal = computed(() => {
    return this.orderItems().reduce((sum, item) => sum + item.totalPrice, 0);
  });

  // مبلغ نهایی قابل پرداخت با احتساب تخفیف
  readonly finalPayableAmount = computed(() => {
    const subtotal = this.rawSubtotal();
    const discount = this.discountAmount();
    return Math.max(0, subtotal - discount);
  });

  // آیا موجودی کیف پول برای سفارش کافی است؟
  readonly isWalletSufficient = computed(() => {
    return this.walletBalance() >= this.finalPayableAmount();
  });

  // محاسبه عرض داینامیک دایره مشکی قیمت نهایی: با افزایش ارقام، دایره کشیده و عریض‌تر می‌شود
  readonly blackPriceBadgeWidth = computed(() => {
    const formattedPrice = this.formatPrice(this.finalPayableAmount());
    const length = formattedPrice.length;
    if (length <= 2) {
      return '62px';
    }
    const calculated = 62 + (length - 2) * 6.5;
    return `${Math.min(Math.round(calculated), 125)}px`;
  });

  onDiscountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.discountCodeInput.set(input.value);
    this.discountError.set('');
  }

  // اعمال کد تخفیف
  applyDiscount(): void {
    const code = this.discountCodeInput().trim().toUpperCase();
    if (!code) return;

    if (code === 'MADRESEH' || code === 'مدرسه') {
      const discount = Math.round(this.rawSubtotal() * 0.15);
      this.discountAmount.set(discount);
      this.appliedCodeLabel.set('MADRESEH (۱۵٪ تخفیف)');
      this.isDiscountApplied.set(true);
      this.discountError.set('');
    } else if (code === 'NOOR1403' || code === 'نور') {
      this.discountAmount.set(30000);
      this.appliedCodeLabel.set('NOOR1403 (۳۰,۰۰۰ تومان)');
      this.isDiscountApplied.set(true);
      this.discountError.set('');
    } else if (code === 'AVA' || code === 'آوا') {
      this.discountAmount.set(20000);
      this.appliedCodeLabel.set('AVA (۲۰,۰۰۰ تومان)');
      this.isDiscountApplied.set(true);
      this.discountError.set('');
    } else {
      // هر کد دیگری هم یک تخفیف خوش‌آمدگویی ۱۰,۰۰۰ تومانی دریافت می‌کند
      this.discountAmount.set(10000);
      this.appliedCodeLabel.set(`${code} (۱۰,۰۰۰ تومان)`);
      this.isDiscountApplied.set(true);
      this.discountError.set('');
    }
  }

  removeDiscount(): void {
    this.discountCodeInput.set('');
    this.isDiscountApplied.set(false);
    this.appliedCodeLabel.set('');
    this.discountAmount.set(0);
    this.discountError.set('');
  }

  selectPaymentMethod(method: 'wallet' | 'online'): void {
    this.selectedPaymentMethod.set(method);
  }

  // ثبت و پرداخت نهایی سفارش
  submitPayment(): void {
    const method = this.selectedPaymentMethod();
    if (method === 'wallet' && !this.isWalletSufficient()) {
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const items = this.orderItems();
      const ordersPayload = items.map((i) => ({
        foodTitle: i.foodName,
        foodSubtitle: i.foodSubtitle,
        foodEmoji: i.foodEmoji,
        date: `${toPersianDigits(i.dayNumber)} شهریور`,
        price: i.totalPrice,
        portion: i.portionLabel,
      }));

      const trackingCode = this.foodStore.finalizeCheckoutOrder(
        method,
        this.discountAmount(),
        ordersPayload,
      );

      this.isSubmitting.set(false);
      this.orderSuccessData.set({
        trackingCode,
        amount: this.finalPayableAmount(),
        method,
      });
    }, 750);
  }

  viewOrders(): void {
    this.orderSuccessData.set(null);
    this.foodStore.goToOrders();
  }

  backToHome(): void {
    this.orderSuccessData.set(null);
    this.foodStore.goToHome();
  }

  formatNumber(val: number): string {
    return toPersianDigits(val);
  }

  formatPrice(val: number): string {
    return toPersianDigits(val);
  }
}
