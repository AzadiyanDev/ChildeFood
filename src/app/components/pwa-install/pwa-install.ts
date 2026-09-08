import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {PwaService} from '../../services/pwa';

@Component({
  selector: 'app-pwa-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Toast Overlay: شناور بر فراز المان‌ها بدون تغییر در چیدمان و هل دادن صفحه به پایین -->
    @if (!pwaService.isInstalled() && showToast()) {
      <div
        id="pwa-toast-wrapper"
        class="fixed top-3 inset-x-0 mx-auto max-w-md px-3 z-50 pointer-events-none transition-all duration-500 ease-out"
        [class.opacity-100]="isAnimatingIn()"
        [class.translate-y-0]="isAnimatingIn()"
        [class.opacity-0]="!isAnimatingIn()"
        [class.-translate-y-8]="!isAnimatingIn()">
        
        <aside
          id="pwa-install-banner"
          aria-label="نصب اپلیکیشن"
          (mouseenter)="pauseTimer()"
          (mouseleave)="resumeTimer()"
          class="pointer-events-auto bg-[#181a20]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/10 p-3 flex items-center justify-between gap-2.5 overflow-hidden relative">
          
          <!-- خط نشانگر زمان ۸ ثانیه‌ای توست -->
          <div
            class="absolute bottom-0 right-0 h-[2px] bg-[#FF6B3D] transition-all duration-100 ease-linear"
            [style.width.%]="progressPercent()">
          </div>

          <!-- بخش راست: آیکون و نوشته‌های اعلان -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-[#FF6B3D] flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
              🍲
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">نصب اپلیکیشن روی گوشی</p>
              <p class="text-[10px] text-gray-300 truncate mt-0.5">دسترسی سریع‌تر، بدون نیاز به مرورگر</p>
            </div>
          </div>

          <!-- بخش چپ: دکمه نصب و بستن -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button
              id="btn-install-pwa"
              type="button"
              (click)="onInstallClick()"
              class="px-3 py-1.5 bg-[#FF6B3D] hover:bg-[#e85a2d] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>نصب</span>
            </button>
            
            <button
              id="btn-dismiss-pwa-banner"
              type="button"
              (click)="dismissToast()"
              aria-label="بستن اعلان نصب"
              class="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer">
              ✕
            </button>
          </div>
        </aside>
      </div>
    }

    <!-- iOS / Fallback Installation Modal Guide -->
    @if (pwaService.showIOSModal()) {
      <div
        id="ios-install-backdrop"
        class="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
        
        <div
          id="ios-install-modal"
          class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95">
          
          <div class="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B3D] flex items-center justify-center text-2xl mx-auto mb-3">
            📲
          </div>

          <h3 id="ios-guide-title" class="text-base font-bold text-center text-gray-950 mb-2">
            نصب اپلیکیشن روی گوشی
          </h3>

          <div class="text-xs text-gray-600 space-y-2.5 my-4 bg-[#fafafa] p-3.5 rounded-2xl border border-gray-100">
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B3D] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۱</span>
              <p>در مرورگر خود، دکمه <strong>اشتراک‌گذاری (Share)</strong> یا منوی سه‌نقطه را باز کنید.</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B3D] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۲</span>
              <p>گزینه <strong>افزودن به صفحه اصلی (Add to Home Screen)</strong> را لمس کنید.</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B3D] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۳</span>
              <p>دکمه <strong>Add</strong> را بزنید تا برنامه مثل یک اپ اختصاصی نصب شود.</p>
            </div>
          </div>

          <button
            id="btn-close-ios-guide"
            type="button"
            (click)="pwaService.closeIOSModal()"
            class="w-full py-2.5 bg-[#17191d] hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer">
            متوجه شدم
          </button>
        </div>
      </div>
    }
  `,
})
export class PwaInstall implements OnInit, OnDestroy {
  readonly pwaService = inject(PwaService);

  // نمایش توست شناور
  readonly showToast = signal<boolean>(false);
  readonly isAnimatingIn = signal<boolean>(false);
  readonly progressPercent = signal<number>(100);

  // مدت زمان ماندگاری توست (۸ ثانیه، بین ۵ تا ۱۰ ثانیه مد نظر کاربر)
  private readonly TOAST_DURATION_MS = 8000;
  private remainingTimeMs = 8000;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private animTimeout: ReturnType<typeof setTimeout> | null = null;
  private isPaused = false;

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    // اگر از قبل نصب شده بود، اصلاً نباید بیاید
    if (this.pwaService.isInstalled()) {
      return;
    }

    // اگر در این سشن قبلاً بسته شده بود، مزاحم کاربر نشود
    try {
      if (sessionStorage.getItem('childe_pwa_dismissed') === 'true') {
        return;
      }
    } catch {
      // ignore
    }

    // فعال‌سازی توست با انیمیشن ورود ملایم از بالا
    this.showToast.set(true);
    this.animTimeout = setTimeout(() => {
      this.isAnimatingIn.set(true);
      this.startCountdown();
    }, 100);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private startCountdown(): void {
    this.clearTimers();
    const intervalStep = 100;
    this.timerInterval = setInterval(() => {
      if (this.isPaused) return;

      this.remainingTimeMs -= intervalStep;
      const percent = Math.max(0, (this.remainingTimeMs / this.TOAST_DURATION_MS) * 100);
      this.progressPercent.set(percent);

      if (this.remainingTimeMs <= 0) {
        this.dismissToast();
      }
    }, intervalStep);
  }

  pauseTimer(): void {
    this.isPaused = true;
  }

  resumeTimer(): void {
    this.isPaused = false;
  }

  onInstallClick(): void {
    this.dismissToast();
    void this.pwaService.installApp();
  }

  dismissToast(): void {
    this.clearTimers();
    this.isAnimatingIn.set(false);

    try {
      sessionStorage.setItem('childe_pwa_dismissed', 'true');
    } catch {
      // ignore
    }

    // بعد از اتمام انیمیشن خروج (۳۰۰ میلی‌ثانیه)، المان از DOM خارج می‌شود
    setTimeout(() => {
      this.showToast.set(false);
    }, 350);
  }

  private clearTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animTimeout) {
      clearTimeout(this.animTimeout);
      this.animTimeout = null;
    }
  }
}
