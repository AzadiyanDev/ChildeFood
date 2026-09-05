import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
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

      <!-- Top Filter Section (Exactly styled like the transactions filter) -->
      <div class="bg-white rounded-[24px] p-3.5 border border-black/[0.05] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] mb-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-gray-800">فیلتر سفارش‌ها:</span>
            <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
              {{ filteredOrders().length }} مورد
            </span>
          </div>

          <!-- Filter Tabs (soft, rounded-full pill container matching transactions) -->
          <div class="flex items-center gap-1 bg-gray-100/90 p-1 rounded-full border border-black/[0.04]">
            <button
              id="filter-order-all"
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
              id="filter-order-active"
              type="button"
              (click)="activeFilter.set('active')"
              [class]="
                activeFilter() === 'active'
                  ? 'px-3.5 py-1.5 rounded-full bg-white text-gray-900 font-black text-[11px] shadow-xs transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-[11px] transition-all cursor-pointer'
              ">
              سفارش‌های فعال ({{ activeCount() }})
            </button>
            <button
              id="filter-order-delivered"
              type="button"
              (click)="activeFilter.set('delivered')"
              [class]="
                activeFilter() === 'delivered'
                  ? 'px-3.5 py-1.5 rounded-full bg-white text-gray-900 font-black text-[11px] shadow-xs transition-all cursor-pointer'
                  : 'px-3 py-1.5 rounded-full text-gray-500 hover:text-gray-900 font-bold text-[11px] transition-all cursor-pointer'
              ">
              تحویل شده
            </button>
          </div>
        </div>

        <!-- Optional Child Filter Quick Pills -->
        <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span class="text-[10px] text-gray-400 font-bold ml-1 flex-shrink-0">فرزند:</span>
          <button
            type="button"
            (click)="selectedChildFilter.set('all')"
            [class]="
              selectedChildFilter() === 'all'
                ? 'px-2.5 py-1 rounded-lg bg-[#141517] text-white text-[10px] font-black flex-shrink-0 transition-all cursor-pointer'
                : 'px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer'
            ">
            همه فرزندان
          </button>
          @for (child of foodStore.children(); track child.id) {
            <button
              type="button"
              (click)="selectedChildFilter.set(child.name)"
              [class]="
                selectedChildFilter() === child.name
                  ? 'px-2.5 py-1 rounded-lg bg-[#141517] text-white text-[10px] font-black flex-shrink-0 transition-all cursor-pointer'
                  : 'px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold flex-shrink-0 transition-all cursor-pointer'
              ">
              <span>{{ child.avatar }}</span>
              <span class="mr-1">{{ child.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Orders List -->
      <div class="space-y-4">
        @for (order of filteredOrders(); track order.id) {
          <div
            [id]="'order-full-card-' + order.id"
            class="bg-white rounded-[26px] p-5 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all">
            
            <!-- Card Header: Child Avatar, Name & School -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl bg-[#f7f7f8] border border-black/[0.05] flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                  {{ order.childAvatar }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs font-black text-gray-900 tracking-tight">
                      {{ order.childName }}
                    </h3>
                    <span class="text-[10px] text-gray-400 font-mono font-medium">
                      ({{ order.id }})
                    </span>
                  </div>
                  <p class="text-[11px] text-gray-500 font-medium mt-0.5">
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
                <span>{{ order.statusText }}</span>
              </span>
            </div>

            <!-- Food Item Box -->
            <div class="mt-3.5 bg-[#fbfbfb] rounded-2xl p-3.5 border border-black/[0.03] flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-2xl shadow-xs flex-shrink-0">
                  {{ order.foodEmoji }}
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs font-black text-gray-900 truncate">
                    {{ order.foodTitle }}
                  </h4>
                  @if (order.foodSubtitle) {
                    <p class="text-[10px] text-gray-500 truncate mt-0.5">
                      {{ order.foodSubtitle }}
                    </p>
                  }
                  <div class="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span>{{ order.date }}</span>
                    @if (order.deliveryTime) {
                      <span>•</span>
                      <span class="text-gray-600 font-bold">{{ order.deliveryTime }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Order Live Tracking Progress (Only for active orders) -->
            @if (order.status === 'active') {
              <div class="mt-3.5 p-3 rounded-2xl bg-orange-50/40 border border-orange-200/40">
                <div class="flex items-center justify-between text-[11px] font-bold text-gray-700 mb-2">
                  <span class="text-[#f97352]">مراحل توزیع ناهار مدرسه</span>
                  <span class="text-gray-500 text-[10px]">مرحله ۳ از ۴</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-center">
                  <div class="flex flex-col items-center">
                    <div class="w-full h-1.5 rounded-full bg-emerald-500"></div>
                    <span class="text-[9px] font-bold text-emerald-700 mt-1">ثبت</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="w-full h-1.5 rounded-full bg-emerald-500"></div>
                    <span class="text-[9px] font-bold text-emerald-700 mt-1">طبخ</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="w-full h-1.5 rounded-full bg-[#f97352] animate-pulse"></div>
                    <span class="text-[9px] font-black text-[#f97352] mt-1">ارسال</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <div class="w-full h-1.5 rounded-full bg-gray-200"></div>
                    <span class="text-[9px] font-medium text-gray-400 mt-1">تحویل</span>
                  </div>
                </div>
              </div>
            }

            <!-- Card Footer: Price, Tracking & Action Buttons -->
            <div class="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-sm font-black text-gray-900">
                    {{ order.price.toLocaleString('fa-IR') }}
                  </span>
                  <span class="text-[10px] text-gray-400 font-medium">تومان</span>
                </div>
                @if (order.trackingCode) {
                  <span class="text-[10px] text-gray-400 font-mono block mt-0.5">
                    کد رهگیری: {{ order.trackingCode }}
                  </span>
                }
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2">
                @if (order.status === 'active') {
                  <button
                    type="button"
                    (click)="selectedTrackingOrder.set(order)"
                    class="px-4 py-2 bg-[#141517] hover:bg-black active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer">
                    پیگیری زنده
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="handleReorder(order)"
                    class="px-4 py-2 bg-[#f97352] hover:bg-[#e05432] active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer">
                    سفارش مجدد
                  </button>
                }
              </div>
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

      <!-- Live Tracking Detail Modal -->
      @if (selectedTrackingOrder(); as trackingOrder) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div class="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-gray-100">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ trackingOrder.childAvatar }}</span>
                <div>
                  <h3 class="text-xs font-black text-gray-900">پیگیری سفارش {{ trackingOrder.id }}</h3>
                  <p class="text-[10px] text-gray-400">{{ trackingOrder.childName }} • {{ trackingOrder.school }}</p>
                </div>
              </div>
              <button
                type="button"
                (click)="selectedTrackingOrder.set(null)"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition cursor-pointer">
                ✕
              </button>
            </div>

            <div class="my-4 space-y-3">
              <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <span class="text-2xl">{{ trackingOrder.foodEmoji }}</span>
                <div>
                  <h4 class="text-xs font-black text-gray-900">{{ trackingOrder.foodTitle }}</h4>
                  <p class="text-[10px] text-gray-500">{{ trackingOrder.deliveryTime }} تحویل در بوفه</p>
                </div>
              </div>

              <!-- Tracking Steps -->
              <div class="space-y-3 px-2 pt-1">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <div>
                    <h5 class="text-xs font-black text-gray-800">تایید سفارش و پرداخت</h5>
                    <p class="text-[10px] text-gray-400">ساعت ۰۸:۳۰ صبح - موفق</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                  <div>
                    <h5 class="text-xs font-black text-gray-800">پخت و آماده‌سازی بهداشتی</h5>
                    <p class="text-[10px] text-gray-400">کیترینگ اختصاصی مدارس - کنترل کیفیت</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-[#f97352] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse">🚚</div>
                  <div>
                    <h5 class="text-xs font-black text-[#f97352]">در مسیر تحویل به مدرسه</h5>
                    <p class="text-[10px] text-gray-500">خودروی گرم نگه‌دارنده - تحویل تا ۱۲:۳۰</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 opacity-60">
                  <div class="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold flex-shrink-0">📍</div>
                  <div>
                    <h5 class="text-xs font-bold text-gray-600">تحویل به دانش‌آموز در بوفه</h5>
                    <p class="text-[10px] text-gray-400">همراه با نوشیدنی و بسته بهداشتی</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="selectedTrackingOrder.set(null)"
              class="w-full py-3 bg-[#141517] text-white text-xs font-black rounded-xl hover:bg-black active:scale-95 transition cursor-pointer">
              متوجه شدم
            </button>
          </div>
        </div>
      }

    </div>
  `,
})
export class OrdersPage {
  readonly foodStore = inject(FoodStore);

  // Filter tab state: 'all' | 'active' | 'delivered'
  readonly activeFilter = signal<'all' | 'active' | 'delivered'>('all');

  // Child filter: 'all' or child name
  readonly selectedChildFilter = signal<string>('all');

  // Selected order for live tracking modal
  readonly selectedTrackingOrder = signal<SchoolOrder | null>(null);

  // Computed count of active orders
  readonly activeCount = computed(() => {
    return this.foodStore.schoolOrders().filter((o) => o.status === 'active').length;
  });

  // Filtered orders based on active status filter and child filter
  readonly filteredOrders = computed(() => {
    const filter = this.activeFilter();
    const child = this.selectedChildFilter();

    return this.foodStore.schoolOrders().filter((order) => {
      // Status filter
      if (filter === 'active' && order.status !== 'active') return false;
      if (filter === 'delivered' && order.status !== 'delivered') return false;

      // Child filter
      if (child !== 'all' && order.childName !== child) return false;

      return true;
    });
  });

  resetFilters(): void {
    this.activeFilter.set('all');
    this.selectedChildFilter.set('all');
  }

  handleReorder(order: SchoolOrder): void {
    if (order.childId) {
      this.foodStore.orderForChild(order.childId);
    } else {
      this.foodStore.goToMeals();
    }
  }
}
