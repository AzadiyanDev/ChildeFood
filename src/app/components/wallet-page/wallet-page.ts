import {ChangeDetectionStrategy, Component, computed, inject, signal, effect, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FoodStore} from '../../services/food-store';

@Component({
  selector: 'app-wallet-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="wallet-page-view" class="px-5 pt-3 pb-8" data-purpose="wallet-page">
      
      <!-- Top Bar: Back button & Page Title -->
      <div class="flex items-center mb-5">
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
          <h1 class="text-lg font-black text-[#141517] tracking-tight">
            کیف پول و اعتبارات
          </h1>
        </div>
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

      <!-- BOTTOM SECTION: TRANSACTIONS (فقط ۵ تراکنش اخیر و دکمه همه تراکنش‌ها) -->
      <div class="mt-8">
        <!-- Section Header: Title & All Transactions Button -->
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-black text-[#141517] tracking-tight">
              تراکنش‌های اخیر
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
              ۵ مورد اخیر
            </span>
          </div>

          <!-- All Transactions Modal Trigger -->
          <button
            type="button"
            id="btn-open-all-transactions-modal"
            (click)="isAllTransactionsModalOpen.set(true)"
            class="px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 text-xs font-bold border border-black/[0.06] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <span>همه تراکنش‌ها</span>
            <svg class="w-3.5 h-3.5 text-gray-500 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <!-- 5 Recent Transactions List on Main Page -->
        <div class="space-y-3">
          @for (tx of recentTransactions(); track tx.id) {
            <div
              [id]="'transaction-card-' + tx.id"
              class="bg-white rounded-[24px] p-4 border border-black/[0.05] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:border-black/15 transition-all flex items-center justify-between">
              
              <!-- Transaction Details (Right in RTL) -->
              <div class="flex items-center gap-3.5 min-w-0">
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

                <!-- Title & Subtitle -->
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
          }
        </div>
      </div>

      <!-- ALL TRANSACTIONS MODAL (Covering 85-90% of screen height) -->
      @if (isAllTransactionsModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 overscroll-contain"
          (touchmove)="$event.stopPropagation()">
          
          <!-- Backdrop -->
          <button
            type="button"
            class="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xs cursor-pointer border-none touch-none"
            aria-label="بستن پنجره همه تراکنش‌ها"
            (touchmove)="$event.preventDefault()"
            (wheel)="$event.preventDefault()"
            (click)="isAllTransactionsModalOpen.set(false)">
          </button>

          <!-- Modal Sheet Content: 85-90% Screen Height -->
          <div
            id="all-transactions-bottom-sheet"
            class="relative bg-white w-full max-w-lg h-[88vh] max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-gray-100 flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 overscroll-contain"
            (touchmove)="$event.stopPropagation()">
            
            <!-- Mobile Pull Drag Indicator -->
            <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 sm:hidden flex-shrink-0"></div>

            <!-- Modal Top Header -->
            <div class="px-5 pt-3 pb-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-orange-50 text-[#f97352] border border-orange-200/60 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
                  💳
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-black text-gray-900 tracking-tight">
                      همه تراکنش‌ها
                    </h3>
                    <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                      {{ filteredAllTransactions().length }} مورد
                    </span>
                  </div>
                  <p class="text-[11px] text-gray-400 font-medium mt-0.5">
                    سوابق کامل شارژ کیف پول و سفارش‌های غذای مدارس
                  </p>
                </div>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                id="btn-close-all-transactions-modal"
                (click)="isAllTransactionsModalOpen.set(false)"
                aria-label="بستن پنجره"
                class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Filters Section (At the top of the modal, matching requested pattern) -->
            <div class="px-5 pt-3.5 pb-3 bg-[#fafafa] border-b border-gray-100 flex-shrink-0 space-y-2.5">
              
              <!-- 1. Full-Width Segmented Tab Filter (Black active button styling) -->
              <div class="w-full bg-gray-200/80 p-1 rounded-full border border-black/[0.04] grid grid-cols-3 gap-1">
                <button
                  type="button"
                  id="modal-filter-all"
                  (click)="modalTypeFilter.set('all')"
                  [class]="
                    modalTypeFilter() === 'all'
                      ? 'py-2 rounded-full bg-[#141517] text-white font-black text-xs shadow-sm transition-all cursor-pointer text-center'
                      : 'py-2 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs transition-all cursor-pointer text-center'
                  ">
                  همه
                </button>
                <button
                  type="button"
                  id="modal-filter-deposit"
                  (click)="modalTypeFilter.set('deposit')"
                  [class]="
                    modalTypeFilter() === 'deposit'
                      ? 'py-2 rounded-full bg-[#141517] text-white font-black text-xs shadow-sm transition-all cursor-pointer text-center'
                      : 'py-2 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs transition-all cursor-pointer text-center'
                  ">
                  شارژها (واریز)
                </button>
                <button
                  type="button"
                  id="modal-filter-purchase"
                  (click)="modalTypeFilter.set('purchase')"
                  [class]="
                    modalTypeFilter() === 'purchase'
                      ? 'py-2 rounded-full bg-[#141517] text-white font-black text-xs shadow-sm transition-all cursor-pointer text-center'
                      : 'py-2 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs transition-all cursor-pointer text-center'
                  ">
                  خرید غذا
                </button>
              </div>

              <!-- Mini Financial Summary for Current Filter -->
              <div class="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span class="font-medium text-gray-600">
                  نمایش {{ filteredAllTransactions().length }} تراکنش ثبت‌شده
                </span>
                <div class="flex items-center gap-2.5">
                  <span class="text-emerald-700 font-bold">واریز: {{ filteredDepositSum().toLocaleString('fa-IR') }} تومان</span>
                  <span class="text-gray-300">•</span>
                  <span class="text-gray-800 font-bold">خرید: {{ filteredPurchaseSum().toLocaleString('fa-IR') }} تومان</span>
                </div>
              </div>

            </div>

            <!-- Scrollable List of All Transactions -->
            <div class="flex-1 overflow-y-auto px-5 py-3.5 space-y-2.5 overscroll-contain no-scrollbar">
              @for (tx of filteredAllTransactions(); track tx.id) {
                <div
                  [id]="'modal-tx-card-' + tx.id"
                  class="bg-white rounded-[22px] p-3.5 border border-black/[0.05] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] hover:border-black/15 transition-all flex items-center justify-between">
                  
                  <!-- Transaction Icon & Info -->
                  <div class="flex items-center gap-3 min-w-0">
                    <div
                      [class]="
                        tx.type === 'deposit'
                          ? 'w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-base flex-shrink-0 shadow-inner'
                          : 'w-10 h-10 rounded-xl bg-orange-50 text-[#f97352] border border-orange-200/60 flex items-center justify-center text-base flex-shrink-0 shadow-inner'
                      ">
                      @if (tx.type === 'deposit') {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                        </svg>
                      }
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <h4 class="text-xs font-black text-gray-900 truncate">
                          {{ tx.title }}
                        </h4>
                        @if (tx.childName) {
                          <span class="px-1.5 py-0.5 rounded-md bg-orange-50 text-[#f97352] text-[9px] font-bold border border-orange-200/50 truncate">
                            {{ tx.childName }}
                          </span>
                        }
                      </div>
                      <p class="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                        {{ tx.subtitle }}
                      </p>
                      <div class="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                        <span>{{ tx.date }}</span>
                        <span>•</span>
                        <span>پیگیری: {{ tx.trackingCode }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Amount & Status -->
                  <div class="flex-shrink-0 text-left mr-2">
                    <div class="flex items-baseline gap-1 justify-end">
                      <span
                        [class]="
                          tx.type === 'deposit'
                            ? 'text-xs sm:text-sm font-black text-emerald-600'
                            : 'text-xs sm:text-sm font-black text-gray-900'
                        ">
                        {{ tx.type === 'deposit' ? '+' : '-' }}{{ tx.amount.toLocaleString('fa-IR') }}
                      </span>
                      <span class="text-[9px] text-gray-400 font-medium">تومان</span>
                    </div>
                    <span class="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      موفق
                    </span>
                  </div>

                </div>
              } @empty {
                <div class="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200 my-4">
                  <span class="text-3xl block mb-2">🔍</span>
                  <h4 class="text-xs font-black text-gray-700">تراکنشی یافت نشد</h4>
                  <p class="text-[11px] text-gray-400 mt-1">با فیلترهای انتخابی فعلی تراکنشی وجود ندارد.</p>
                  <button
                    type="button"
                    (click)="resetModalFilters()"
                    class="mt-3 px-4 py-1.5 bg-[#141517] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                    پاک کردن فیلترها
                  </button>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-gray-100 bg-white flex items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                id="btn-modal-recharge"
                (click)="isAllTransactionsModalOpen.set(false); foodStore.isWalletDrawerOpen.set(true)"
                class="flex-1 py-3 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/20 transition cursor-pointer flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>شارژ جدید کیف پول</span>
              </button>
              <button
                type="button"
                id="btn-modal-close"
                (click)="isAllTransactionsModalOpen.set(false)"
                class="px-5 py-3 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer">
                بستن
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class WalletPage implements OnDestroy {
  readonly foodStore = inject(FoodStore);
  private readonly document = inject(DOCUMENT);

  // Modal visibility
  readonly isAllTransactionsModalOpen = signal<boolean>(false);

  // Filters for the modal
  readonly modalTypeFilter = signal<'all' | 'deposit' | 'purchase'>('all');

  constructor() {
    // Lock body scroll when modal is open
    effect(() => {
      const isOpen = this.isAllTransactionsModalOpen();
      if (typeof document !== 'undefined' && this.document?.body) {
        if (isOpen) {
          this.document.body.style.overflow = 'hidden';
          this.document.body.style.touchAction = 'none';
        } else {
          this.document.body.style.overflow = '';
          this.document.body.style.touchAction = '';
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this.document?.body) {
      this.document.body.style.overflow = '';
      this.document.body.style.touchAction = '';
    }
  }

  // Exactly 5 recent transactions for the main wallet page
  readonly recentTransactions = computed(() => {
    return this.foodStore.walletTransactions().slice(0, 5);
  });

  // All transactions filtered in the modal
  readonly filteredAllTransactions = computed(() => {
    const list = this.foodStore.walletTransactions();
    const type = this.modalTypeFilter();

    if (type !== 'all') {
      return list.filter((t) => t.type === type);
    }

    return list;
  });

  // Sum of filtered deposits
  readonly filteredDepositSum = computed(() => {
    return this.filteredAllTransactions()
      .filter((t) => t.type === 'deposit')
      .reduce((acc, curr) => acc + curr.amount, 0);
  });

  // Sum of filtered purchases
  readonly filteredPurchaseSum = computed(() => {
    return this.filteredAllTransactions()
      .filter((t) => t.type === 'purchase')
      .reduce((acc, curr) => acc + curr.amount, 0);
  });

  resetModalFilters(): void {
    this.modalTypeFilter.set('all');
  }
}
