import {ChangeDetectionStrategy, Component, computed, inject, signal, effect, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {FoodStore} from '../../services/food-store';
import {SchoolOrder} from '../../models/food.model';

@Component({
  selector: 'app-orders-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="orders-page-view" class="px-5 pt-3 pb-8 animate-in fade-in duration-200" data-purpose="orders-page">
      
      <!-- Top Bar with Back Button & Page Title (Matching Wallet & Children pages) -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <button
            id="btn-orders-back"
            type="button"
            (click)="foodStore.goToHome()"
            aria-label="بازگشت به صفحه اصلی"
            class="w-10 h-10 rounded-2xl bg-white border border-black/[0.06] flex items-center justify-center text-gray-800 shadow-xs hover:bg-gray-50 active:scale-95 transition cursor-pointer">
            <svg class="w-5 h-5 transform rotate-0 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div>
            <h1 class="text-lg font-black text-[#141517] tracking-tight">
              سفارش‌های فعال و اخیر
            </h1>
            <p class="text-xs text-gray-400 font-medium mt-0.5">
              پیگیری زنده و سوابق ناهار گرم مدارس
            </p>
          </div>
        </div>

        <span class="px-3 py-1 rounded-full bg-[#141517] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <span>{{ foodStore.schoolOrders().length }} سفارش</span>
        </span>
      </div>

      <!-- Top Filter Tabs (Full width segmented control with black active pill) -->
      <div class="bg-white rounded-[24px] p-1.5 sm:p-2 border border-black/[0.05] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] mb-5">
        <div class="w-full bg-gray-100/90 p-1 rounded-full border border-black/[0.04] grid grid-cols-3 gap-1">
          <button
            id="filter-order-all"
            type="button"
            (click)="activeFilter.set('all')"
            [class]="
              activeFilter() === 'all'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            همه
          </button>
          <button
            id="filter-order-active"
            type="button"
            (click)="activeFilter.set('active')"
            [class]="
              activeFilter() === 'active'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            سفارش‌های فعال ({{ activeCount() }})
          </button>
          <button
            id="filter-order-delivered"
            type="button"
            (click)="activeFilter.set('delivered')"
            [class]="
              activeFilter() === 'delivered'
                ? 'py-2 sm:py-2.5 rounded-full bg-[#141517] text-white font-black text-xs sm:text-[13px] shadow-sm transition-all cursor-pointer text-center'
                : 'py-2 sm:py-2.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-xs sm:text-[13px] transition-all cursor-pointer text-center'
            ">
            تحویل شده
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div class="space-y-3">
        @for (order of filteredOrders(); track order.id) {
          <div
            [id]="'order-card-' + order.id"
            class="bg-white rounded-[22px] p-4 border border-black/[0.06] shadow-[0_2px_12px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
            
            <!-- Card Header: Child Avatar, Name, School & Status Pill -->
            <div class="flex items-center justify-between gap-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-11 h-11 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                  <img
                    [src]="foodStore.getChildAvatar(order.childId, order.childAvatar)"
                    [alt]="order.childName"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-xs font-black text-gray-900 truncate">
                      {{ order.childName }}
                    </h3>
                    <span class="text-[10px] text-gray-400 font-mono font-medium">
                      ({{ order.id }})
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                    {{ order.school }} @if (order.grade) { • {{ order.grade }} }
                  </p>
                </div>
              </div>

              <!-- Live Status Pill -->
              <span
                [class]="
                  order.status === 'active'
                    ? 'px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black flex items-center gap-1.5 flex-shrink-0'
                    : 'px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black flex items-center gap-1.5 flex-shrink-0'
                ">
                <span
                  [class]="
                    order.status === 'active'
                      ? 'w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'
                      : 'w-1.5 h-1.5 rounded-full bg-emerald-500'
                  "></span>
                <span>{{ order.status === 'active' ? 'در حال آماده‌سازی' : 'تحویل شده' }}</span>
              </span>
            </div>

            <!-- Middle Row: Food Item Summary & Price -->
            <div class="mt-3 bg-[#fbfbfb] rounded-xl px-3 py-2.5 border border-black/[0.03] flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-2xl flex-shrink-0">{{ order.foodEmoji }}</span>
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-gray-900 truncate">
                    {{ order.foodTitle }}
                  </h4>
                  <div class="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                    <span>{{ order.date }}</span>
                    @if (order.deliveryTime) {
                      <span>•</span>
                      <span class="text-gray-600 font-semibold">{{ order.deliveryTime }}</span>
                    }
                  </div>
                </div>
              </div>

              <!-- Price -->
              <div class="text-left flex-shrink-0">
                <span class="text-xs sm:text-sm font-black text-gray-900">
                  {{ order.price.toLocaleString('fa-IR') }}
                </span>
                <span class="text-[9px] text-gray-400 font-medium mr-0.5">تومان</span>
              </div>
            </div>

            <!-- Card Footer: Tracking code & Detail Button -->
            <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <span class="text-[10px] text-gray-400 font-mono">
                کد رهگیری: {{ order.trackingCode }}
              </span>

              <button
                type="button"
                [id]="'btn-order-details-' + order.id"
                (click)="selectedTrackingOrder.set(order)"
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 text-xs font-bold rounded-xl border border-black/[0.05] transition cursor-pointer flex items-center gap-1.5">
                <span>جزئیات بیشتر</span>
                <svg class="w-3.5 h-3.5 text-gray-500 transform rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- Empty State -->
        @if (filteredOrders().length === 0) {
          <div class="bg-white rounded-[26px] p-8 border border-black/[0.05] text-center shadow-xs my-6">
            <div class="w-16 h-16 rounded-full bg-gray-50 border border-gray-200/60 flex items-center justify-center text-3xl mx-auto mb-3">
              📋
            </div>
            <h3 class="text-sm font-black text-gray-800">سفارشی با این فیلتر یافت نشد</h3>
            <p class="text-xs text-gray-400 font-medium mt-1 mb-4">
              می‌توانید فیلتر وضعیت را روی «همه» قرار دهید یا ناهار جدید رزرو نمایید.
            </p>
            <button
              type="button"
              (click)="resetFilters()"
              class="px-4 py-2 bg-[#f97352] text-white text-xs font-black rounded-xl shadow-xs active:scale-95 transition cursor-pointer">
              نمایش همه سفارش‌ها
            </button>
          </div>
        }
      </div>

      <!-- Order Details & Live Tracking Modal -->
      @if (selectedTrackingOrder(); as trackingOrder) {
        <div
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 overscroll-contain"
          (touchmove)="$event.stopPropagation()">
          <!-- Backdrop -->
          <button
            type="button"
            class="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-xs cursor-pointer border-none touch-none"
            aria-label="بستن پنجره جزئیات"
            (touchmove)="$event.preventDefault()"
            (wheel)="$event.preventDefault()"
            (click)="selectedTrackingOrder.set(null)">
          </button>

          <!-- Modal Sheet Content -->
          <div
            class="relative bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-gray-100 z-10 max-h-[90vh] overflow-y-auto overscroll-contain no-scrollbar"
            (touchmove)="$event.stopPropagation()">
            
            <!-- Mobile Drag Indicator -->
            <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-3 sm:hidden"></div>

            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <h3 class="text-sm sm:text-base font-black text-gray-900">جزئیات و پیگیری سفارش</h3>
                <p class="text-[11px] text-gray-400 font-mono mt-0.5">کد سفارش: {{ trackingOrder.id }}</p>
              </div>

              <button
                type="button"
                (click)="selectedTrackingOrder.set(null)"
                aria-label="بستن"
                class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Child Info Banner -->
            <div class="mt-4 p-3.5 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-white border border-orange-200/80 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                  <img
                    [src]="foodStore.getChildAvatar(trackingOrder.childId, trackingOrder.childAvatar)"
                    [alt]="trackingOrder.childName"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer" />
                </div>
                <div>
                  <h4 class="text-xs font-black text-gray-900">{{ trackingOrder.childName }}</h4>
                  <p class="text-[11px] text-gray-600 mt-0.5">{{ trackingOrder.school }} • {{ trackingOrder.grade }}</p>
                </div>
              </div>

              <span
                [class]="
                  trackingOrder.status === 'active'
                    ? 'px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-black'
                    : 'px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black'
                ">
                {{ trackingOrder.status === 'active' ? 'در حال آماده‌سازی' : 'تحویل شده' }}
              </span>
            </div>

            <!-- Food Item Details -->
            <div class="mt-4 p-3.5 bg-[#fbfbfb] rounded-2xl border border-black/[0.04]">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                  {{ trackingOrder.foodEmoji }}
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs sm:text-sm font-black text-gray-900">{{ trackingOrder.foodTitle }}</h4>
                  @if (trackingOrder.foodSubtitle) {
                    <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">{{ trackingOrder.foodSubtitle }}</p>
                  }
                  <div class="flex items-center gap-2 text-[11px] text-gray-400 mt-2">
                    <span>{{ trackingOrder.date }}</span>
                    <span>•</span>
                    <span class="text-gray-700 font-bold">{{ trackingOrder.deliveryTime }} تحویل در بوفه</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stages / Stepper Timeline -->
            <div class="mt-4 p-4 rounded-2xl bg-gray-50 border border-black/[0.04]">
              <div class="flex items-center justify-between text-xs font-black text-gray-800 mb-3">
                <span>مراحل آماده‌سازی و توزیع</span>
                @if (trackingOrder.status === 'active') {
                  <span class="text-[#f97352] text-[11px] font-bold">مرحله ۳ از ۴ (در حال ارسال)</span>
                } @else {
                  <span class="text-emerald-600 text-[11px] font-bold">تکمیل شده ✓</span>
                }
              </div>

              <!-- Steps List -->
              <div class="space-y-3 px-1">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-bold text-gray-800">تایید سفارش و پرداخت</h5>
                      <span class="text-[10px] text-gray-400">ساعت ۰۸:۳۰</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-0.5">پرداخت موفق از اعتبار کیف پول</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-bold text-gray-800">طبخ بهداشتی و کنترل کیفیت</h5>
                      <span class="text-[10px] text-gray-400">ساعت ۱۰:۴۵</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-0.5">کیترینگ اختصاصی با بسته‌بندی بهداشتی گرم</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div [class]="trackingOrder.status === 'active' ? 'w-6 h-6 rounded-full bg-[#f97352] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse' : 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0'">
                    {{ trackingOrder.status === 'active' ? '🚚' : '✓' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h5 [class]="trackingOrder.status === 'active' ? 'text-xs font-black text-[#f97352]' : 'text-xs font-bold text-gray-800'">
                        ارسال به مدرسه
                      </h5>
                      <span class="text-[10px] text-gray-400">ساعت ۱۱:۴۰</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-0.5">با خودروی مجهز به گرم‌خانه برای حفظ تازگی غذا</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div [class]="trackingOrder.status === 'delivered' ? 'w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0' : 'w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold flex-shrink-0'">
                    {{ trackingOrder.status === 'delivered' ? '✓' : '📍' }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h5 [class]="trackingOrder.status === 'delivered' ? 'text-xs font-bold text-gray-800' : 'text-xs font-bold text-gray-400'">
                        تحویل در بوفه مدرسه
                      </h5>
                      <span class="text-[10px] text-gray-400">{{ trackingOrder.deliveryTime }}</span>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-0.5">تحویل گرم به دانش‌آموز در زنگ ناهار</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Summary -->
            <div class="mt-4 p-3.5 bg-gray-50 rounded-2xl flex items-center justify-between border border-black/[0.04]">
              <div>
                <span class="text-[11px] text-gray-500 block">مبلغ کل پرداخت شده</span>
                <span class="text-[10px] text-gray-400 font-mono">کد رهگیری: {{ trackingOrder.trackingCode }}</span>
              </div>
              <div class="text-left">
                <span class="text-sm font-black text-gray-900">{{ trackingOrder.price.toLocaleString('fa-IR') }}</span>
                <span class="text-[10px] text-gray-500 mr-1">تومان</span>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="mt-5 flex items-center gap-2">
              @if (trackingOrder.status === 'delivered') {
                <button
                  type="button"
                  (click)="handleReorder(trackingOrder); selectedTrackingOrder.set(null)"
                  class="flex-1 py-3 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer text-center">
                  سفارش مجدد این ناهار
                </button>
              }
              <button
                type="button"
                (click)="selectedTrackingOrder.set(null)"
                [class]="trackingOrder.status === 'delivered' ? 'px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer' : 'w-full py-3 bg-[#141517] hover:bg-black active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer'">
                بستن پنجره
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class OrdersPage implements OnDestroy {
  readonly foodStore = inject(FoodStore);
  private readonly document = inject(DOCUMENT);

  // Filter tab state: 'all' | 'active' | 'delivered'
  readonly activeFilter = signal<'all' | 'active' | 'delivered'>('all');

  // Selected order for live tracking modal
  readonly selectedTrackingOrder = signal<SchoolOrder | null>(null);

  constructor() {
    // قفل کردن اسکرول پس‌زمینه صفحه هنگام باز بودن مدال جزئیات سفارش
    effect(() => {
      const isModalOpen = !!this.selectedTrackingOrder();
      if (typeof document !== 'undefined' && this.document?.body) {
        if (isModalOpen) {
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

  // Computed count of active orders
  readonly activeCount = computed(() => {
    return this.foodStore.schoolOrders().filter((o) => o.status === 'active').length;
  });

  // Filtered orders based on active status filter
  readonly filteredOrders = computed(() => {
    const filter = this.activeFilter();

    return this.foodStore.schoolOrders().filter((order) => {
      // Status filter
      if (filter === 'active' && order.status !== 'active') return false;
      if (filter === 'delivered' && order.status !== 'delivered') return false;

      return true;
    });
  });

  resetFilters(): void {
    this.activeFilter.set('all');
  }

  handleReorder(order: SchoolOrder): void {
    if (order.childId) {
      this.foodStore.orderForChild(order.childId);
    } else {
      this.foodStore.goToMeals();
    }
  }
}
