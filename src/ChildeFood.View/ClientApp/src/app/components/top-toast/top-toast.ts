import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FoodStore} from '../../services/food-store';

// توستر اختصاصی از بالای صفحه برای شبیه‌سازی دریافت پیامک حاوی کد اوتی‌پی
// طبق خواسته پروژه چون پنل پیامکی وصل نیست، این توستر از بالا سُر می‌خوره میاد پایین و کد رو به همراه دکمه جای‌گذاری سریع نشون می‌ده
@Component({
  selector: 'app-top-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (foodStore.showOtpNotification() && foodStore.latestOtpCode()) {
      <aside
        id="top-otp-simulator-toast"
        aria-label="اعلان پیامک کد تایید"
        class="fixed top-4 inset-x-4 max-w-md mx-auto z-50 pointer-events-auto animate-in slide-in-from-top-6 duration-300">
        
        <div class="bg-[#111111]/95 backdrop-blur-md text-white rounded-3xl p-4 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col gap-3">
          
          <!-- سربرگ پیامک: آیکون اس‌ام‌اس، فرستنده و دکمه بستن -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-[#FF6B3D]/20 text-[#FF6B3D] border border-[#FF6B3D]/30 flex items-center justify-center text-sm shadow-xs">
                💬
              </div>
              <div>
                <span class="text-xs font-black text-white block">پیامک جدید (شبیه‌ساز بستر پیامک)</span>
                <span class="text-[10px] text-gray-400 font-medium">سامانه تغذیه سالم چایلدفود</span>
              </div>
            </div>

            <!-- دکمه بستن توستر -->
            <button
              type="button"
              id="btn-close-top-toast"
              (click)="foodStore.dismissOtpToast()"
              aria-label="بستن اعلان"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer">
              ✕
            </button>
          </div>

          <!-- بدنه پیام و کد برجسته -->
          <div class="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span class="text-[11px] text-gray-300 block mb-0.5">کد تایید ورود شما:</span>
              <span id="toast-otp-code-display" class="text-xl font-black text-[#FF6B3D] tracking-widest font-mono select-all">
                {{ foodStore.latestOtpCode() }}
              </span>
            </div>

            <!-- دکمه فشردن جای‌گذاری سریع کد در فیلد ورودی -->
            <button
              type="button"
              id="btn-autofill-otp"
              (click)="foodStore.autoFillOtpCode()"
              class="px-3 py-2 bg-[#FF6B3D] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-[#FF6B3D]/30 flex items-center gap-1.5 transition cursor-pointer">
              <span>جای‌گذاری خودکار</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
          </div>

          <div class="flex items-center justify-between text-[10px] text-gray-400 font-medium px-1">
            <span>ارسال شده به: {{ foodStore.pendingPhone() || 'شماره شما' }}</span>
            <span class="text-amber-400">اعتبار کد: ۲ دقیقه</span>
          </div>

        </div>
      </aside>
    }
  `,
})
export class TopToast {
  readonly foodStore = inject(FoodStore);
}
