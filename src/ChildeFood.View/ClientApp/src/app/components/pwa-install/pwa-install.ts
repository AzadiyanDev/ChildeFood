import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {PwaService} from '../../services/pwa';

@Component({
  selector: 'app-pwa-install',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- In-App Install Banner (Shows if not installed, can be dismissed) -->
    @if (!pwaService.isInstalled() && showBanner()) {
      <aside
        id="pwa-install-banner"
        aria-label="نصب اپلیکیشن"
        class="mx-4 mt-3 mb-1 p-3 bg-gradient-to-r from-[#1b1e22] to-[#252830] text-white rounded-2xl shadow-md flex items-center justify-between border border-white/10">
        
        <div class="flex items-center space-x-2.5 space-x-reverse min-w-0">
          <div class="w-9 h-9 rounded-xl bg-[#f97352] flex items-center justify-center text-lg flex-shrink-0 shadow">
            🍲
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold truncate">نصب اپلیکیشن روی گوشی</p>
            <p class="text-[10px] text-gray-300 truncate">دسترسی سریع‌تر، بدون نیاز به مرورگر</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 space-x-reverse flex-shrink-0">
          <button
            id="btn-install-pwa"
            type="button"
            (click)="pwaService.installApp()"
            class="px-3 py-1.5 bg-[#f97352] hover:bg-[#e05e3e] text-white text-xs font-bold rounded-xl active:scale-95 transition shadow-sm flex items-center space-x-1 space-x-reverse">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>نصب</span>
          </button>
          
          <button
            id="btn-dismiss-pwa-banner"
            type="button"
            (click)="dismissBanner()"
            aria-label="بستن اعلان نصب"
            class="w-7 h-7 rounded-lg text-gray-400 hover:text-white flex items-center justify-center transition">
            ✕
          </button>
        </div>
      </aside>
    }

    <!-- iOS / Fallback Installation Modal Guide -->
    @if (pwaService.showIOSModal()) {
      <div
        id="ios-install-backdrop"
        class="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs flex items-center justify-center p-4">
        
        <div
          id="ios-install-modal"
          class="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-gray-800 border border-gray-100 animate-in fade-in zoom-in-95">
          
          <div class="w-12 h-12 rounded-2xl bg-orange-50 text-[#f97352] flex items-center justify-center text-2xl mx-auto mb-3">
            📲
          </div>

          <h3 id="ios-guide-title" class="text-base font-bold text-center text-gray-950 mb-2">
            نصب اپلیکیشن روی گوشی
          </h3>

          <div class="text-xs text-gray-600 space-y-2.5 my-4 bg-[#fafafa] p-3.5 rounded-2xl border border-gray-100">
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#f97352] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۱</span>
              <p>در مرورگر خود، دکمه <strong>اشتراک‌گذاری (Share)</strong> یا منوی سه‌نقطه را باز کنید.</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#f97352] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۲</span>
              <p>گزینه <strong>افزودن به صفحه اصلی (Add to Home Screen)</strong> را لمس کنید.</p>
            </div>
            <div class="flex items-center space-x-2 space-x-reverse">
              <span class="w-5 h-5 rounded-full bg-orange-100 text-[#f97352] font-bold flex items-center justify-center text-[11px] flex-shrink-0">۳</span>
              <p>دکمه <strong>Add</strong> را بزنید تا برنامه مثل یک اپ اختصاصی نصب شود.</p>
            </div>
          </div>

          <button
            id="btn-close-ios-guide"
            type="button"
            (click)="pwaService.closeIOSModal()"
            class="w-full py-2.5 bg-[#17191d] hover:bg-black text-white text-xs font-bold rounded-xl transition">
            متوجه شدم
          </button>
        </div>
      </div>
    }
  `,
})
export class PwaInstall {
  readonly pwaService = inject(PwaService);
  readonly showBanner = signal<boolean>(true);

  dismissBanner(): void {
    this.showBanner.set(false);
  }
}
