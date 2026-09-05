import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-wallet-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="wallet-page-view" class="px-5 pt-3 pb-8" data-purpose="wallet-page">
      
      <!-- Top Bar: Back button & Page Title -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center space-x-3 space-x-reverse">
          <button
            id="btn-wallet-back"
            type="button"
            (click)="foodStore.goToHome()"
            aria-label="بازگشت به خانه"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div>
            <h1 class="text-lg font-black text-[#141517] tracking-tight">
              کیف پول و اعتبارات
            </h1>
            <p class="text-xs text-gray-400 font-medium mt-0.5">
              مدیریت موجودی غذای مدارس
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center space-x-1.5 space-x-reverse">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>حساب فعال</span>
        </span>
      </div>

      <!-- MAIN TOP WALLET CARD -->
      <div
        id="main-wallet-card"
        class="bg-[#141517] text-white rounded-[28px] p-6 shadow-xl shadow-black/10 border border-white/10 relative overflow-hidden">
        
        <!-- Ambient warm glow -->
        <div class="absolute -top-20 -left-20 w-52 h-52 bg-[#f97352]/25 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Card Header: Title & Chip -->
        <div class="flex items-center justify-between relative z-10">
          <div class="flex items-center space-x-2 space-x-reverse">
            <span class="text-2xl">💳</span>
            <div>
              <span class="text-xs font-bold text-gray-300 block">
                کارت اعتباری تغذیه مدارس
              </span>
              <span class="text-[10px] text-gray-400">
                متصل به ۳ دانش‌آموز خانواده احمدی
              </span>
            </div>
          </div>

          <!-- NFC / Chip symbol -->
          <div class="w-9 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-200/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-15z"/>
            </svg>
          </div>
        </div>

        <!-- Balance Section -->
        <div class="mt-6 relative z-10">
          <span class="text-xs text-gray-400 font-medium block">
            موجودی قابل استفاده
          </span>
          <div class="flex items-baseline space-x-2 space-x-reverse mt-1">
            <span id="wallet-balance-display" class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
            </span>
            <span class="text-sm font-bold text-[#f97352]">
              تومان
            </span>
          </div>
        </div>

        <!-- Account Identifier -->
        <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 relative z-10">
          <span class="font-mono tracking-wider text-[11px] text-gray-300">
            IR-5820 • 4910 • 3820
          </span>
          <span class="text-[11px] text-gray-400">
            والد: {{ foodStore.parentProfile().name }}
          </span>
        </div>

        <!-- Prominent Recharge Button inside Card -->
        <div class="mt-5 relative z-10">
          <button
            id="btn-open-recharge-modal"
            type="button"
            (click)="foodStore.isWalletDrawerOpen.set(true)"
            class="w-full py-3.5 bg-[#f97352] hover:bg-[#e05432] active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 space-x-reverse transition cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>شارژ آنی کیف پول</span>
          </button>
        </div>

      </div>

      <!-- Monthly Overview Mini Stats -->
      <div class="grid grid-cols-3 gap-2.5 mt-5">
        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">کل واریزی‌ها</span>
          <span class="text-xs font-black text-emerald-600 mt-1 block">
            +۷۰۰,۰۰۰
          </span>
          <span class="text-[9px] text-gray-400">تومان</span>
        </div>

        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">سفارشات مدارس</span>
          <span class="text-xs font-black text-gray-800 mt-1 block">
            -۴۱۰,۰۰۰
          </span>
          <span class="text-[9px] text-gray-400">تومان</span>
        </div>

        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">تخفیف مدرسه</span>
          <span class="text-xs font-black text-[#f97352] mt-1 block">
            ۴۵,۰۰۰
          </span>
          <span class="text-[9px] text-gray-400">تومان</span>
        </div>
      </div>

      <!-- BOTTOM SECTION: TRANSACTIONS (پایینشم تراکنشهاش باشه) -->
      <div class="mt-8">
        <!-- Section Header & Filter Tabs -->
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center space-x-2 space-x-reverse">
            <h2 class="text-base font-black text-[#141517] tracking-tight">
              تراکنش‌های اخیر
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
              {{ filteredTransactions().length }} مورد
            </span>
          </div>

          <!-- Quick Filters -->
          <div class="flex items-center gap-1 bg-gray-100/90 p-1 rounded-full border border-black/[0.04]">
            <button
              type="button"
              (click)="activeFilter.set('all')"
              [class]="
                activeFilter() === 'all'
                  ? 'px-3.5 py-1.5 rounded-full bg-white text-gray-900 font-black text-[11px] shadow-xs transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-[11px] transition-all cursor-pointer'
              ">
              همه
            </button>
            <button
              type="button"
              (click)="activeFilter.set('deposit')"
              [class]="
                activeFilter() === 'deposit'
                  ? 'px-3.5 py-1.5 rounded-full bg-white text-gray-900 font-black text-[11px] shadow-xs transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-[11px] transition-all cursor-pointer'
              ">
              شارژها
            </button>
            <button
              type="button"
              (click)="activeFilter.set('purchase')"
              [class]="
                activeFilter() === 'purchase'
                  ? 'px-3.5 py-1.5 rounded-full bg-white text-gray-900 font-black text-[11px] shadow-xs transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-[11px] transition-all cursor-pointer'
              ">
              خرید غذا
            </button>
          </div>
        </div>

        <!-- Transactions List -->
        <div class="space-y-3">
          @for (tx of filteredTransactions(); track tx.id) {
            <div
              [id]="'transaction-card-' + tx.id"
              class="bg-white rounded-[24px] p-4 border border-black/[0.05] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:border-black/15 transition-all flex items-center justify-between">
              
              <!-- Transaction Details (Right in RTL) -->
              <div class="flex items-center gap-3.5 min-w-0">
                <!-- Icon indicator (Right aligned with no extra margin, balanced gap to text) -->
                <div
                  [class]="
                    tx.type === 'deposit'
                      ? 'w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-lg flex-shrink-0 shadow-inner'
                      : 'w-11 h-11 rounded-2xl bg-orange-50 text-[#f97352] border border-orange-200/60 flex items-center justify-center text-lg flex-shrink-0 shadow-inner'
                  ">
                  @if (tx.type === 'deposit') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  }
                </div>

                <!-- Title & Subtitle with proper spacing -->
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-xs font-black text-gray-900 truncate">
                      {{ tx.title }}
                    </h3>
                  </div>
                  <p class="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                    {{ tx.subtitle }}
                  </p>
                  <div class="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span>{{ tx.date }}</span>
                    <span>•</span>
                    <span>پیگیری: {{ tx.trackingCode }}</span>
                  </div>
                </div>
              </div>

              <!-- Transaction Amount & Status (Left in RTL) -->
              <div class="flex-shrink-0 text-left mr-2">
                <div class="flex items-baseline gap-1 justify-end">
                  <span
                    [class]="
                      tx.type === 'deposit'
                        ? 'text-sm font-black text-emerald-600'
                        : 'text-sm font-black text-gray-900'
                    ">
                    {{ tx.type === 'deposit' ? '+' : '-' }}{{ tx.amount.toLocaleString('fa-IR') }}
                  </span>
                  <span class="text-[10px] text-gray-400 font-medium">
                    تومان
                  </span>
                </div>

                <span
                  class="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  موفق
                </span>
              </div>

            </div>
          } @empty {
            <div class="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <span class="text-3xl block mb-2">📄</span>
              <p class="text-xs font-bold text-gray-500">تراکنشی در این دسته‌بندی یافت نشد.</p>
            </div>
          }
        </div>

      </div>

    </div>
  `,
})
export class WalletPage {
  readonly foodStore = inject(FoodStore);

  readonly activeFilter = signal<'all' | 'deposit' | 'purchase'>('all');

  readonly filteredTransactions = computed(() => {
    const list = this.foodStore.walletTransactions();
    const filter = this.activeFilter();
    if (filter === 'all') return list;
    return list.filter((item) => item.type === filter);
  });
}
