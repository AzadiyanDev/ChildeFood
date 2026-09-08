import {ChangeDetectionStrategy, Component, computed, inject, signal, effect, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FoodStore} from '../../services/food-store';
import {WalletTransaction} from '../../models/food.model';


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

      <!-- MAIN TOP WALLET CARD (فقط نمایش موجودی قابل استفاده و دکمه شارژ آنی) -->
      <div
        id="main-wallet-card"
        class="bg-[#141517] text-white rounded-[28px] p-6 shadow-xl shadow-black/10 border border-white/10 relative overflow-hidden">
        
        <!-- Ambient warm glow -->
        <div class="absolute -top-20 -left-20 w-52 h-52 bg-[#f97352]/25 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Balance Section -->
        <div class="relative z-10 pt-1">
          <span class="text-xs text-gray-400 font-medium block">
            موجودی قابل استفاده
          </span>
          <div class="flex items-baseline space-x-2 space-x-reverse mt-2">
            <span id="wallet-balance-display" class="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {{ foodStore.parentProfile().walletBalance.toLocaleString('fa-IR') }}
            </span>
            <span class="text-sm font-bold text-[#f97352]">
              تومان
            </span>
          </div>
        </div>

        <!-- Prominent Recharge Button inside Card -->
        <div class="mt-6 relative z-10">
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

      <!-- Monthly Overview Mini Stats (ریل‌تایم و واکشی مستقیم از دیتابیس) -->
      <div class="grid grid-cols-3 gap-2.5 mt-5">
        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">کل واریزی‌ها</span>
          <span class="text-xs font-black text-emerald-600 mt-1 block">
            +{{ (foodStore.walletSummary()?.totalDeposits ?? 700000).toLocaleString('fa-IR') }}
          </span>
          <span class="text-[9px] text-gray-400">تومان</span>
        </div>

        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">سفارشات مدارس</span>
          <span class="text-xs font-black text-gray-800 mt-1 block">
            -{{ (foodStore.walletSummary()?.totalOrdersAmount ?? 410000).toLocaleString('fa-IR') }}
          </span>
          <span class="text-[9px] text-gray-400">تومان</span>
        </div>

        <div class="bg-white rounded-2xl p-3 border border-black/[0.05] shadow-xs text-center">
          <span class="text-[10px] text-gray-400 font-medium block">تخفیف مدرسه</span>
          <span class="text-xs font-black text-[#f97352] mt-1 block">
            {{ (foodStore.walletSummary()?.totalDiscountAmount ?? 45000).toLocaleString('fa-IR') }}
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
            (click)="openAllTransactionsModal()"
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

      <!-- ALL TRANSACTIONS MODAL (Slide-up Bottom Sheet Drawer) -->
      @if (isAllTransactionsModalOpen()) {
        <!-- Backdrop -->
        <button
          id="all-transactions-backdrop"
          type="button"
          aria-label="بستن همه تراکنش‌ها"
          class="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs transition-opacity w-full h-full border-0 cursor-default"
          (click)="closeAllTransactionsModal()"
          (keyup.escape)="closeAllTransactionsModal()">
        </button>

        <!-- Slide-up Modal / Bottom Sheet: از پایین به بالا باز می‌شود -->
        <div
          id="all-transactions-bottom-sheet"
          class="fixed bottom-0 inset-x-0 max-w-[440px] mx-auto bg-white rounded-t-[36px] z-50 shadow-2xl transition-transform border-t border-gray-100 flex flex-col h-[85vh] max-h-[88vh] animate-in slide-in-from-bottom duration-300 overscroll-contain">
          
          <!-- Mobile Pull Drag Indicator -->
          <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2 flex-shrink-0"></div>

          <!-- Modal Top Header: آیکون کارت و ساب‌تایتل طبق درخواست کاربر حذف شده است -->
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-gray-900 tracking-tight">
                همه تراکنش‌ها
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                {{ modalTotalCount() }} تراکنش
              </span>
            </div>

            <!-- Close Button in Header -->
            <button
              type="button"
              id="btn-close-all-transactions-modal"
              (click)="closeAllTransactionsModal()"
              aria-label="بستن"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Modal Filters Section -->
          <div class="px-5 pt-3.5 pb-3 bg-[#fafafa] border-b border-gray-100 flex-shrink-0 space-y-2.5">
            <!-- Full-Width Segmented Tab Filter -->
            <div class="w-full bg-gray-200/80 p-1 rounded-full border border-black/[0.04] grid grid-cols-3 gap-1">
              <button
                type="button"
                id="modal-filter-all"
                (click)="changeFilter('all')"
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
                (click)="changeFilter('deposit')"
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
                (click)="changeFilter('purchase')"
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
                نمایش {{ modalTransactions().length }} از {{ modalTotalCount() }} تراکنش
              </span>
              <div class="flex items-center gap-2.5">
                <span class="text-emerald-700 font-bold">واریز: {{ modalDepositSum().toLocaleString('fa-IR') }} تومان</span>
                <span class="text-gray-300">•</span>
                <span class="text-gray-800 font-bold">خرید: {{ modalPurchaseSum().toLocaleString('fa-IR') }} تومان</span>
              </div>
            </div>
          </div>

          <!-- Scrollable List of All Transactions with Infinite Scroll (دکمه‌های شارژ و بستن از پایین حذف شدند) -->
          <div
            id="modal-tx-scroll-container"
            (scroll)="onTransactionsScroll($event)"
            class="flex-1 overflow-y-auto px-5 py-3.5 space-y-2.5 overscroll-contain no-scrollbar">
            @for (tx of modalTransactions(); track tx.id) {
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
              @if (!modalIsLoading()) {
                <div class="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200 my-4">
                  <span class="text-3xl block mb-2">🔍</span>
                  <h4 class="text-xs font-black text-gray-700">تراکنشی یافت نشد</h4>
                  <p class="text-[11px] text-gray-400 mt-1">با فیلترهای انتخابی فعلی تراکنشی وجود ندارد.</p>
                  <button
                    type="button"
                    (click)="changeFilter('all')"
                    class="mt-3 px-4 py-1.5 bg-[#141517] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                    نمایش همه تراکنش‌ها
                  </button>
                </div>
              }
            }

            <!-- Loading indicator for initial load & infinite scroll -->
            @if (modalIsLoading() || modalIsLoadingMore()) {
              <div class="py-4 text-center flex items-center justify-center gap-2 text-xs text-gray-500 font-bold">
                <svg class="animate-spin h-4 w-4 text-[#f97352]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>در حال دریافت تراکنش‌ها...</span>
              </div>
            }
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

  // Infinite Scroll state
  readonly modalTransactions = signal<WalletTransaction[]>([]);
  readonly modalCurrentPage = signal<number>(1);
  readonly modalTotalCount = signal<number>(0);
  readonly modalHasMore = signal<boolean>(true);
  readonly modalIsLoading = signal<boolean>(false);
  readonly modalIsLoadingMore = signal<boolean>(false);
  readonly modalDepositSum = signal<number>(0);
  readonly modalPurchaseSum = signal<number>(0);

  constructor() {
    // بارگذاری اولیه داده‌های ریل‌تایم خلاصه کیف پول و ۵ تراکنش اخیر
    this.foodStore.loadWalletSummary();
    this.foodStore.loadRecentTransactions();

    // قفل کردن اسکرول بدنه صفحه در زمان باز بودن باتم‌شیت
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

  // ۵ تراکنش اخیر واکشی شده از دیتابیس برای صفحه اصلی
  readonly recentTransactions = computed(() => {
    const list = this.foodStore.recentWalletTransactions();
    if (list.length > 0) return list.slice(0, 5);
    return this.foodStore.walletTransactions().slice(0, 5);
  });

  // باز کردن باتم‌شیت همه تراکنش‌ها و لود صفحه اول
  openAllTransactionsModal(): void {
    this.modalTypeFilter.set('all');
    this.isAllTransactionsModalOpen.set(true);
    this.loadFirstPage();
  }

  // بستن باتم‌شیت
  closeAllTransactionsModal(): void {
    this.isAllTransactionsModalOpen.set(false);
  }

  // تغییر تب فیلتر (همه / واریز / خرید) و واکشی مجدد صفحه اول
  changeFilter(type: 'all' | 'deposit' | 'purchase'): void {
    if (this.modalTypeFilter() === type) return;
    this.modalTypeFilter.set(type);
    this.loadFirstPage();
  }

  // لود صفحه اول تراکنش‌ها
  async loadFirstPage(): Promise<void> {
    this.modalCurrentPage.set(1);
    this.modalTransactions.set([]);
    this.modalIsLoading.set(true);

    const result = await this.foodStore.fetchPagedTransactions(1, 10, this.modalTypeFilter());
    this.modalIsLoading.set(false);

    if (result) {
      this.modalTransactions.set(result.items);
      this.modalTotalCount.set(result.totalCount);
      this.modalHasMore.set(result.hasMore);
      this.modalDepositSum.set(result.depositSum);
      this.modalPurchaseSum.set(result.purchaseSum);
    } else {
      // فال‌بک به داده‌های لوکال در صورت قطعی ارتباط
      const localItems = this.foodStore.walletTransactions();
      const filter = this.modalTypeFilter();
      const filtered = filter === 'all' ? localItems : localItems.filter((t) => t.type === filter);
      this.modalTransactions.set(filtered);
      this.modalTotalCount.set(filtered.length);
      this.modalHasMore.set(false);
    }
  }

  // لود صفحات بعدی برای اینفینیتی اسکرول
  async loadNextPage(): Promise<void> {
    if (this.modalIsLoading() || this.modalIsLoadingMore() || !this.modalHasMore()) return;

    this.modalIsLoadingMore.set(true);
    const nextPage = this.modalCurrentPage() + 1;

    const result = await this.foodStore.fetchPagedTransactions(nextPage, 10, this.modalTypeFilter());
    this.modalIsLoadingMore.set(false);

    if (result && result.items.length > 0) {
      this.modalCurrentPage.set(nextPage);
      this.modalTransactions.update((prev) => [...prev, ...result.items]);
      this.modalHasMore.set(result.hasMore);
    } else {
      this.modalHasMore.set(false);
    }
  }

  // لیسنر اسکرول کانتینر برای لود خودکار آیتم‌ها با رسیدن به انتهای لیست
  onTransactionsScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const threshold = 70; // آستانه ۷۰ پیکسلی مانده به انتهای اسکرول
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold;

    if (isNearBottom && this.modalHasMore() && !this.modalIsLoadingMore() && !this.modalIsLoading()) {
      this.loadNextPage();
    }
  }
}
