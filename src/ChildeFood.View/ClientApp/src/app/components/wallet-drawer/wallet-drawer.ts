import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-wallet-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (foodStore.isWalletDrawerOpen()) {
      <!-- Backdrop -->
      <button
        id="wallet-drawer-backdrop"
        type="button"
        aria-label="بستن کیف پول"
        class="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs transition-opacity w-full h-full border-0 cursor-default"
        (click)="foodStore.closeWalletDrawer()"
        (keyup.escape)="foodStore.closeWalletDrawer()">
      </button>

      <!-- Slide-up Modal / Bottom Sheet -->
      <div
        id="wallet-drawer-sheet"
        class="fixed bottom-0 inset-x-0 max-w-[440px] mx-auto bg-white rounded-t-[36px] z-50 p-6 shadow-2xl transition-transform border-t border-gray-100 flex flex-col max-h-[85vh]">
        
        <!-- Drag pill -->
        <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-xl">💳</span>
            <h2 id="wallet-drawer-title" class="text-base font-black text-gray-900">کیف پول و اعتبارات</h2>
          </div>
          <button
            id="btn-close-wallet-drawer"
            (click)="foodStore.closeWalletDrawer()"
            class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer"
            aria-label="بستن">
            ✕
          </button>
        </div>

        <div class="overflow-y-auto flex-1 my-4 space-y-4 pr-0.5">
          <!-- Balance Display Card -->
          <div class="p-5 rounded-[24px] bg-[#141517] text-white flex flex-col justify-between shadow-lg">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-400 font-medium">موجودی قابل استفاده</span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold">
                فعال
              </span>
            </div>
            
            <div class="mt-4 flex items-baseline space-x-2 space-x-reverse">
              <span class="text-3xl font-black tracking-tight text-white">
                {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
              </span>
              <span class="text-xs text-gray-400 font-medium">تومان</span>
            </div>
          </div>

          <!-- Quick Recharge Amounts -->
          <div>
            <h4 class="text-xs font-black text-gray-800 mb-2.5">افزایش سریع اعتبار</h4>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="recharge(50000)"
                class="py-2.5 px-2 rounded-xl bg-gray-50 hover:bg-orange-50 hover:border-[#f97352]/40 active:scale-95 border border-gray-200 text-xs font-bold text-gray-800 transition cursor-pointer text-center">
                +۵۰,۰۰۰ ت
              </button>
              <button
                type="button"
                (click)="recharge(100000)"
                class="py-2.5 px-2 rounded-xl bg-gray-50 hover:bg-orange-50 hover:border-[#f97352]/40 active:scale-95 border border-gray-200 text-xs font-bold text-gray-800 transition cursor-pointer text-center">
                +۱۰۰,۰۰۰ ت
              </button>
              <button
                type="button"
                (click)="recharge(200000)"
                class="py-2.5 px-2 rounded-xl bg-[#f97352]/10 hover:bg-[#f97352]/20 active:scale-95 border border-[#f97352]/30 text-xs font-black text-[#f97352] transition cursor-pointer text-center">
                +۲۰۰,۰۰۰ ت
              </button>
            </div>
          </div>

          @if (successNotice()) {
            <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2 space-x-reverse animate-fade-in">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>{{ successNotice() }}</span>
            </div>
          }

          <!-- Recent Transactions -->
          <div>
            <h4 class="text-xs font-black text-gray-800 mb-2">گردش حساب اخیر</h4>
            <div class="space-y-2">
              <div class="p-3 rounded-xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-between">
                <div class="flex items-center space-x-2.5 space-x-reverse">
                  <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-black">
                    ↓
                  </div>
                  <div>
                    <p class="text-xs font-bold text-gray-800">شارژ آنلاین حساب</p>
                    <span class="text-[10px] text-gray-400">امروز - درگاه بانکی</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-600">+۲۰۰,۰۰۰ ت</span>
              </div>

              <div class="p-3 rounded-xl bg-[#fafafa] border border-black/[0.04] flex items-center justify-between">
                <div class="flex items-center space-x-2.5 space-x-reverse">
                  <div class="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-black">
                    ↑
                  </div>
                  <div>
                    <p class="text-xs font-bold text-gray-800">سفارش ناهار آرتین</p>
                    <span class="text-[10px] text-gray-400">دیروز - کباب چوبی</span>
                  </div>
                </div>
                <span class="text-xs font-bold text-gray-700">-۱۴۵,۰۰۰ ت</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    }
  `,
})
export class WalletDrawer {
  readonly foodStore = inject(FoodStore);
  readonly successNotice = signal<string | null>(null);

  recharge(amount: number): void {
    this.foodStore.addWalletBalance(amount);
    this.successNotice.set(`مبلغ ${amount.toLocaleString('fa-IR')} تومان به کیف پول افزوده شد.`);
    setTimeout(() => {
      this.successNotice.set(null);
    }, 3000);
  }
}
