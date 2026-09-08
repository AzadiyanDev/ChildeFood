import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-parent-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- کارت پروفایل والد و کیف پول مدرسه - کاملا فلت، مینیمال، بدون هیچ گرادینت یا بلور -->
    <section id="parent-profile-section" class="px-4 mt-3" data-purpose="parent-profile-hub">
      <div class="bg-white rounded-2xl p-4 border border-zinc-200 shadow-xs">
        
        <!-- ردیف بالایی: مشخصات والد و دکمه تنظیمات پروفایل -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            (click)="foodStore.goToProfile()"
            class="flex items-center gap-3 text-right cursor-pointer bg-transparent border-0 p-0 transition-transform active:scale-[0.98] min-h-[44px]">
            
            <!-- آیکون آواتار والد -->
            <div class="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 flex-shrink-0 overflow-hidden">
              @if (foodStore.isImageAvatar(foodStore.parentProfile().avatar)) {
                <img [src]="foodStore.parentProfile().avatar" alt="Parent Avatar" class="w-full h-full object-cover" />
              } @else if (foodStore.parentProfile().avatar) {
                <span class="text-xl">{{ foodStore.parentProfile().avatar }}</span>
              } @else {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              }
            </div>

            <!-- مشخصات والد -->
            <div>
              <div class="flex items-center gap-2">
                <h2 id="parent-name" class="text-sm font-black text-zinc-900 tracking-tight">
                  {{ foodStore.parentProfile().name }}
                </h2>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono">
                  والد رسمی
                </span>
              </div>
              <p class="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1.5">
                <span class="font-mono text-[11px]">{{ foodStore.parentProfile().phone }}</span>
                <span class="text-zinc-400">•</span>
                <span>{{ foodStore.children().length }} فرزند در سامانه</span>
              </p>
            </div>
          </button>

          <!-- دکمه رفتن به صفحه تنظیمات با ارتفاع لمسی استاندارد -->
          <button
            type="button"
            (click)="foodStore.goToProfile()"
            aria-label="تنظیمات پروفایل"
            class="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-50 hover:bg-zinc-100 active:scale-95 border border-zinc-200 flex items-center justify-center text-zinc-600 transition-all cursor-pointer">
            <svg class="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- خط جداکننده باریک و تمیز -->
        <div class="h-px bg-zinc-100 my-3"></div>

        <!-- بخش موجودی کیف پول و کلیدهای شارژ سریع -->
        <div>
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[11px] text-zinc-500 font-medium block">اعتبار کیف پول مدرسه</span>
              <div class="flex items-baseline gap-1.5 mt-0.5">
                <span class="text-xl font-black text-zinc-900 tracking-tight font-mono">
                  {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
                </span>
                <span class="text-xs font-bold text-[#f97352]">تومان</span>
              </div>
            </div>

            <!-- دکمه مدیریت کیف پول -->
            <button
              type="button"
              id="btn-goto-wallet-card"
              (click)="foodStore.goToWallet()"
              class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-98 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
              <span>مدیریت کیف پول</span>
              <svg class="w-3.5 h-3.5 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          <!-- دکمه‌های شارژ سریع با ارتفاع استاندارد ۴۴ پیکسلی -->
          <div class="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-zinc-500 font-medium flex-shrink-0">شارژ سریع:</span>
            <div class="grid grid-cols-3 gap-2 flex-grow">
              <button
                type="button"
                (click)="quickRecharge(100000)"
                class="min-h-[44px] px-2 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-800 border border-zinc-200 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center">
                +۱۰۰,۰۰۰
              </button>
              <button
                type="button"
                (click)="quickRecharge(200000)"
                class="min-h-[44px] px-2 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 active:scale-95 text-zinc-800 border border-zinc-200 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center">
                +۲۰۰,۰۰۰
              </button>
              <button
                type="button"
                (click)="quickRecharge(500000)"
                class="min-h-[44px] px-2 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 active:scale-95 text-[#f97352] border border-orange-200 text-xs font-black font-mono transition-all cursor-pointer flex items-center justify-center">
                +۵۰۰,۰۰۰
              </button>
            </div>
          </div>

          <!-- پیام فیدبک بعد از شارژ موفق -->
          @if (rechargeFeedback()) {
            <div class="mt-2.5 text-center py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in flex items-center justify-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>اعتبار کیف پول با موفقیت افزایش یافت</span>
            </div>
          }
        </div>

      </div>
    </section>
  `,
})
export class ParentProfileCard {
  readonly foodStore = inject(FoodStore);
  private readonly destroyRef = inject(DestroyRef);
  
  // وضعیت نمایش پیام فیدبک شارژ موفق
  readonly rechargeFeedback = signal<boolean>(false);
  
  // تایمر برای بستن خودکار پیام فیدبک بعد از چند ثانیه
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // تمیزکاری تایمر موقع دیستروی کامپوننت برای اینکه نشت حافظه ایجاد نشه
    this.destroyRef.onDestroy(() => {
      if (this.feedbackTimer) {
        clearTimeout(this.feedbackTimer);
      }
    });
  }

  // متد شارژ سریع؛ حساب رو شارژ می‌کنه و فیدبک نشون میده
  quickRecharge(amount: number): void {
    if (amount <= 0) return;
    this.foodStore.addWalletBalance(amount);
    
    // اگه تایمر قبلی هنوز فعاله، اول ریستش می‌کنیم که تداخل پیش نیاد
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
    
    this.rechargeFeedback.set(true);
    this.feedbackTimer = setTimeout(() => {
      this.rechargeFeedback.set(false);
      this.feedbackTimer = null;
    }, 2500);
  }
}
