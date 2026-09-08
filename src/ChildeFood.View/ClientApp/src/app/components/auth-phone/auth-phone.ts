import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

// صفحه اول احراز هویت: دریافت شماره موبایل والد جهت ارسال کد اوتی‌پی
// این صفحه با همان استایل مینیمال، شیک و گرم صفحات اصلی و پالت رنگی #FF6B3D طراحی شده
@Component({
  selector: 'app-auth-phone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="auth-phone-view" class="px-5 pt-8 pb-16 select-none animate-in fade-in duration-300 min-h-screen flex flex-col justify-between" data-purpose="auth-phone-page">
      
      <div>
        <!-- ۱. سربرگ و لوگوی جذاب سامانه -->
        <header class="text-center mb-8 relative">
          <!-- هاله نوری ملایم پشت سربرگ -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-44 h-44 bg-orange-100/50 rounded-full blur-3xl pointer-events-none"></div>

          <!-- بج و آیکون اصلی برنامه -->
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#111111] text-white text-3xl shadow-xl shadow-black/10 border border-white/10 mb-4 relative z-10 transform hover:scale-105 transition-transform">
            🍱
          </div>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B3D] border border-orange-200/60 text-[11px] font-black mb-3">
            <span>✨</span>
            <span>سامانه سفارش ناهار گرم مدارس</span>
          </div>

          <h1 class="text-2xl font-black text-[#141517] tracking-tight leading-tight">
            ورود یا عضویت در چایلدفود
          </h1>
          <p class="text-xs text-gray-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            برای مشاهده منوی روزانه مدرسه، رزرو ناهار گرم و مدیریت کیف پول، لطفاً شماره موبایلت را وارد کن.
          </p>
        </header>

        <!-- ۲. کارت فرم ورود شماره موبایل -->
        <main class="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          <form (submit)="handleSubmit($event)" class="space-y-4">
            
            <div>
              <label for="input-mobile-number" class="text-xs font-black text-gray-800 block mb-2">
                شماره تلفن همراه <span class="text-rose-500">*</span>
              </label>

              <div class="relative">
                <input
                  id="input-mobile-number"
                  type="tel"
                  dir="ltr"
                  inputmode="numeric"
                  maxlength="11"
                  [value]="phoneNumber()"
                  (input)="onPhoneInput($event)"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  class="w-full px-4 py-3.5 rounded-2xl bg-[#f8f9fa] border border-gray-200 text-sm font-black text-gray-900 focus:outline-none focus:border-[#FF6B3D] focus:bg-white text-left transition font-mono tracking-wider shadow-inner" />

                <!-- آیکون کوچک موبایل سمت راست اینپوت -->
                <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18h6" />
                  </svg>
                </div>
              </div>

              <!-- نمایش پیام خطای اعتبارسنجی فرمت شماره -->
              @if (errorMessage()) {
                <div class="mt-2 text-rose-500 text-[11px] font-bold flex items-center gap-1 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              } @else {
                <span class="text-[10px] text-gray-400 font-medium block mt-1.5">
                  کد تایید ۵ رقمی به این شماره ارسال خواهد شد.
                </span>
              }
            </div>

            <!-- دکمه دریافت کد تایید -->
            <div class="pt-2">
              <button
                type="submit"
                id="btn-request-otp"
                [disabled]="isLoading()"
                class="w-full py-4 bg-[#FF6B3D] hover:bg-[#e05432] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-lg shadow-[#FF6B3D]/30 flex items-center justify-center transition cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <div class="flex items-center justify-center gap-2">
                    <span>دریافت کد تایید</span>
                    <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                }
              </button>
            </div>

          </form>

        </main>

        <!-- ۳. کارت‌های کوچک ویژگی‌های سامانه و جلب اعتماد والد -->
        <div class="mt-8 grid grid-cols-3 gap-2.5">
          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] text-center shadow-xs">
            <span class="text-xl block mb-1">🥗</span>
            <span class="text-[10px] font-black text-gray-800 block">غذای گرم و سالم</span>
            <span class="text-[9px] text-gray-400">تایید بهداشت</span>
          </div>

          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] text-center shadow-xs">
            <span class="text-xl block mb-1">⚡</span>
            <span class="text-[10px] font-black text-gray-800 block">تحویل مستقیم</span>
            <span class="text-[9px] text-gray-400">در بوفه مدرسه</span>
          </div>

          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] text-center shadow-xs">
            <span class="text-xl block mb-1">💳</span>
            <span class="text-[10px] font-black text-gray-800 block">کیف پول هوشمند</span>
            <span class="text-[9px] text-gray-400">پرداخت بی‌دردسر</span>
          </div>
        </div>
      </div>

      <!-- ۴. پاورقی و توافقنامه حریم خصوصی -->
      <footer class="mt-8 text-center">
        <p class="text-[11px] text-gray-400 font-medium">
          ورود به چایلدفود به منزله پذیرش <a href="#" class="text-[#FF6B3D] underline">قوانین و مقررات</a> است.
        </p>
      </footer>

    </div>
  `,
})
export class AuthPhone {
  readonly foodStore = inject(FoodStore);

  // وضعیت شماره موبایل وارد شده
  readonly phoneNumber = signal<string>('');

  // پیام خطای اعتبارسنجی
  readonly errorMessage = signal<string | null>(null);

  // لودینگ ارتباط با بک‌اند
  readonly isLoading = signal<boolean>(false);

  // تغییر ورودی شماره موبایل
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.phoneNumber.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set(null);
    }
  }

  // سابمیت فرم شماره موبایل و درخواست کد اوتی‌پی از بک‌اند
  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const rawPhone = this.phoneNumber().trim();

    if (!rawPhone) {
      this.errorMessage.set('لطفاً شماره تلفن همراه خود را وارد کنید.');
      return;
    }

    // تبدیل ارقام فارسی به انگلیسی برای بررسی
    const normalized = this.foodStore.normalizePhoneString(rawPhone);
    const isValid = /^09\d{9}$/.test(normalized);

    if (!isValid) {
      this.errorMessage.set('شماره موبایل باید ۱۱ رقم بوده و با ۰۹ آغاز شود.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.requestOtp(normalized);
      if (res.success) {
        // هدایت مستقیم به صفحه دوم وارد کردن کد OTP
        this.foodStore.goToLoginOtp();
      } else {
        this.errorMessage.set(res.message || 'خطا در ارسال کد تایید.');
      }
    } catch {
      this.errorMessage.set('خطا در ارتباط با سرور، لطفاً مجدداً تلاش نمایید.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
