import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

// صفحه دریافت شماره موبایل جهت ورود یا ثبت‌نام
// این صفحه رو با زبان بصری جدید چایلدفود، تمیز، مدرن و با پالت شکیل نارنجی و مشکی بازطراحی کردیم
@Component({
  selector: 'app-auth-phone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="auth-phone-view" class="px-5 pt-8 pb-12 select-none animate-in fade-in duration-300 min-h-screen flex flex-col justify-between" data-purpose="auth-phone-page">
      
      <div>
        <!-- ۱. سربرگ اصلی با لوگوی رسمی چایلدفود و عنوان جذاب -->
        <header class="text-center mb-8 relative">
          <!-- هاله نوری ملایم و لوکس پشت لوگو -->
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

          <!-- لوگوی رسمی چایلدفود (جایگزین ایموجی قبلی) -->
          <div class="relative z-10 inline-block mb-4">
            <img
              src="/icon.svg"
              alt="چایلدفود"
              class="w-20 h-20 rounded-[26px] shadow-[0_10px_25px_-5px_rgba(249,115,82,0.35)] mx-auto object-cover transform hover:scale-105 transition-transform" />
          </div>

          <h1 class="text-2xl sm:text-[26px] font-black text-[#141517] tracking-tight leading-tight">
            ورود یا عضویت در چایلدفود
          </h1>
          <p class="text-xs sm:text-[13px] text-gray-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            برای مشاهده منوی روزانه مدرسه، رزرو ناهار گرم و مدیریت کیف پول، لطفاً شماره موبایلت را وارد کن.
          </p>
        </header>

        <!-- ۲. کارت فرم ورود شماره موبایل -->
        <main class="bg-white rounded-[32px] p-6 sm:p-7 border border-black/[0.06] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
          
          <form (submit)="handleSubmit($event)" class="space-y-4">
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="input-mobile-number" class="text-xs font-black text-gray-800">
                  شماره تلفن همراه <span class="text-rose-500">*</span>
                </label>
                <span class="text-[10px] text-gray-400 font-medium">ارقام انگلیسی یا فارسی</span>
              </div>

              <!-- فیلد ورودی شماره با نشان پرچم و کد کشور -->
              <div class="relative flex items-center">
                <input
                  id="input-mobile-number"
                  type="tel"
                  dir="ltr"
                  inputmode="numeric"
                  maxlength="11"
                  [value]="phoneNumber()"
                  (input)="onPhoneInput($event)"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  class="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-[#f8f9fa] border border-gray-200/90 text-sm font-black text-gray-900 focus:outline-none focus:border-[#f97352] focus:bg-white focus:ring-4 focus:ring-[#f97352]/10 text-left transition-all font-mono tracking-widest shadow-xs" />

                <!-- آیکون ظریف موبایل در سمت راست -->
                <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 18h6" />
                  </svg>
                </div>
              </div>

              <!-- پیام خطای اعتبارسنجی -->
              @if (errorMessage()) {
                <div class="mt-2.5 text-rose-500 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <span class="text-xs">⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              } @else {
                <span class="text-[10px] text-gray-400 font-medium block mt-2">
                  کد تایید ۵ رقمی به این شماره ارسال خواهد شد.
                </span>
              }
            </div>

            <!-- دکمه دریافت کد تایید با ارگونومی عالی -->
            <div class="pt-2">
              <button
                type="submit"
                id="btn-request-otp"
                [disabled]="isLoading()"
                class="w-full py-4 bg-[#f97352] hover:bg-[#e05432] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-lg shadow-[#f97352]/25 flex items-center justify-center transition cursor-pointer">
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

        <!-- ۳. کارت‌های اعتماد و ویژگی‌های چایلدفود (مدرن با آیکون‌های وکتوری به‌جای ایموجی‌های خام) -->
        <div class="mt-6 grid grid-cols-3 gap-2.5">
          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] text-center flex flex-col items-center">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <span class="text-[10px] font-black text-gray-800 block">غذای گرم و سالم</span>
            <span class="text-[9px] text-gray-400 font-medium mt-0.5">تایید بهداشت</span>
          </div>

          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] text-center flex flex-col items-center">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-[10px] font-black text-gray-800 block">تحویل مستقیم</span>
            <span class="text-[9px] text-gray-400 font-medium mt-0.5">در بوفه مدرسه</span>
          </div>

          <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-[0_2px_12px_-3px_rgba(0,0,0,0.03)] text-center flex flex-col items-center">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <span class="text-[10px] font-black text-gray-800 block">کیف پول هوشمند</span>
            <span class="text-[9px] text-gray-400 font-medium mt-0.5">پرداخت بی‌دردسر</span>
          </div>
        </div>
      </div>

      <!-- ۴. پاورقی و لینک قوانین و مقررات -->
      <footer class="mt-8 text-center">
        <p class="text-[11px] text-gray-400 font-medium">
          ورود به چایلدفود به منزله پذیرش <a href="#" class="text-[#f97352] font-bold hover:underline">قوانین و مقررات</a> است.
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
