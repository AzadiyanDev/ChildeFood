import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  effect,
  inject,
  signal,
} from '@angular/core';
import {FoodStore} from '../../services/food-store';

// صفحه تایید کد اوتی‌پی ۵ رقمی
// با طراحی مدرن، کادرهای بزرگ با فوکوس پویا، هماهنگ با دیزاین سیستم مشکی و نارنجی چایلدفود
@Component({
  selector: 'app-auth-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="auth-otp-view" class="px-5 pt-6 pb-12 select-none animate-in fade-in duration-300 min-h-screen flex flex-col justify-between" data-purpose="auth-otp-page">
      
      <div>
        <!-- ۱. سربرگ، دکمه بازگشت و نشانگر مرحله -->
        <header class="mb-6">
          <div class="flex items-center justify-between mb-5">
            <button
              type="button"
              id="btn-otp-back-to-phone"
              (click)="handleBackToPhone()"
              aria-label="ویرایش شماره موبایل"
              class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
              <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <!-- نشانگر مرحله با تم مشکی شیک اپلیکیشن -->
            <span class="px-3 py-1 rounded-full bg-[#141517] text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
              <span>مرحله ۲ از ۲</span>
            </span>
          </div>

          <h1 class="text-2xl sm:text-[26px] font-black text-[#141517] tracking-tight leading-tight">
            کد تایید را وارد کنید
          </h1>
          <p class="text-xs sm:text-[13px] text-gray-500 font-medium mt-2 leading-relaxed">
            کد ۵ رقمی یکبارمصرف به شماره 
            <span class="font-bold text-gray-900 font-mono" dir="ltr">{{ foodStore.pendingPhone() }}</span> 
            ارسال شد.
          </p>

          <!-- دکمه ویرایش شماره موبایل با استایل کپسولی ملایم -->
          <button
            type="button"
            id="btn-edit-phone-link"
            (click)="handleBackToPhone()"
            class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#f97352] text-xs font-black border border-orange-200/60 hover:bg-orange-100 transition cursor-pointer">
            <span>✏️ ویرایش شماره موبایل</span>
          </button>
        </header>

        <!-- ۲. کارت ورود کد ۵ رقمی -->
        <main class="bg-white rounded-[32px] p-6 sm:p-7 border border-black/[0.06] shadow-[0_12px_36px_-10px_rgba(0,0,0,0.05)] relative">
          
          <form (submit)="handleVerify($event)" class="space-y-6">
            
            <div>
              <label class="text-xs font-black text-gray-700 block mb-4 text-center">
                کد ۵ رقمی دریافتی
              </label>

              <!-- ۵ کادر ورودی مدرن با فوکوس شکیل نارنجی -->
              <div class="flex items-center justify-center gap-2.5 sm:gap-3.5" dir="ltr">
                @for (digit of digits; track $index; let idx = $index) {
                  <input
                    #digitInput
                    [id]="'otp-digit-' + idx"
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    [value]="otpValues()[idx]"
                    (input)="onDigitInput(idx, $event)"
                    (keydown)="onKeyDown(idx, $event)"
                    (paste)="onPaste($event)"
                    [class]="
                      otpValues()[idx]
                        ? 'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-white border-2 border-[#f97352] text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#f97352]/15 transition font-mono shadow-xs'
                        : 'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl bg-[#f8f9fa] border-2 border-gray-200/80 text-gray-900 focus:outline-none focus:border-[#f97352] focus:bg-white focus:ring-4 focus:ring-[#f97352]/10 transition font-mono shadow-xs'
                    " />
                }
              </div>

              <!-- نمایش خطای اشتباه بودن کد -->
              @if (errorMessage()) {
                <div class="mt-4 text-rose-500 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                  <span>⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }
            </div>

            <!-- ۳. شمارنده معکوس و دکمه ارسال مجدد -->
            <div class="text-center pt-1">
              @if (countdown() > 0) {
                <span class="text-xs text-gray-400 font-medium">
                  امکان ارسال مجدد کد تا 
                  <span class="font-bold text-[#f97352] font-mono">{{ formatTime(countdown()) }}</span> 
                  دیگر
                </span>
              } @else {
                <button
                  type="button"
                  id="btn-resend-otp"
                  [disabled]="isResending()"
                  (click)="handleResendOtp()"
                  class="text-xs font-black text-[#f97352] hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>{{ isResending() ? 'در حال ارسال...' : 'ارسال مجدد کد تایید' }}</span>
                </button>
              }
            </div>

            <!-- ۴. دکمه تایید و ورود نهایی -->
            <div>
              <button
                type="submit"
                id="btn-submit-otp"
                [disabled]="isLoading() || isOtpIncomplete()"
                class="w-full py-4 bg-[#f97352] hover:bg-[#e05432] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-lg shadow-[#f97352]/25 flex items-center justify-center transition cursor-pointer">
                @if (isLoading()) {
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <div class="flex items-center justify-center gap-2">
                    <span>تایید و ورود به برنامه</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                }
              </button>
            </div>

          </form>

        </main>

        <!-- ۵. راهنمای تست در محیط دمو با قابلیت پر کردن با یک کلیک -->
        <aside class="mt-6 p-4 rounded-2xl bg-orange-50/70 border border-orange-200/60" aria-label="راهنمای دریافت کد">
          <div class="flex items-center justify-between mb-1">
            <p class="text-xs font-black text-[#f97352]">
              🔔 نکته تستی (حالت بدون پنل پیامکی):
            </p>
            <span class="text-[10px] font-bold text-orange-700/80 font-mono">کد: ۱۲۳۴۵</span>
          </div>
          <p class="text-[11px] text-gray-600 font-medium leading-relaxed">
            کد اوتی‌پی به صورت یک توستر از بالای صفحه نمایش داده شده است؛ با زدن دکمه «جای‌گذاری خودکار» روی پیامک بالا، کد به صورت خودکار در کادرها پر می‌شود.
          </p>
          <button
            type="button"
            (click)="quickFillTestCode()"
            class="mt-2.5 w-full py-2 bg-white hover:bg-orange-100 active:scale-95 text-[#f97352] border border-orange-200 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs">
            <span>⚡ جای‌گذاری خودکار کد تستی (۱۲۳۴۵)</span>
          </button>
        </aside>
      </div>

      <!-- ۶. پاورقی برنامه -->
      <footer class="mt-8 text-center">
        <p class="text-[11px] text-gray-400 font-medium">
          سامانه هوشمند تغذیه دانش‌آموزان چایلدفود
        </p>
      </footer>

    </div>
  `,
})
export class AuthOtp implements OnInit, OnDestroy {
  readonly foodStore = inject(FoodStore);

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly digits = [0, 1, 2, 3, 4];
  readonly otpValues = signal<string[]>(['', '', '', '', '']);
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isResending = signal<boolean>(false);
  readonly countdown = signal<number>(120);

  private timerInterval: any = null;

  constructor() {
    // اثر واکنشی: وقتی کاربر در توستر بالایی دکمه جای‌گذاری خودکار رو زد، اینپوت‌ها پر بشن
    effect(() => {
      const autoCode = this.foodStore.autoFilledOtp();
      if (autoCode && autoCode.length === 5) {
        const chars = autoCode.split('');
        this.otpValues.set(chars);
        this.errorMessage.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // پر کردن سریع کد تستی ۱۲۳۴۵ با یک کلیک
  quickFillTestCode(): void {
    const code = this.foodStore.latestOtpCode() || '12345';
    this.otpValues.set(code.split(''));
    this.errorMessage.set(null);
    // فوکوس روی دکمه یا آخرین خانه
    const lastInput = this.digitInputs?.toArray()[4]?.nativeElement;
    lastInput?.focus();
  }

  // شروع تایمر معکوس ۱۲۰ ثانیه‌ای
  private startCountdown(): void {
    this.countdown.set(120);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      if (this.countdown() > 0) {
        this.countdown.update((c) => c - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  isOtpIncomplete(): boolean {
    return this.otpValues().some((val) => !val);
  }

  // وارد کردن رقم در هر باکس و انتقال اتوماتیک فوکوس به باکس بعدی
  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;

    // تبدیل ارقام فارسی به انگلیسی
    val = this.foodStore.normalizePhoneString(val);

    if (val.length > 0) {
      // فقط آخرین رقم تایپ‌شده رو نگه می‌داریم
      const lastChar = val.slice(-1);
      const current = [...this.otpValues()];
      current[index] = lastChar;
      this.otpValues.set(current);
      input.value = lastChar;

      // فوکوس روی فیلد بعدی
      if (index < 4) {
        const nextInput = this.digitInputs.toArray()[index + 1]?.nativeElement;
        nextInput?.focus();
      }
    } else {
      const current = [...this.otpValues()];
      current[index] = '';
      this.otpValues.set(current);
    }

    if (this.errorMessage()) {
      this.errorMessage.set(null);
    }
  }

  // کنترل کلید Backspace برای برگشتن به باکس قبلی
  onKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      const current = [...this.otpValues()];
      if (!current[index] && index > 0) {
        const prevInput = this.digitInputs.toArray()[index - 1]?.nativeElement;
        prevInput?.focus();
      }
    }
  }

  // پشتیبانی از Paste کردن کل کد ۵ رقمی به یکباره
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanDigits = this.foodStore.normalizePhoneString(pastedData).replace(/\D/g, '').slice(0, 5);

    if (cleanDigits.length > 0) {
      const current = ['', '', '', '', ''];
      for (let i = 0; i < cleanDigits.length; i++) {
        current[i] = cleanDigits[i];
      }
      this.otpValues.set(current);

      // فوکوس روی آخرین خانه پر شده
      const targetIndex = Math.min(cleanDigits.length - 1, 4);
      this.digitInputs.toArray()[targetIndex]?.nativeElement?.focus();
    }
  }

  // بازگشت به صفحه وارد کردن شماره موبایل
  handleBackToPhone(): void {
    this.foodStore.goToLoginPhone();
  }

  // ارسال مجدد کد تایید
  async handleResendOtp(): Promise<void> {
    const phone = this.foodStore.pendingPhone();
    if (!phone) {
      this.handleBackToPhone();
      return;
    }

    this.isResending.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.requestOtp(phone);
      if (res.success) {
        this.startCountdown();
      } else {
        this.errorMessage.set(res.message || 'خطا در ارسال مجدد کد.');
      }
    } catch {
      this.errorMessage.set('خطا در ارتباط با سرور.');
    } finally {
      this.isResending.set(false);
    }
  }

  // تایید کد وارد شده و ورود به سامانه
  async handleVerify(event: Event): Promise<void> {
    event.preventDefault();
    if (this.isOtpIncomplete()) {
      this.errorMessage.set('لطفاً تمام ۵ رقم کد تایید را وارد کنید.');
      return;
    }

    const fullCode = this.otpValues().join('');
    const phone = this.foodStore.pendingPhone();

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const res = await this.foodStore.verifyOtp(phone, fullCode);
      if (res.success) {
        // احراز هویت با موفقیت انجام شد؛ استور کاربر را لاگین می‌کند و بر اساس وضعیت آنبوردینگ هدایتش می‌کند
        this.foodStore.completeLogin(res.user);
      } else {
        this.errorMessage.set(res.message || 'کد وارد شده صحیح نمی‌باشد.');
      }
    } catch {
      this.errorMessage.set('خطا در بررسی کد، لطفاً مجدداً تلاش نمایید.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
